const https = require('https');

async function testHostedAPI() {
    const url = 'https://hcd-project-1.onrender.com/api/student-analysis/blooms/92200133003/1';
    
    console.log('🔍 Testing hosted API endpoint...');
    console.log(`📡 URL: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        console.log('\n📊 Response Status:', response.status);
        console.log('📊 Response Data:', JSON.stringify(data, null, 2));
        
        if (data.error && data.error.includes('cw.ca')) {
            console.log('\n❌ CONFIRMED: The hosted version still has the old code with cw.ca reference');
            console.log('💡 The local fixes are correct but need to be deployed to the hosted environment');
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

// Run the test
testHostedAPI();
