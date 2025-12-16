# WebSocket + MinIO Setup Guide

Dokumentasi lengkap untuk setup WebSocket real-time saving dengan MinIO object storage di Merman IDE.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Client (Browser)                               │
│  ┌─────────────┐         ┌──────────────┐      │
│  │ Monaco      │         │ WebSocket    │      │
│  │ Editor      │────────▶│ Client       │      │
│  └─────────────┘         └──────┬───────┘      │
└─────────────────────────────────┼──────────────┘
                                  │ WS Connection
                                  ▼
┌──────────────────────────────────────────────────┐
│  WebSocket Server (Node.js + Socket.IO)          │
│  ├─ Auth Middleware (JWT)                        │
│  ├─ Rate Limiter                                 │
│  └─ File Handler → MinIO + PostgreSQL            │
└──────────┬──────────────┬──────────┬─────────────┘
           │              │          │
    ┌──────▼─────┐ ┌─────▼─────┐ ┌─▼──────┐
    │ PostgreSQL │ │   Redis   │ │ MinIO  │
    │ (Metadata) │ │  (Cache)  │ │(Files) │
    └────────────┘ └───────────┘ └────────┘
```

## Quick Start

### 1. Start Infrastructure

```bash
# Start PostgreSQL, Redis, MinIO
npm run docker:up

# Atau manual:
docker-compose up -d
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan:

```env
DATABASE_URL="postgres://merman:merman_password@localhost:5439/merman"
REDIS_URL="redis://localhost:6379"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="merman"
MINIO_SECRET_KEY="merman_minio_password"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

### 3. Run Database Migration

```bash
npm run db:push
```

### 4. Start Development Servers

```bash
# Option 1: Run both Next.js and WebSocket server
npm run dev:all

# Option 2: Run separately
npm run dev      # Terminal 1: Next.js (port 3000)
npm run dev:ws   # Terminal 2: WebSocket (port 3001)
```

### 5. Access Applications

- **Main App**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (login: merman / merman_minio_password)
- **WebSocket Server**: ws://localhost:3001

## File Structure

```
/server
├── index.ts              # Main WebSocket server entry
├── handlers/
│   └── file-handler.ts   # File operations (save, load, delete)
├── middleware/
│   ├── auth.ts          # JWT authentication
│   └── rate-limit.ts    # Rate limiting
└── utils/
    └── logger.ts        # Pino logger

/src
├── websocket/
│   ├── client.ts        # Browser WebSocket client
│   ├── hooks.ts         # React hooks (useRealtimeEditor, etc)
│   ├── types.ts         # TypeScript types
│   └── index.ts         # Exports
├── lib/
│   ├── minio.ts         # MinIO client & helpers
│   └── redis.ts         # Redis client & helpers
└── db/
    └── schema.ts        # Drizzle schema (updated for MinIO)
```

## WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `file:update` | `{ fileId, content, projectId }` | Save file to MinIO |
| `file:load` | `{ fileId }` | Load file from MinIO |
| `file:delete` | `{ fileId }` | Delete file |
| `file:versions` | `{ fileId }` | Get version history |
| `file:restore` | `{ fileId, versionId }` | Restore old version |
| `project:subscribe` | `projectId` | Join project room |
| `project:unsubscribe` | `projectId` | Leave project room |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ userId, socketId }` | Connection established |
| `file:updated` | `{ fileId, userId, size }` | File updated by another user |
| `user:joined` | `{ userId, username }` | User joined project |
| `user:left` | `{ userId, username }` | User left project |

## React Hooks Usage

### Basic Usage

```tsx
import { useRealtimeEditor } from '@/websocket';

function MyEditor() {
    const projectId = 'your-project-id';

    const {
        isConnected,
        connectionStatus,
        updateFile,
        loadFile,
        saveStatus,
    } = useRealtimeEditor(projectId);

    const handleSave = async () => {
        await updateFile({
            fileId: 'file-id',
            content: 'new content',
            projectId,
        });
    };

    return (
        <div>
            <span>{isConnected ? 'Connected' : 'Offline'}</span>
            <span>{saveStatus}</span>
        </div>
    );
}
```

### Listen for Updates

```tsx
import { useFileUpdates } from '@/websocket';

function MyEditor() {
    useFileUpdates((event) => {
        console.log('File updated:', event.fileId);
        // Reload file if needed
    });
}
```

## MinIO Configuration

### Buckets

| Bucket | Purpose |
|--------|---------|
| `merman-files` | User files (`.mmd`) |
| `merman-exports` | Exported files (SVG, PNG, PDF) |

### File Path Convention

```
merman-files/
├── projects/
│   └── {projectId}/
│       ├── {fileId}.mmd
│       └── versions/
│           └── {fileId}/
│               ├── {timestamp}_v1.mmd
│               └── {timestamp}_v2.mmd
```

## Database Schema Changes

New columns in `files` table:

```sql
ALTER TABLE files ADD COLUMN minio_path TEXT;
ALTER TABLE files ADD COLUMN minio_etag TEXT;
ALTER TABLE files ADD COLUMN size INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN mime_type TEXT DEFAULT 'text/plain';
ALTER TABLE files ADD COLUMN is_migrated BOOLEAN DEFAULT false;
```

New table for version history:

```sql
CREATE TABLE file_versions (
    id UUID PRIMARY KEY,
    file_id UUID REFERENCES files(id),
    minio_path TEXT NOT NULL,
    minio_etag TEXT,
    size INTEGER NOT NULL,
    created_by UUID REFERENCES users(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Hybrid Approach (Fallback)

The system supports graceful degradation:

1. **WebSocket Connected + MinIO Available**: Real-time save to MinIO
2. **WebSocket Down**: Fallback to HTTP POST (server actions)
3. **MinIO Down**: Fallback to PostgreSQL storage

```tsx
// Auto-fallback in EditorPane
if (isConnected && projectId) {
    // Save via WebSocket + MinIO
    await wsUpdateFile({ fileId, content, projectId });
} else {
    // Fallback: Save via HTTP
    await updateFileContentAction(fileId, content);
}
```

## Production Deployment

### Docker Compose (Full Stack)

```bash
docker-compose up -d
```

Services:
- `app` - Next.js (port 3000)
- `websocket` - WebSocket server (port 3001)
- `db` - PostgreSQL (port 5439)
- `redis` - Redis (port 6379)
- `minio` - MinIO (ports 9000, 9001)

### Environment Variables for Production

```env
# Database
DATABASE_URL="postgres://user:pass@db-host:5432/merman"

# Redis (managed service)
REDIS_URL="redis://user:pass@redis-host:6379"

# MinIO (or S3-compatible)
MINIO_ENDPOINT="s3.amazonaws.com"
MINIO_PORT="443"
MINIO_USE_SSL="true"
MINIO_ACCESS_KEY="AWS_ACCESS_KEY"
MINIO_SECRET_KEY="AWS_SECRET_KEY"

# WebSocket
WS_PORT="3001"
WS_CORS_ORIGIN="https://your-domain.com"

# Client
NEXT_PUBLIC_WS_URL="wss://ws.your-domain.com"
```

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
# {"status":"ok","timestamp":"2024-..."}
```

### Redis Monitoring

```bash
docker exec -it merman-redis redis-cli
> INFO clients
> PUBSUB CHANNELS
```

### MinIO Monitoring

Access MinIO Console: http://localhost:9001

## Troubleshooting

### WebSocket Connection Issues

1. Check CORS origin in WebSocket server
2. Verify JWT token is being sent
3. Check browser console for connection errors

### MinIO Connection Issues

1. Verify MinIO is running: `docker-compose ps`
2. Check credentials in `.env`
3. Test with MinIO Client: `mc alias set merman http://localhost:9000 merman merman_minio_password`

### Redis Connection Issues

1. Check Redis is running: `docker exec -it merman-redis redis-cli ping`
2. Verify REDIS_URL in `.env`

## Performance Tuning

### Debounce Configuration

```typescript
// In editor-pane.tsx
const DEBOUNCE_DELAY = 300; // Adjust based on needs
```

### Redis Cache TTL

```typescript
// In hooks.ts - file cache TTL
await cacheSet(`file:${fileId}`, { content }, 300); // 5 minutes
```

### Rate Limiting

```typescript
// In rate-limit.ts
const rateLimiter = new RateLimiterMemory({
    points: 100,      // requests
    duration: 1,      // per second
    blockDuration: 60 // block for 60s if exceeded
});
```
