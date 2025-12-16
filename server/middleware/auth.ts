import { Socket } from 'socket.io';
import { jwtVerify } from 'jose';
import { logger } from '../utils/logger';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-key-change-me'
);

export interface AuthenticatedSocket extends Socket {
    data: {
        userId: string;
        username: string;
        email: string;
    };
}

export async function authMiddleware(
    socket: Socket,
    next: (err?: Error) => void
): Promise<void> {
    try {
        // Get token from handshake auth or headers
        const token =
            socket.handshake.auth.token ||
            socket.handshake.headers.authorization?.replace('Bearer ', '') ||
            extractTokenFromCookie(socket.handshake.headers.cookie);

        if (!token) {
            logger.warn({ socketId: socket.id }, 'No authentication token provided');
            return next(new Error('Authentication token required'));
        }

        // Verify JWT
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            algorithms: ['HS256'],
        });

        // Extract user data from payload
        const user = payload.user as {
            id: string;
            username: string;
            email: string;
        };

        if (!user || !user.id) {
            logger.warn({ socketId: socket.id }, 'Invalid token payload');
            return next(new Error('Invalid authentication token'));
        }

        // Attach user data to socket
        socket.data.userId = user.id;
        socket.data.username = user.username;
        socket.data.email = user.email;

        logger.debug(
            { socketId: socket.id, userId: user.id },
            'Socket authenticated'
        );

        next();
    } catch (error) {
        logger.error({ socketId: socket.id, error }, 'Authentication failed');
        next(new Error('Invalid authentication token'));
    }
}

function extractTokenFromCookie(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies['session'] || null;
}
