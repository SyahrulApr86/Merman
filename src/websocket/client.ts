import { io, Socket } from 'socket.io-client';
import type {
    ConnectionStatus,
    FileUpdatePayload,
    FileUpdateResponse,
    FileLoadResponse,
    FileVersionsResponse,
    FileRestoreResponse,
} from './types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
const REQUEST_TIMEOUT = 10000; // 10 seconds

class WebSocketClient {
    private socket: Socket | null = null;
    private token: string | null = null;
    private _status: ConnectionStatus = 'disconnected';
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

    get status(): ConnectionStatus {
        return this._status;
    }

    get isConnected(): boolean {
        return this.socket?.connected || false;
    }

    private setStatus(status: ConnectionStatus): void {
        this._status = status;
        this.statusListeners.forEach((listener) => listener(status));
    }

    onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
        this.statusListeners.add(listener);
        return () => this.statusListeners.delete(listener);
    }

    connect(token: string): void {
        if (this.socket?.connected) {
            console.log('WebSocket already connected');
            return;
        }

        this.token = token;
        this.setStatus('connecting');

        this.socket = io(WS_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 10000,
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.setStatus('connected');
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            this.setStatus('disconnected');

            // Auto reconnect for certain disconnect reasons
            if (reason === 'io server disconnect') {
                // Server forced disconnect, try to reconnect
                this.socket?.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error.message);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.setStatus('error');
            }
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.setStatus('error');
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.setStatus('disconnected');
        this.token = null;
    }

    // File operations
    async updateFile(payload: FileUpdatePayload): Promise<FileUpdateResponse> {
        return this.emitWithAck('file:update', payload);
    }

    async loadFile(fileId: string): Promise<FileLoadResponse> {
        return this.emitWithAck('file:load', { fileId });
    }

    async getVersions(fileId: string): Promise<FileVersionsResponse> {
        return this.emitWithAck('file:versions', { fileId });
    }

    async restoreVersion(fileId: string, versionId: string): Promise<FileRestoreResponse> {
        return this.emitWithAck('file:restore', { fileId, versionId });
    }

    async deleteFile(fileId: string): Promise<{ success?: boolean; error?: string }> {
        return this.emitWithAck('file:delete', { fileId });
    }

    // Project subscription
    subscribeToProject(projectId: string): void {
        this.socket?.emit('project:subscribe', projectId);
    }

    unsubscribeFromProject(projectId: string): void {
        this.socket?.emit('project:unsubscribe', projectId);
    }

    // Event listeners
    on<T>(event: string, callback: (data: T) => void): void {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (data: unknown) => void): void {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    // Helper method for emit with acknowledgment
    private emitWithAck<T>(event: string, payload: unknown): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                return reject(new Error('WebSocket not connected'));
            }

            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, REQUEST_TIMEOUT);

            this.socket.emit(event, payload, (response: T) => {
                clearTimeout(timeout);

                const res = response as T & { error?: string };
                if (res.error) {
                    reject(new Error(res.error));
                } else {
                    resolve(response);
                }
            });
        });
    }
}

// Singleton instance
export const wsClient = new WebSocketClient();

// Export class for testing
export { WebSocketClient };
