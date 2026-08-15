import { TcpSocket } from 'capacitor-tcp-socket';
import { Capacitor } from '@capacitor/core';

/**
 * Converts an HTML Canvas to ESC/POS Raster command bytes.
 * @param {HTMLCanvasElement} canvas
 * @returns {Uint8Array} ESC/POS bytes
 */
export function canvasToEscPos(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Calculate bytes per row (must be multiple of 8)
  const bytesPerRow = Math.ceil(width / 8);
  const imageData = ctx.getImageData(0, 0, width, height).data;

  // ESC/POS Print Raster Image Command
  // GS v 0 0 xL xH yL yH d1...dk
  const header = new Uint8Array([
    0x1D, 0x76, 0x30, 0x00, 
    bytesPerRow & 0xFF, (bytesPerRow >> 8) & 0xFF,
    height & 0xFF, (height >> 8) & 0xFF
  ]);

  const data = new Uint8Array(bytesPerRow * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Get pixel color
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];
      const a = imageData[idx + 3];

      // Convert to grayscale
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      
      // If alpha is high and brightness is low, it's black (1 in thermal).
      // Background is usually white (alpha 0 or white color)
      const isBlack = a > 128 && brightness < 128;

      if (isBlack) {
        const byteIndex = y * bytesPerRow + Math.floor(x / 8);
        const bit = 7 - (x % 8);
        data[byteIndex] |= (1 << bit);
      }
    }
  }

  // Add commands: Initialize (ESC @), image data, line feeds, cut paper (GS V 66)
  const initCmd = new Uint8Array([0x1B, 0x40]); 
  const cutCmd = new Uint8Array([0x0A, 0x0A, 0x0A, 0x0A, 0x1D, 0x56, 0x42, 0x00]);

  const result = new Uint8Array(initCmd.length + header.length + data.length + cutCmd.length);
  result.set(initCmd, 0);
  result.set(header, initCmd.length);
  result.set(data, initCmd.length + header.length);
  result.set(cutCmd, initCmd.length + header.length + data.length);

  return result;
}

/**
 * ArrayBuffer to Base64 (polyfill)
 */
function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Sends data via TCP to printer
 * @param {string} ip Printer IP
 * @param {Uint8Array} dataArray ESC/POS data
 */
export async function sendToPrinterTCP(ip, dataArray) {
  if (!Capacitor.isNativePlatform()) {
    console.warn("Not on a native platform. Printing via TCP socket is only supported on native devices.");
    return;
  }

  const base64Data = bufferToBase64(dataArray.buffer);

  let client = null;
  try {
    const connectRes = await TcpSocket.connect({
      ipAddress: ip,
      port: 9100,
    });
    client = connectRes.client;

    await TcpSocket.send({
      client,
      data: base64Data,
      encoding: 'base64'
    });
    
    console.log("TCP print job sent to " + ip);
  } catch (err) {
    console.error("TCP Printing failed", err);
    throw err;
  } finally {
    if (client !== null) {
      try {
        await TcpSocket.disconnect({ client });
      } catch(e) {}
    }
  }
}
