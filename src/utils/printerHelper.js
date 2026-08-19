// src/utils/printerHelper.js — ESC/POS helpers with dynamic printer IP
import { Capacitor } from '@capacitor/core';

// ─── Printer IP ──────────────────────────────────────────────────────────────
const DEFAULT_PRINTER_IP = '192.168.1.6';

/** Reads printer IP from localStorage — falls back to default if not set */
export function getPrinterIP() {
  return localStorage.getItem('printer_ip') || DEFAULT_PRINTER_IP;
}

/** Saves printer IP to localStorage */
export function setPrinterIP(ip) {
  localStorage.setItem('printer_ip', ip);
}

/**
 * Returns the correct URL for the print server.
 * - Dev:  /api/print  (intercepted by vite-print-plugin)
 * - Prod: http://localhost:3001/print  (standalone print-server/server.js)
 */
function getPrintServerUrl() {
  return import.meta.env.PROD
    ? 'http://localhost:3001/print'
    : '/api/print';
}

// ─── ESC/POS conversion ───────────────────────────────────────────────────────
/**
 * Converts an HTML Canvas to ESC/POS Raster command bytes.
 * @param {HTMLCanvasElement} canvas
 * @returns {Uint8Array} ESC/POS bytes
 */
export function canvasToEscPos(canvas) {
  const ctx    = canvas.getContext('2d');
  const width  = canvas.width;
  const height = canvas.height;

  const bytesPerRow = Math.ceil(width / 8);
  const imageData   = ctx.getImageData(0, 0, width, height).data;

  const header = new Uint8Array([
    0x1D, 0x76, 0x30, 0x00,
    bytesPerRow & 0xFF, (bytesPerRow >> 8) & 0xFF,
    height & 0xFF, (height >> 8) & 0xFF
  ]);

  const data = new Uint8Array(bytesPerRow * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx   = (y * width + x) * 4;
      const r     = imageData[idx];
      const g     = imageData[idx + 1];
      const b     = imageData[idx + 2];
      const a     = imageData[idx + 3];
      const bright = r * 0.299 + g * 0.587 + b * 0.114;
      const isBlack = a > 128 && bright < 128;
      if (isBlack) {
        const byteIndex = y * bytesPerRow + Math.floor(x / 8);
        const bit = 7 - (x % 8);
        data[byteIndex] |= (1 << bit);
      }
    }
  }

  const initCmd = new Uint8Array([0x1B, 0x40]);
  const cutCmd  = new Uint8Array([0x0A, 0x0A, 0x0A, 0x0A, 0x1D, 0x56, 0x42, 0x00]);

  const result = new Uint8Array(initCmd.length + header.length + data.length + cutCmd.length);
  result.set(initCmd, 0);
  result.set(header, initCmd.length);
  result.set(data, initCmd.length + header.length);
  result.set(cutCmd, initCmd.length + header.length + data.length);

  return result;
}

// ─── ArrayBuffer → Base64 ────────────────────────────────────────────────────
function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// ─── TCP Send (native Capacitor only) ────────────────────────────────────────
export async function sendToPrinterTCP(ip, dataArray) {
  if (!Capacitor.isNativePlatform()) {
    console.warn('TCP printing requires native app. Falling back to HTTP.');
    return false;
  }
  const { TcpSocket } = await import('capacitor-tcp-socket');
  const base64Data = bufferToBase64(dataArray.buffer);
  let client = null;
  try {
    const connectRes = await TcpSocket.connect({ ipAddress: ip, port: 9100 });
    client = connectRes.client;
    await TcpSocket.send({ client, data: base64Data, encoding: 'base64' });
    console.log('TCP print sent to', ip);
    return true;
  } catch (err) {
    console.error('TCP print failed:', err);
    throw err;
  } finally {
    if (client !== null) {
      try { await TcpSocket.disconnect({ client }); } catch {}
    }
  }
}

// ─── Universal print helper ───────────────────────────────────────────────────
/**
 * Print a canvas.
 * - Native: TCP ESC/POS directly to printer
 * - Browser dev:  POST /api/print  (vite-print-plugin)
 * - Browser prod: POST http://localhost:3001/print  (print-server/server.js)
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} [printerIp]  optional override; otherwise reads from localStorage
 */
export async function printCanvas(canvas, printerIp) {
  const ip = printerIp || getPrinterIP();

  if (Capacitor.isNativePlatform()) {
    const escPosData = canvasToEscPos(canvas);
    await sendToPrinterTCP(ip, escPosData);
    return;
  }

  // Browser path: POST image to print server
  const base64Image = canvas.toDataURL('image/png');
  const url = getPrintServerUrl();

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ image: base64Image, ip }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status} from print server`);
  }
}
