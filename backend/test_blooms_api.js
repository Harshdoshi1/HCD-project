/**
 * Test script to verify the Bloom's taxonomy API endpoint works correctly
 * after fixing the 'ca' to 'cse' column issue
 */

const http = require('http');

const testBloomsAPI = async () => {
    try {
        console.log('🧪 Testing Bloom\'s Taxonomy API endpoint...\n');
        
        const enrollmentNumber = '92200133003';
        const semesterNumber = '1';
        const url = `http://localhost:5001/api/student-analysis/blooms/${enrollmentNumber}/${semesterNumber}`;
        
        console.log(`📡 Making request to: ${url}`);
        
        const response = await new Promise((resolve, reject) => {
            const req = http.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log(`Raw response (status ${res.statusCode}):`, data);
                    try {
                        const parsedData = JSON.parse(data);
                        resolve({ status: res.statusCode, data: parsedData });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data, parseError: e.message });
                    }
                });
            });
            req.on('error', (err) => {
                console.log('Request error:', err.message);
                reject(err);
            });
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
        
        // Validate response structure
        if (response.data.bloomsDistribution) {
            console.log('\n✅ Response contains bloomsDistribution array');
            console.log(`📈 Found ${response.data.bloomsDistribution.length} subjects with Bloom's data`);
            
            response.data.bloomsDistribution.forEach((subject, index) => {
                console.log(`\n📚 Subject ${index + 1}: ${subject.subject} (${subject.code})`);
                if (subject.bloomsLevels && subject.bloomsLevels.length > 0) {
                    subject.bloomsLevels.forEach(level => {
                        console.log(`  - ${level.level}: ${level.score}%`);
                    });
                } else {
                    console.log('  - No Bloom\'s levels data available');
                }
            });
        } else {
            console.log('⚠️  Response missing bloomsDistribution array');
        }
        
        console.log('\n🎉 API test completed successfully!');
        
    } catch (error) {
        console.error('❌ API Test Failed:');
        console.error('Error Message:', error.message);
        
        if (error.message?.includes('ca')) {
            console.log('\n💡 The error still mentions "ca" - the fix may not have been applied correctly.');
        }
    }
};

// Run the test
testBloomsAPI();
