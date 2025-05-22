# Backend Deployment Guide

This guide provides instructions for deploying the HCD Project backend to various hosting platforms to connect with your hosted frontend at [https://hcd-project.vercel.app](https://hcd-project.vercel.app).

## Prerequisites

- Node.js (v14 or higher)
- MySQL database (for production)
- Git

## Environment Variables

Before deploying, you need to set up these environment variables:

```
# Server Configuration
PORT=5001
NODE_ENV=production

# Database Configuration
PROD_DB_HOST=your_production_db_host
PROD_DB_USER=your_production_db_user
PROD_DB_PASSWORD=your_production_db_password
PROD_DB_NAME=your_production_db_name

# Frontend URL
FRONTEND_URL=https://hcd-project.vercel.app

# Email Configuration
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
```

## Option 1: Deploying to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure build settings:
   - Build Command: `npm install`
   - Output Directory: None
   - Install Command: `npm install`
4. Add all environment variables in the Vercel project settings
5. Deploy the project

## Option 2: Deploying to Heroku

1. Install Heroku CLI: `npm install -g heroku`
2. Login to Heroku: `heroku login`
3. Create a Heroku app: `heroku create hcd-project-backend`
4. Add a MySQL add-on: `heroku addons:create jawsdb`
5. Get your MySQL connection details: `heroku config:get JAWSDB_URL`
6. Set environment variables:
   ```
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://hcd-project.vercel.app
   heroku config:set EMAIL_USER=your_email_user
   heroku config:set EMAIL_PASSWORD=your_email_password
   ```
7. Deploy the app: `git push heroku main`

## Option 3: Deploying to Railway

1. Sign up for Railway (railway.app)
2. Connect your GitHub repository
3. Add a MySQL database service
4. Configure environment variables
5. Deploy the application

## After Deployment

After deploying your backend, make note of your backend URL. You'll need to update your frontend code to use this URL for API calls instead of localhost.

## Testing the Connection

After deployment, make sure to test:

1. The health check endpoint: `https://your-backend-url/health`
2. The login functionality with your hosted frontend
3. Data retrieval and submission endpoints

If you encounter any issues, check the logs of your hosting platform for more information.
