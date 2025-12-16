import { Socket } from 'socket.io';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger';

// Use in-memory rate limiter for simplicity
// In production with multiple instances, use RateLimiterRedis
const rateLimiter = new RateLimiterMemory({
    points: 100, // Number of points
    duration: 1, // Per second
    blockDuration: 60, // Block for 60 seconds if exceeded
});

const heavyOperationLimiter = new RateLimiterMemory({
    points: 10, // More restrictive for heavy operations
    duration: 1,
    blockDuration: 60,
});

export async function rateLimitMiddleware(
    socket: Socket,
    next: (err?: Error) => void
): Promise<void> {
    try {
        const userId = socket.data.userId || socket.id;
        await rateLimiter.consume(userId);
        next();
    } catch (error) {
        logger.warn(
            { socketId: socket.id, userId: socket.data.userId },
            'Rate limit exceeded on connection'
        );
        next(new Error('Rate limit exceeded. Please try again later.'));
    }
}

// For use within event handlers
export async function checkRateLimit(
    userId: string,
    isHeavyOperation: boolean = false
): Promise<{ allowed: boolean; retryAfter?: number }> {
    const limiter = isHeavyOperation ? heavyOperationLimiter : rateLimiter;

    try {
        await limiter.consume(userId);
        return { allowed: true };
    } catch (error: unknown) {
        const rateLimitError = error as { msBeforeNext?: number };
        const retryAfter = Math.ceil((rateLimitError.msBeforeNext || 1000) / 1000);
        logger.warn({ userId, retryAfter }, 'Rate limit exceeded');
        return { allowed: false, retryAfter };
    }
}
