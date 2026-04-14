const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

pkg.scripts = {
  'test': 'echo "Error: no test specified" && exit 1',
  'start:all': 'concurrently "npm:start:frontend" "npm:start:admin" "npm:start:services"',
  'start:services': 'cd backend/services/services-service && npm run dev',
  'start:frontend': 'cd frontend && npm run dev',
  'start:admin': 'cd admin && npm run dev',
  'dev': 'concurrently "npm:start:frontend" "npm:start:backend"',
  'dev:admin': 'cd admin && ng serve --open --port 4201',
  'start-frontend': 'cd frontend && ng serve --open',
  'start-backend': 'cd backend && npm run dev'
};

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('package.json fixed successfully');
