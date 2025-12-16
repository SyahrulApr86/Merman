import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Main Redis client
export const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on('connect', () => {
    console.log('✅ Redis connected');
});

redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
});

redis.on('close', () => {
    console.log('🔌 Redis connection closed');
});

// Create duplicate connections for pub/sub
export function createRedisPubClient(): Redis {
    return new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
    });
}

export function createRedisSubClient(): Redis {
    return new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
    });
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

export async function cacheSet(
    key: string,
    value: unknown,
    ttl: number = 3600
): Promise<void> {
    try {
        await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

export async function cacheDel(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch (error) {
        console.error('Cache delete error:', error);
    }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error('Cache delete pattern error:', error);
    }
}

// Check if key exists
export async function cacheExists(key: string): Promise<boolean> {
    try {
        const exists = await redis.exists(key);
        return exists === 1;
    } catch (error) {
        console.error('Cache exists error:', error);
        return false;
    }
}

// Increment counter (for rate limiting)
export async function incrementCounter(
    key: string,
    ttl: number = 60
): Promise<number> {
    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, ttl);
    const results = await multi.exec();
    return results?.[0]?.[1] as number || 0;
}

// Pub/Sub helpers
export async function publish(channel: string, message: unknown): Promise<void> {
    await redis.publish(channel, JSON.stringify(message));
}

// Lock mechanism for distributed operations
export async function acquireLock(
    key: string,
    ttl: number = 30
): Promise<boolean> {
    const result = await redis.set(`lock:${key}`, '1', 'EX', ttl, 'NX');
    return result === 'OK';
}

export async function releaseLock(key: string): Promise<void> {
    await redis.del(`lock:${key}`);
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
    await redis.quit();
}
