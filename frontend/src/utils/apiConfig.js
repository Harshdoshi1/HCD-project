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

function getEnv(...keys) {
    for (const k of keys) {
        const v = safeEnv(k);
        if (typeof v !== 'undefined' && v !== null && String(v).length > 0) return v;
    }
    return undefined;
}

// Support both CRA and Vite env variable conventions
// Expected to end with /api
let HOSTED_BASE = getEnv('REACT_APP_API_URL', 'VITE_API_URL');
const LOCAL_BASE = getEnv('REACT_APP_LOCAL_API_URL', 'VITE_LOCAL_API_URL') || 'http://localhost:5001/api';

function shouldUseLocal() {
    try {
        const envFlag = getEnv('REACT_APP_USE_LOCAL', 'VITE_USE_LOCAL');
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

// As a last resort in production, infer hosted base when running on the Render frontend domain
if (!shouldUseLocal() && !HOSTED_BASE) {
    try {
        if (typeof window !== 'undefined' && window.location && window.location.hostname) {
            const host = window.location.hostname;
            // If deployed on studentprogresstracker.onrender.com and no env set, fallback to known backend URL
            if (host.includes('studentprogresstracker.onrender.com')) {
                HOSTED_BASE = 'https://hcd-project-1.onrender.com/api';
            }
        }
    } catch (_) { }
}

export const API_BASE_URL = shouldUseLocal() ? LOCAL_BASE : (HOSTED_BASE || LOCAL_BASE);

// Safely join base + path (path should start with '/...')
export function buildUrl(path) {
    const base = String(API_BASE_URL || '').replace(/\/$/, '');
    const suffix = String(path || '').startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
}
