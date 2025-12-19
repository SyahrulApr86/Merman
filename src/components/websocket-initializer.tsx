'use client';

import { useEffect, useRef } from 'react';
import { wsClient } from '@/websocket/client';

interface WebSocketInitializerProps {
    url?: string;
}

export function WebSocketInitializer({ url }: WebSocketInitializerProps) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current && url) {
            wsClient.setUrl(url);
            initialized.current = true;
        }
    }, [url]);

    return null;
}
