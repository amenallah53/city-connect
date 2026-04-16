const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3004,
  path: '/api/service-requests?status=en_attente&page=1&limit=10',
  method: 'GET'
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
    process.exit(0);
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
