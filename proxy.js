#!/usr/bin/env node
/**
 * Lightweight reverse proxy (port 5000):
 *   /api/*  → Express API on port 8080
 *   /*      → Expo web dev server on port 3000
 */
const http = require('http');

const EXPO_PORT = 3000;
const API_PORT  = 8080;

function proxy(req, res, targetPort) {
  const options = {
    hostname: 'localhost',
    port:     targetPort,
    path:     req.url,
    method:   req.method,
    headers:  { ...req.headers, host: `localhost:${targetPort}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Forward status and headers
    const headers = { ...proxyRes.headers };
    // Allow any origin (needed for Replit proxy)
    headers['access-control-allow-origin'] = '*';
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end(`Proxy error: ${err.message}`);
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/') || req.url === '/api') {
    proxy(req, res, API_PORT);
  } else {
    proxy(req, res, EXPO_PORT);
  }
});

// Also handle WebSocket upgrades (for Metro HMR if needed)
server.on('upgrade', (req, socket, head) => {
  const targetPort = req.url.startsWith('/api') ? API_PORT : EXPO_PORT;
  const options = {
    hostname: 'localhost',
    port:     targetPort,
    path:     req.url,
    method:   req.method,
    headers:  req.headers,
  };
  const proxyReq = http.request(options);
  proxyReq.on('upgrade', (proxyRes, proxySocket) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers).map(([k,v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n'
    );
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  proxyReq.on('error', () => socket.destroy());
  proxyReq.end();
});

server.listen(5000, () => {
  console.log('Proxy listening on :5000  (Expo→3000, API→8080)');
});
