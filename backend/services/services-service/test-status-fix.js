const http = require('http');

async function testStatusUpdate() {
  console.log('\n🧪 Testing Status Update with English Value\n');
  console.log('='.repeat(60));

  try {
    // Get the first service request ID
    const getResponse = await makeRequest('GET', '/api/service-requests?status=en_attente&limit=1');
    const data = JSON.parse(getResponse.body);
    
    if (data.data.length === 0) {
      console.log('❌ No service requests found to test');
      process.exit(1);
    }

    const requestId = data.data[0].id;
    console.log(`\n📝 TEST 1: Update status with English value 'approved'`);
    console.log(`   Request ID: ${requestId}`);
    console.log(`   Current Status: ${data.data[0].status}`);

    const updateResponse = await makeRequest('PUT', `/api/service-requests/${requestId}/status`, {
      status: 'approved'
    });

    if (updateResponse.statusCode === 200) {
      const result = JSON.parse(updateResponse.body);
      console.log(`   ✅ Status: 200 OK`);
      console.log(`   ✅ Updated Status: ${result.data.status}`);
    } else {
      const error = JSON.parse(updateResponse.body);
      console.log(`   ❌ Status: ${updateResponse.statusCode}`);
      console.log(`   Error: ${error.error}`);
    }

    // Test with French value
    console.log(`\n📝 TEST 2: Update status with French value 'rejetee'`);
    
    const updateResponse2 = await makeRequest('PUT', `/api/service-requests/${requestId}/status`, {
      status: 'rejetee'
    });

    if (updateResponse2.statusCode === 200) {
      const result = JSON.parse(updateResponse2.body);
      console.log(`   ✅ Status: 200 OK`);
      console.log(`   ✅ Updated Status: ${result.data.status}`);
    } else {
      const error = JSON.parse(updateResponse2.body);
      console.log(`   ❌ Status: ${updateResponse2.statusCode}`);
      console.log(`   Error: ${error.error}`);
    }

  } catch (error) {
    console.log(`❌ Test Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing Complete\n');
  process.exit(0);
}

function makeRequest(method, path, body = null) {
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
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: responseBody
        });
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

setTimeout(testStatusUpdate, 500);
