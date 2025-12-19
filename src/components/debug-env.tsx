'use client';

export function DebugEnv({ url }: { url?: string }) {
    if (process.env.NODE_ENV === 'production') {
        // Create a fixed overlay to show the variable
        return (
            <div style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                background: 'red',
                color: 'white',
                padding: '10px',
                zIndex: 9999,
                fontSize: '12px',
                maxWidth: '300px',
                wordBreak: 'break-all'
            }}>
                DEBUG: WS_URL = [{url}]
            </div>
        );
    }
    return null;
}
