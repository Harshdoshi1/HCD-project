/**
 * API Configuration
 * 
 * This file contains the base URLs for different environments.
 * Update the BACKEND_URL with your actual hosted backend URL from Render.
 */

// The URL from Render where your backend is hosted
const BACKEND_URL = 'https://hcd-backend.onrender.com';

// For local development
const LOCAL_URL = 'http://localhost:5001';

// Determine if we're in production by checking the URL
// This ensures that when deployed to a hosting platform, it always uses the hosted backend
const isProduction = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname !== 'localhost' && 
           !window.location.hostname.includes('127.0.0.1');
  }
  return process.env.NODE_ENV === 'production';
};

// Select which URL to use based on environment
// This will use the hosted backend URL when deployed
const API_BASE_URL = isProduction() 
    ? BACKEND_URL
    : LOCAL_URL;

console.log('API Base URL:', API_BASE_URL, 'Environment:', isProduction() ? 'Production' : 'Development');

export default API_BASE_URL;
