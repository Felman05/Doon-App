function buildApiOrigin() {
    const host = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';
    const apiPort = import.meta.env.VITE_API_PORT || '8000';

    if (window.location.port === apiPort) {
        return window.location.origin;
    }

    return `${protocol}//${host}:${apiPort}`;
}

export function getApiBaseUrl() {
    const explicit = import.meta.env.VITE_API_URL;
    if (explicit) {
        try {
            const parsed = new URL(explicit, window.location.origin);
            // Prevent localhost/127 mismatch that breaks CSRF cookies.
            if (
                ['localhost', '127.0.0.1'].includes(parsed.hostname) &&
                ['localhost', '127.0.0.1'].includes(window.location.hostname)
            ) {
                parsed.hostname = window.location.hostname;
            }
            return parsed.toString().replace(/\/$/, '');
        } catch {
            // Fall through to computed origin.
        }
    }

    return `${buildApiOrigin()}/api`;
}

export function getApiOrigin() {
    const base = getApiBaseUrl();
    try {
        return new URL(base).origin;
    } catch {
        return buildApiOrigin();
    }
}
