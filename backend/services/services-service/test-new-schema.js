const http = require('http');

const tests = [
  {
    name: 'Get all service requests (en_attente)',
    method: 'GET',
    path: '/api/service-requests?status=en_attente&page=1&limit=10'
  },
  {
    name: 'Get service requests for user (CIN: 12345678)',
    method: 'GET',
    path: '/api/service-requests/user/12345678'
  }
];

async function runTests() {
  console.log('\n🧪 Testing Service Requests API with New Schema\n');
  console.log('='.repeat(60));

  for (const test of tests) {
    console.log(`\n📝 TEST: ${test.name}`);
    console.log(`   ${test.method} ${test.path}`);
    
    try {
      const response = await makeRequest(test.method, test.path);
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        console.log(`   ✅ Status: 200`);
        
        if (test.path.includes('/api/service-requests?')) {
          console.log(`   ✅ Found ${data.data.length} requests`);
          if (data.data.length > 0) {
            const req = data.data[0];
            console.log(`   Sample: ${req.first_name} ${req.last_name} - ${req.service_name} (${req.status})`);
          }
        } else if (test.path.includes('/api/service-requests/user/')) {
          console.log(`   ✅ Found ${data.data.length} user requests`);
          if (data.data.length > 0) {
            const req = data.data[0];
            console.log(`   Sample: ${req.service_name} - created ${new Date(req.date_creation).toLocaleDateString()}`);
          }
        }
      } else {
        console.log(`   ⚠️ Status: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ API Testing Complete\n');
  process.exit(0);
}

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3004,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Wait a moment for the service to fully start
setTimeout(runTests, 1000);
