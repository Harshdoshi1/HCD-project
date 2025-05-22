/**
 * API Service
 * 
 * Central utility for making API calls to the backend
 */

import API_BASE_URL from '../config/api';

// Helper function for making API requests
const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers if not provided
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json'
    };
  }

  const response = await fetch(url, options);
  
  // Check if the response is OK
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API call failed: ${response.status}`);
  }

  // Parse and return JSON response if it exists
  if (response.headers.get('content-type')?.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
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
