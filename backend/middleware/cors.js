const cors = require('cors');

// CORS middleware configuration
const setupCors = (app) => {
  // Get allowed origins from environment or use defaults
  const allowedOrigins = [
    'https://hcd-project.vercel.app',
    'https://hcd-frontend.onrender.com',
    'http://localhost:5173'
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
    optionsSuccessStatus: 200
  };

  // Apply CORS middleware
  app.use(cors(corsOptions));
  
  // Handle preflight requests
  app.options('*', cors(corsOptions));
  
  console.log('CORS configured with allowed origins:', allowedOrigins);
};

module.exports = setupCors;
