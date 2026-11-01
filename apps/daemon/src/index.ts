import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port and access token
const PORT = parseInt(process.env.PORT || '3000', 10);
const ACCESS_TOKEN = process.env.GATEWAY_TOKEN || crypto.randomBytes(16).toString('hex');

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Register WebSockets
await server.register(fastifyWebsocket);

// Serve Web Client if dist exists
const webDistPath = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDistPath)) {
  await server.register(fastifyStatic, {
    root: webDistPath,
    prefix: '/'
  });
} else {
  server.get('/', async (_req, reply) => {
    reply.type('text/html').send(`
      <!doctype html>
      <html>
        <head><title>Agent Gate Daemon</title></head>
        <body style="font-family:sans-serif;background:#090d16;color:#e2e8f0;padding:2rem;">
          <h2>Agent Gate Daemon Online</h2>
          <p>Web client not yet built. Run <code>npm run build -w apps/web</code> to compile mobile interface.</p>
          <p>Access Token: <code>${ACCESS_TOKEN}</code></p>
        </body>
      </html>
    `);
  });
}

// Health check endpoint
server.get('/health', async (_req, reply) => {
  return reply.send({
    status: 'ok',
    version: '0.1.0',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// WebSocket endpoint with token authentication via query parameter
server.get('/ws', { websocket: true }, (socket, req) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const clientToken = url.searchParams.get('token');

  if (clientToken !== ACCESS_TOKEN && process.env.NODE_ENV === 'production') {
    socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized: Invalid token' }));
    socket.close(1008, 'Unauthorized');
    return;
  }

  socket.send(JSON.stringify({
    type: 'connected',
    message: 'Welcome to Agent Gate Mobile Gateway',
    timestamp: new Date().toISOString()
  }));

  socket.on('message', (data: Buffer) => {
    try {
      const parsed = JSON.parse(data.toString());
      server.log.info({ messageType: parsed.type }, 'WebSocket message received');

      if (parsed.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (err) {
      server.log.warn('Invalid JSON received on WebSocket');
    }
  });

  socket.on('close', () => {
    server.log.info('WebSocket client disconnected');
  });
});

// Graceful signal handling
let tunnelProcess: any = null;

async function shutdown(signal: string) {
  server.log.info({ signal }, 'Shutting down daemon gracefully...');

  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
      server.log.info('Cloudflare tunnel terminated cleanly');
    } catch (e) {
      // Ignore process already dead
    }
  }

  await server.close();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start server
try {
  await server.listen({ port: PORT, host: '0.0.0.0' });

  const localUrl = `http://localhost:${PORT}?token=${ACCESS_TOKEN}`;
  console.log('\n======================================================');
  console.log('🚀 Agent Gate Daemon is running on port', PORT);
  console.log('🔑 Access Token:', ACCESS_TOKEN);
  console.log('📱 Local Mobile URL:', localUrl);
  console.log('======================================================\n');
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
