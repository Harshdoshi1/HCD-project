// Centralized API configuration for switching between hosted and localhost
// Usage:
// - Set REACT_APP_API_URL in .env to your hosted base (e.g., https://hcd-project-1.onrender.com/api)
// - Optionally set REACT_APP_LOCAL_API_URL for local base (default: http://localhost:5001/api)
// - To force localhost in development without editing code, set REACT_APP_USE_LOCAL=true
//   or in the browser console/localStorage: localStorage.setItem('USE_LOCAL_API', 'true')

function safeEnv(key) {
    try {
        // CRA/webpack style (process.env.*)
        if (typeof process !== 'undefined' && process && process.env && key in process.env) {
            return process.env[key];
        }
    } catch (_) { }
    try {
        // Vite style (import.meta.env)
        if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
            return import.meta.env[key];
        }
    } catch (_) { }
    try {
        // Window override (e.g., window.__ENV__.REACT_APP_API_URL)
        if (typeof window !== 'undefined' && window.__ENV__ && key in window.__ENV__) {
            return window.__ENV__[key];
        }
    } catch (_) { }
    return undefined;
}

const HOSTED_BASE = safeEnv('REACT_APP_API_URL'); // expected to end with /api
const LOCAL_BASE = safeEnv('REACT_APP_LOCAL_API_URL') || 'http://localhost:5001/api';

function shouldUseLocal() {
    try {
        const envFlag = safeEnv('REACT_APP_USE_LOCAL');
        if (envFlag === 'true') return true;
        if (typeof window !== 'undefined') {
            const ls = window.localStorage?.getItem('USE_LOCAL_API');
            if (ls === 'true') return true;
            // Also support `?useLocalApi=true` query param for quick toggling
            const params = new URLSearchParams(window.location.search);
            if (params.get('useLocalApi') === 'true') return true;
        }
    } catch (_) { }
    return false;
}

export const API_BASE_URL = shouldUseLocal() ? LOCAL_BASE : (HOSTED_BASE || LOCAL_BASE);

// Safely join base + path (path should start with '/...')
export function buildUrl(path) {
    const base = String(API_BASE_URL || '').replace(/\/$/, '');
    const suffix = String(path || '').startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
}
