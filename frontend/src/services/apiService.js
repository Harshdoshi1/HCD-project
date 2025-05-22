/**
 * API Service
 * 
 * Central utility for making API calls to the backend
 * Handles database connection errors gracefully
 */

import API_BASE_URL from '../config/api';

// Debug flag to show detailed errors in console
const DEBUG = true;

// Direct endpoint helper function
// This function can be used to replace all hardcoded URL instances
export const getApiUrl = (endpoint) => {
  // Remove any leading slashes from endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Ensure path starts with /api if needed
  const formattedEndpoint = cleanEndpoint.startsWith('api/') ? `/${cleanEndpoint}` : `/api/${cleanEndpoint}`;
  
  return `${API_BASE_URL}${formattedEndpoint}`;
};

// Helper function for making API requests
const fetchApi = async (endpoint, options = {}) => {
  // Get the full URL using our helper
  const url = getApiUrl(endpoint);
  
  console.log(`Making API request to: ${url}`);
  
  // Set default headers if not provided
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json'
    };
  }

  try {
    const response = await fetch(url, options);
    
    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        // Try to parse as JSON
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      
      // Handle database connection errors with a more user-friendly message
      if (errorMessage.includes('database') || errorMessage.includes('DB') || 
          errorMessage.includes('SQL') || errorMessage.includes('MySQL')) {
        console.error('Database connection error:', errorMessage);
        throw new Error('Database connection failed. The application is running in API-only mode.');
      }
      
      throw new Error(errorMessage || `API call failed: ${response.status}`);
    }

    // Parse and return JSON response if it exists
    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    if (DEBUG) console.error(`API error for ${url}:`, error);
    throw error;
  }
};

// Convenience methods for different HTTP methods
const apiService = {
  get: (endpoint) => fetchApi(endpoint),
  
  post: (endpoint, data) => fetchApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  put: (endpoint, data) => fetchApi(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (endpoint) => fetchApi(endpoint, {
    method: 'DELETE'
  })
};

export default apiService;
