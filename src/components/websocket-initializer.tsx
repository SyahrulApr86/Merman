'use client';

import { useEffect, useRef } from 'react';
import { wsClient } from '@/websocket/client';

interface WebSocketInitializerProps {
    url?: string;
}

export function WebSocketInitializer({ url }: WebSocketInitializerProps) {
    const initialized = useRef(false);

    useEffect(() => {
        // Only configure if a URL is provided and it's different from default
        if (url && !initialized.current) {
            wsClient.setUrl(url);
            initialized.current = true;
        }
    }, [url]);

    return null;
}
