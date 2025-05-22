# HCD Project Backend

This is the backend API for the Human-Centered Design project dashboard.

## Deployment Instructions

### Prerequisites
- Node.js (v14+)
- MySQL database

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run in development mode: `npm run dev`

### Deploying to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up the environment variables in Vercel:
   - `PORT`: 5001
   - `NODE_ENV`: production
   - `PROD_DB_HOST`: Your production database host
   - `PROD_DB_USER`: Your production database username
   - `PROD_DB_PASSWORD`: Your production database password
   - `PROD_DB_NAME`: Your production database name
   - `FRONTEND_URL`: https://hcd-project.vercel.app
   - `EMAIL_USER`: Your email address for sending notifications
   - `EMAIL_PASSWORD`: Your email password or app password
4. Deploy the application

### Connecting with Frontend
The frontend is hosted at [https://hcd-project.vercel.app](https://hcd-project.vercel.app)

## API Documentation

The API is organized around REST principles. All endpoints return JSON responses and use standard HTTP response codes.

Base URL: `https://your-backend-url.vercel.app/api`

### Authentication
- POST `/users/login` - User login
- POST `/auth/send-reset-email` - Send password reset email
- POST `/auth/reset-password` - Reset password

(Add more endpoints as needed)
