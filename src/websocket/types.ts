// WebSocket Event Types

export interface FileUpdatePayload {
    fileId: string;
    content: string;
    projectId: string;
    createVersion?: boolean;
}

export interface FileUpdateResponse {
    success?: boolean;
    error?: string;
    fileId?: string;
    size?: number;
    etag?: string;
    timestamp?: number;
    duration?: number;
}

export interface FileLoadResponse {
    success?: boolean;
    error?: string;
    content?: string;
    size?: number;
    cached?: boolean;
}

export interface FileVersion {
    id: string;
    minioPath: string;
    size: number;
    createdAt: Date;
    comment: string | null;
}

export interface FileVersionsResponse {
    success?: boolean;
    error?: string;
    versions?: FileVersion[];
}

export interface FileRestoreResponse {
    success?: boolean;
    error?: string;
    content?: string;
    size?: number;
    etag?: string;
}

export interface FileUpdatedEvent {
    fileId: string;
    userId: string;
    size: number;
    timestamp: number;
}

export interface UserJoinedEvent {
    userId: string;
    username: string;
    timestamp: number;
}

export interface UserLeftEvent {
    userId: string;
    username: string;
    timestamp: number;
}

export interface ConnectedEvent {
    userId: string;
    socketId: string;
    timestamp: number;
}

// Connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// WebSocket Manager interface
export interface WebSocketManager {
    connect(token: string): void;
    disconnect(): void;
    isConnected: boolean;
    status: ConnectionStatus;
    updateFile(payload: FileUpdatePayload): Promise<FileUpdateResponse>;
    loadFile(fileId: string): Promise<FileLoadResponse>;
    getVersions(fileId: string): Promise<FileVersionsResponse>;
    restoreVersion(fileId: string, versionId: string): Promise<FileRestoreResponse>;
    subscribeToProject(projectId: string): void;
    unsubscribeFromProject(projectId: string): void;
    on<T>(event: string, callback: (data: T) => void): void;
    off(event: string, callback?: (data: unknown) => void): void;
}
