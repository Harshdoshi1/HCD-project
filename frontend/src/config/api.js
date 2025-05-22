/**
 * API Configuration
 * 
 * This file contains the base URLs for different environments.
 * Update the BACKEND_URL with your actual hosted backend URL from Render.
 */

// The URL from Render where your backend is hosted
// Replace this with your actual backend URL from Render (not the documentation link)
const BACKEND_URL = 'https://your-backend-name.onrender.com';

// For local development
const LOCAL_URL = 'http://localhost:5001';

// Select which URL to use based on environment
// This will use the hosted backend URL when deployed to Vercel
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? BACKEND_URL
    : LOCAL_URL;

export default API_BASE_URL;
