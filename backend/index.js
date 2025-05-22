// This file is used as an entry point for deployment services like Render.com
// It simply requires and runs the main server.js file

console.log('Starting HCD Project Backend...');
console.log('Using index.js as entry point to load server.js');

// Import the main server file
require('./server');

// This ensures that the server.js file is properly loaded and executed
console.log('server.js loaded successfully');
