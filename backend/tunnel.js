// This script creates a tunnel to expose your local backend to the internet
// allowing your hosted frontend to communicate with your local backend
const ngrok = require('ngrok');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

async function startTunnel() {
  try {
    // Start ngrok tunnel
    const url = await ngrok.connect({
      addr: PORT,
      region: 'us', // or choose another region: eu, au, ap, sa, jp, in
    });
    
    console.log('\n===========================================');
    console.log('🚀 NGROK TUNNEL CREATED SUCCESSFULLY!');
    console.log('===========================================');
    console.log(`✅ Your local backend is now accessible at: ${url}`);
    console.log(`✅ Your frontend is hosted at: ${process.env.FRONTEND_URL || 'https://hcd-project.vercel.app'}`);
    console.log('\n📌 IMPORTANT NEXT STEPS:');
    console.log('1. Keep this terminal window open to maintain the tunnel');
    console.log('2. Start your backend server in another terminal: npm start');
    console.log('3. Update your frontend API calls to use this URL instead of localhost');
    console.log('\n⚠️ NOTE: The ngrok URL changes each time you restart this script');
    console.log('===========================================\n');
    
    // Create a temporary file to store the URL for reference
    const tempFile = path.join(__dirname, 'current-tunnel.txt');
    fs.writeFileSync(tempFile, `Backend API URL: ${url}\nCreated: ${new Date().toISOString()}\n`);
    
    // Keep the process running
    process.stdin.resume();
    
    // Handle cleanup on exit
    process.on('SIGINT', async () => {
      console.log('\nShutting down ngrok tunnel...');
      await ngrok.kill();
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      console.log('Tunnel closed. Goodbye!');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error creating ngrok tunnel:', error);
    process.exit(1);
  }
}

startTunnel();
