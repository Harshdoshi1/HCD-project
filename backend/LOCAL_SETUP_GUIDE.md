# Local Backend with Hosted Frontend Guide

This guide explains how to run your backend locally with a MySQL database while connecting to your hosted frontend at https://hcd-project.vercel.app.

## Setup Process

### Step 1: Start your local MySQL server

First, make sure your MySQL server is running:

```bash
# Open MySQL System Preferences and start the server
# Or use one of these commands depending on your installation:
mysql.server start
# OR
sudo /usr/local/mysql-9.1.0-macos14-arm64/support-files/mysql.server start
```

### Step 2: Create the database (if it doesn't exist)

```bash
# Connect to MySQL
mysql -u root -p

# Create the database
CREATE DATABASE IF NOT EXISTS hcd;

# Exit MySQL
exit
```

### Step 3: Make your local backend accessible to the internet

Since your frontend is hosted at https://hcd-project.vercel.app and your backend is running locally, you need to create a tunnel to make your local backend accessible to the internet:

```bash
# Open a terminal window and run:
cd /Users/krish_mamtora/Desktop/Sem6/HCD-krish/HCD-project/HCD-project/backend
npm run tunnel
```

This will create a public URL that points to your local backend. Keep this terminal window open.

### Step 4: Start your backend server

In a new terminal window:

```bash
cd /Users/krish_mamtora/Desktop/Sem6/HCD-krish/HCD-project/HCD-project/backend
npm start
```

### Step 5: Update your frontend to use the tunnel URL

You need to update your hosted frontend to use the tunnel URL instead of localhost:5001. There are two approaches:

#### Option A: Temporary testing

1. Note the tunnel URL from the terminal (e.g., https://abcd1234.ngrok.io)
2. Open the developer console in your browser while visiting your hosted frontend
3. Run this JavaScript in the console to override API calls:
   ```javascript
   window.localStorage.setItem('api_base_url', 'https://your-tunnel-url-here/api');
   location.reload();
   ```

#### Option B: Redeploy frontend with updated API URL

1. Update your frontend code to use the tunnel URL
2. Redeploy to Vercel

## Troubleshooting

### Database Connection Issues

If you see "Database synchronization error" or "Running in API-only mode":

1. Check if MySQL is running:
   ```bash
   ps aux | grep mysql
   ```

2. Verify your database credentials in the `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=""
   DB_NAME=hcd
   ```

3. Make sure the `hcd` database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Tunnel Issues

If ngrok fails to create a tunnel:

1. Make sure you have an internet connection
2. Try running with an authentication token (sign up at ngrok.com):
   ```bash
   ngrok authtoken YOUR_AUTH_TOKEN
   npm run tunnel
   ```

### Testing the Connection

Visit these URLs to test your setup:

1. http://localhost:5001/health - Check if your local backend is running
2. http://localhost:5001/api/db-status - Check database connection status
3. Your ngrok tunnel URL + /health - Check if the tunnel is working

## Security Notes

- The tunnel exposes your local backend to the internet - use only for development/testing
- Don't use sensitive data in this setup
- Close the tunnel when you're done testing
