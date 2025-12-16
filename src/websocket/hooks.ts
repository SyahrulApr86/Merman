"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { wsClient } from './client';
import type {
    ConnectionStatus,
    FileUpdatePayload,
    FileUpdateResponse,
    FileLoadResponse,
    FileVersionsResponse,
    FileRestoreResponse,
    FileUpdatedEvent,
} from './types';

// Hook for WebSocket connection management
export function useWebSocket(token: string | null) {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('disconnected');
            setIsConnected(false);
            return;
        }

        // Connect to WebSocket
        wsClient.connect(token);

        // Listen for status changes
        const unsubscribe = wsClient.onStatusChange((newStatus) => {
            setStatus(newStatus);
            setIsConnected(newStatus === 'connected');
        });

        // Set initial status
        setStatus(wsClient.status);
        setIsConnected(wsClient.isConnected);

        return () => {
            unsubscribe();
            // Don't disconnect on unmount - keep connection alive for other components
        };
    }, [token]);

    const disconnect = useCallback(() => {
        wsClient.disconnect();
    }, []);

    return {
        status,
        isConnected,
        disconnect,
    };
}

// Hook for file operations via WebSocket
export function useWebSocketFile(projectId: string | null) {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
    const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null);

    // Subscribe to project on mount
    useEffect(() => {
        if (!projectId || !wsClient.isConnected) return;

        wsClient.subscribeToProject(projectId);

        return () => {
            wsClient.unsubscribeFromProject(projectId);
        };
    }, [projectId, wsClient.isConnected]);

    // Update file (with optional debouncing)
    const updateFile = useCallback(
        async (
            payload: FileUpdatePayload,
            options?: { debounce?: number }
        ): Promise<FileUpdateResponse> => {
            // Clear pending update
            if (pendingUpdateRef.current) {
                clearTimeout(pendingUpdateRef.current);
                pendingUpdateRef.current = null;
            }

            if (!wsClient.isConnected) {
                throw new Error('WebSocket not connected');
            }

            const executeUpdate = async (): Promise<FileUpdateResponse> => {
                setSaveStatus('saving');

                try {
                    const response = await wsClient.updateFile(payload);
                    setSaveStatus('saved');

                    // Reset to idle after 2 seconds
                    setTimeout(() => setSaveStatus('idle'), 2000);

                    return response;
                } catch (error) {
                    setSaveStatus('error');
                    throw error;
                }
            };

            // If debounce is specified, delay the update
            if (options?.debounce) {
                return new Promise((resolve, reject) => {
                    pendingUpdateRef.current = setTimeout(async () => {
                        try {
                            const result = await executeUpdate();
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    }, options.debounce);
                });
            }

            return executeUpdate();
        },
        []
    );

    // Load file
    const loadFile = useCallback(async (fileId: string): Promise<FileLoadResponse> => {
        if (!wsClient.isConnected) {
            throw new Error('WebSocket not connected');
        }

        setLoadStatus('loading');

        try {
            const response = await wsClient.loadFile(fileId);
            setLoadStatus('loaded');
            return response;
        } catch (error) {
            setLoadStatus('error');
            throw error;
        }
    }, []);

    // Get file versions
    const getVersions = useCallback(async (fileId: string): Promise<FileVersionsResponse> => {
        if (!wsClient.isConnected) {
            throw new Error('WebSocket not connected');
        }

        return wsClient.getVersions(fileId);
    }, []);

    // Restore file version
    const restoreVersion = useCallback(
        async (fileId: string, versionId: string): Promise<FileRestoreResponse> => {
            if (!wsClient.isConnected) {
                throw new Error('WebSocket not connected');
            }

            return wsClient.restoreVersion(fileId, versionId);
        },
        []
    );

    // Delete file
    const deleteFile = useCallback(async (fileId: string): Promise<void> => {
        if (!wsClient.isConnected) {
            throw new Error('WebSocket not connected');
        }

        await wsClient.deleteFile(fileId);
    }, []);

    return {
        saveStatus,
        loadStatus,
        updateFile,
        loadFile,
        getVersions,
        restoreVersion,
        deleteFile,
    };
}

// Hook for listening to file updates from other users
export function useFileUpdates(callback: (event: FileUpdatedEvent) => void) {
    useEffect(() => {
        const handler = (data: FileUpdatedEvent) => {
            callback(data);
        };

        wsClient.on('file:updated', handler);

        return () => {
            wsClient.off('file:updated', handler);
        };
    }, [callback]);
}

// Hook for getting session token from cookie
export function useSessionToken(): string | null {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Extract session token from cookies
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find((c) => c.trim().startsWith('session='));

        if (sessionCookie) {
            const tokenValue = sessionCookie.split('=')[1];
            setToken(tokenValue);
        }
    }, []);

    return token;
}

// Combined hook for easy usage
export function useRealtimeEditor(projectId: string | null) {
    const token = useSessionToken();
    const { status, isConnected, disconnect } = useWebSocket(token);
    const {
        saveStatus,
        loadStatus,
        updateFile,
        loadFile,
        getVersions,
        restoreVersion,
        deleteFile,
    } = useWebSocketFile(projectId);

    return {
        // Connection
        connectionStatus: status,
        isConnected,
        disconnect,

        // File operations
        saveStatus,
        loadStatus,
        updateFile,
        loadFile,
        getVersions,
        restoreVersion,
        deleteFile,

        // Helpers
        isReady: isConnected && status === 'connected',
    };
}
