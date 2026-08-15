import net from 'net';
import { PNG } from 'pngjs';

// Converts a PNG buffer to ESC/POS Raster Image commands
function generateEscPosRaster(pngBuffer) {
  return new Promise((resolve, reject) => {
    new PNG().parse(pngBuffer, (err, png) => {
      if (err) return reject(err);

      const width = png.width;
      const height = png.height;
      
      // Calculate bytes per row (8 pixels per byte)
      const widthBytes = Math.ceil(width / 8);
      
      const rasterData = Buffer.alloc(widthBytes * height);

      // Convert pixels to monochrome bits
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (width * y + x) << 2;
          const r = png.data[idx];
          const g = png.data[idx + 1];
          const b = png.data[idx + 2];
          const a = png.data[idx + 3];

          // Threshold: if alpha is high and pixel is dark, make it black (1)
          const isBlack = a > 128 && (r + g + b) / 3 < 128;
          
          if (isBlack) {
            const byteIndex = y * widthBytes + Math.floor(x / 8);
            const bitIndex = 7 - (x % 8);
            rasterData[byteIndex] |= (1 << bitIndex);
          }
        }
      }

      // ESC/POS Commands
      const init = Buffer.from([0x1B, 0x40]); // ESC @
      const center = Buffer.from([0x1B, 0x61, 0x01]); // ESC a 1 (center)
      
      // GS v 0 command
      const xL = widthBytes % 256;
      const xH = Math.floor(widthBytes / 256);
      const yL = height % 256;
      const yH = Math.floor(height / 256);
      const printRaster = Buffer.from([0x1D, 0x76, 0x30, 0, xL, xH, yL, yH]);
      
      const feed = Buffer.from([0x1B, 0x64, 0x03]); // ESC d 3 (feed 3 lines)
      const cut = Buffer.from([0x1D, 0x56, 0x00]); // GS V 0 (cut)

      resolve(Buffer.concat([init, center, printRaster, rasterData, feed, cut]));
    });
  });
}

export default function printerPlugin() {
  return {
    name: 'vite-plugin-escpos-printer',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/print' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString() });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const ip = data.ip || '192.168.1.6';
              const port = data.port || 9100;
              
              if (!data.image) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'No image provided' }));
              }

              // Extract base64 part
              const base64Data = data.image.replace(/^data:image\/png;base64,/, "");
              const imageBuffer = Buffer.from(base64Data, 'base64');
              
              // Generate ESC/POS commands
              const escposBuffer = await generateEscPosRaster(imageBuffer);

              // Send to printer
              const client = new net.Socket();
              
              // Set connection timeout
              client.setTimeout(5000);
              
              client.on('timeout', () => {
                client.destroy();
                if (!res.headersSent) {
                  res.statusCode = 504;
                  res.end(JSON.stringify({ error: 'Printer connection timeout' }));
                }
              });

              client.connect(port, ip, () => {
                console.log(`🖨️  Printing to ${ip}:${port}...`);
                client.write(escposBuffer);
                client.end();
                if (!res.headersSent) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                }
              });

              client.on('error', (err) => {
                console.error(`Printer Error:`, err.message);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
              
            } catch (err) {
              console.error(err);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            }
          });
        } else {
          next();
        }
      });
    }
  }
}
