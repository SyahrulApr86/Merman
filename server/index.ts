import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { fileHandler } from './handlers/file-handler';
import { logger } from './utils/logger';
import { initializeMinIO } from '../src/lib/minio';
import { createRedisPubClient, createRedisSubClient } from '../src/lib/redis';

const PORT = parseInt(process.env.WS_PORT || '3001');
const CORS_ORIGIN = process.env.WS_CORS_ORIGIN || 'http://localhost:3000';

async function main() {
    logger.info('Starting WebSocket server...');

    // Initialize MinIO buckets
    try {
        await initializeMinIO();
    } catch (error) {
        logger.error({ error }, 'Failed to initialize MinIO');
        // Continue without MinIO - will use database fallback
    }

    // Create HTTP server
    const httpServer = createServer((req, res) => {
        // Health check endpoint
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
            return;
        }

        res.writeHead(404);
        res.end();
    });

    // Create Socket.IO server
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: CORS_ORIGIN.split(','),
            credentials: true,
            methods: ['GET', 'POST'],
        },
        // Performance optimizations
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 30000,
        maxHttpBufferSize: 5e6, // 5MB max message size
        // Transports
        transports: ['websocket', 'polling'],
    });

    // Setup Redis adapter for horizontal scaling
    try {
        const pubClient = createRedisPubClient();
        const subClient = createRedisSubClient();

        await pubClient.connect();
        await subClient.connect();

        io.adapter(createAdapter(pubClient, subClient));
        logger.info('✅ Redis adapter connected');
    } catch (error) {
        logger.warn({ error }, 'Redis adapter not available, running in standalone mode');
    }

    // Apply global middleware
    io.use(authMiddleware);
    io.use(rateLimitMiddleware);

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        const username = socket.data.username;

        logger.info(
            { userId, username, socketId: socket.id },
            'Client connected'
        );

        // Join user-specific room
        socket.join(`user:${userId}`);

        // Send connection acknowledgment
        socket.emit('connected', {
            userId,
            socketId: socket.id,
            timestamp: Date.now(),
        });

        // Register file handlers
        fileHandler(io, socket);

        // Disconnect handler
        socket.on('disconnect', (reason) => {
            logger.info(
                { userId, socketId: socket.id, reason },
                'Client disconnected'
            );
        });

        // Error handler
        socket.on('error', (error) => {
            logger.error(
                { userId, socketId: socket.id, error },
                'Socket error'
            );
        });
    });

    // Graceful shutdown
    const shutdown = async () => {
        logger.info('Shutting down WebSocket server...');

        io.close(() => {
            logger.info('All connections closed');
            process.exit(0);
        });

        // Force exit after 10 seconds
        setTimeout(() => {
            logger.warn('Force shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Start server
    httpServer.listen(PORT, () => {
        logger.info(`🚀 WebSocket server running on port ${PORT}`);
        logger.info(`📡 CORS origin: ${CORS_ORIGIN}`);
    });
}

main().catch((error) => {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
});
