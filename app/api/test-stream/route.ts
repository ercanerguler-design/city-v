import { NextRequest, NextResponse } from 'next/server';

/**
 * Test MJPEG Stream Generator
 * Demo amaçlı basit MJPEG stream üretir
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const boundary = 'frame';
      let frameCount = 0;
      
      // Basit test frame'i oluştur (SVG)
      const generateFrame = () => {
        const time = new Date().toLocaleTimeString();
        frameCount++;
        
        const svg = `
          <svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
            <rect width="640" height="480" fill="#1a1a2e"/>
            <circle cx="320" cy="240" r="50" fill="#0f3460" opacity="0.5"/>
            <circle cx="${320 + Math.sin(frameCount / 10) * 100}" cy="${240 + Math.cos(frameCount / 10) * 100}" r="30" fill="#e94560"/>
            <text x="320" y="240" text-anchor="middle" font-size="24" fill="white" font-family="Arial">
              CityV Demo Stream
            </text>
            <text x="320" y="280" text-anchor="middle" font-size="18" fill="#aaa" font-family="Arial">
              ${time} - Frame ${frameCount}
            </text>
            <text x="320" y="320" text-anchor="middle" font-size="14" fill="#666" font-family="monospace">
              Status: Active • FPS: 30 • Resolution: 640x480
            </text>
          </svg>
        `;
        
        return Buffer.from(svg);
      };
      
      // MJPEG header gönder
      const sendFrame = () => {
        try {
          const frame = generateFrame();
          
          // MJPEG multipart boundary
          const header = encoder.encode(
            `--${boundary}\r\n` +
            `Content-Type: image/svg+xml\r\n` +
            `Content-Length: ${frame.length}\r\n\r\n`
          );
          
          controller.enqueue(header);
          controller.enqueue(frame);
          controller.enqueue(encoder.encode('\r\n'));
        } catch (error) {
          console.error('Frame generation error:', error);
          controller.error(error);
        }
      };
      
      // Her 33ms'de bir frame gönder (30 FPS)
      const interval = setInterval(() => {
        sendFrame();
      }, 33);
      
      // Cleanup
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
