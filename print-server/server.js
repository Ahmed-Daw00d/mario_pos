/**
 * print-server/server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone HTTP→TCP printer bridge for Pizzaria da Mario POS.
 *
 * Usage:
 *   cd print-server && npm install && node server.js
 *
 * For permanent background running (recommended on cashier PC):
 *   npm install -g pm2
 *   pm2 start server.js --name pos-printer
 *   pm2 save && pm2 startup
 *
 * Endpoints:
 *   POST /print      { image: "data:image/png;base64,...", ip?, port? }
 *   POST /print-raw  { data: "<base64 ESC/POS bytes>", ip?, port? }
 *   GET  /status     Health check
 * ─────────────────────────────────────────────────────────────────────────────
 */
const express = require('express');
const cors    = require('cors');
const net     = require('net');
const { PNG } = require('pngjs');

const app = express();
const PORT = process.env.PORT || 3001;
const DEFAULT_PRINTER_IP   = process.env.PRINTER_IP   || '192.168.1.6';
const DEFAULT_PRINTER_PORT = parseInt(process.env.PRINTER_PORT || '9100', 10);
const TCP_TIMEOUT_MS = 8000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', /\.local$/, /^http:\/\/192\.168\./],
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));

// ─── ESC/POS Generation ───────────────────────────────────────────────────────
/**
 * Converts a PNG Buffer to ESC/POS raster image bytes.
 * @param {Buffer} pngBuffer
 * @returns {Promise<Buffer>}
 */
function generateEscPos(pngBuffer) {
  return new Promise((resolve, reject) => {
    new PNG().parse(pngBuffer, (err, png) => {
      if (err) return reject(err);

      const { width, height, data } = png;
      const widthBytes = Math.ceil(width / 8);
      const rasterData = Buffer.alloc(widthBytes * height, 0);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (width * y + x) << 2;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
          const isBlack = a > 128 && brightness < 128;
          if (isBlack) {
            const byteIdx = y * widthBytes + Math.floor(x / 8);
            rasterData[byteIdx] |= (1 << (7 - (x % 8)));
          }
        }
      }

      const xL = widthBytes % 256;
      const xH = Math.floor(widthBytes / 256);
      const yL = height % 256;
      const yH = Math.floor(height / 256);

      const parts = [
        Buffer.from([0x1B, 0x40]),                           // ESC @ — init
        Buffer.from([0x1B, 0x61, 0x01]),                     // ESC a 1 — center
        Buffer.from([0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH]), // GS v 0 — raster
        rasterData,
        Buffer.from([0x0A, 0x0A, 0x0A, 0x0A]),               // 4× line feeds
        Buffer.from([0x1D, 0x56, 0x42, 0x00]),               // GS V 66 — cut
      ];
      resolve(Buffer.concat(parts));
    });
  });
}

// ─── TCP Send ─────────────────────────────────────────────────────────────────
/**
 * Sends a raw Buffer to the thermal printer via TCP.
 * @param {string} ip
 * @param {number} port
 * @param {Buffer} buffer
 * @returns {Promise<void>}
 */
function sendToPrinter(ip, port, buffer) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let settled = false;

    function settle(fn, arg) {
      if (settled) return;
      settled = true;
      client.destroy();
      fn(arg);
    }

    client.setTimeout(TCP_TIMEOUT_MS);

    client.on('timeout', () =>
      settle(reject, new Error(`Printer timeout after ${TCP_TIMEOUT_MS}ms at ${ip}:${port}`))
    );
    client.on('error', err =>
      settle(reject, new Error(`TCP error: ${err.message}`))
    );
    client.on('close', () => settle(resolve));

    client.connect(port, ip, () => {
      console.log(`🖨️  Connected to ${ip}:${port}, sending ${buffer.length} bytes`);
      client.write(buffer, () => {
        console.log(`✅ Data sent. Closing connection.`);
        client.end();
      });
    });
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    printer: { ip: DEFAULT_PRINTER_IP, port: DEFAULT_PRINTER_PORT },
    uptime: process.uptime(),
  });
});

// Print from PNG base64 image
app.post('/print', async (req, res) => {
  const { image, ip, port, test } = req.body || {};
  const printerIp   = ip   || DEFAULT_PRINTER_IP;
  const printerPort = parseInt(port || DEFAULT_PRINTER_PORT, 10);

  // Test connectivity only (no image needed)
  if (test) {
    try {
      await sendToPrinter(printerIp, printerPort, Buffer.from([0x1B, 0x40])); // ESC @ — just init
      return res.json({ success: true, message: 'Printer reachable' });
    } catch (err) {
      return res.status(503).json({ error: err.message });
    }
  }

  if (!image) {
    return res.status(400).json({ error: 'Missing image field' });
  }

  try {
    const base64Data  = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const escPos      = await generateEscPos(imageBuffer);

    await sendToPrinter(printerIp, printerPort, escPos);
    res.json({ success: true, bytes: escPos.length });
  } catch (err) {
    console.error('❌ Print error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Print raw ESC/POS bytes (already converted)
app.post('/print-raw', async (req, res) => {
  const { data, ip, port } = req.body || {};
  const printerIp   = ip   || DEFAULT_PRINTER_IP;
  const printerPort = parseInt(port || DEFAULT_PRINTER_PORT, 10);

  if (!data) return res.status(400).json({ error: 'Missing data field' });

  try {
    const buffer = Buffer.from(data, 'base64');
    await sendToPrinter(printerIp, printerPort, buffer);
    res.json({ success: true, bytes: buffer.length });
  } catch (err) {
    console.error('❌ Print-raw error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🍕 Pizzaria da Mario — Print Server        ║');
  console.log(`║   Running on http://0.0.0.0:${PORT}              ║`);
  console.log(`║   Default printer: ${DEFAULT_PRINTER_IP}:${DEFAULT_PRINTER_PORT}      ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/status`);
  console.log(`  POST http://localhost:${PORT}/print      — { image, ip?, port? }`);
  console.log(`  POST http://localhost:${PORT}/print-raw  — { data (base64 ESC/POS), ip?, port? }`);
  console.log('');
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
