/**
 * TEST SCRIPT - Services API
 * 
 * Teste tous les endpoints du services-service après la migration
 * Usage: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3004';

// Couleurs pour l'affichage
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function pour faire les requêtes HTTP
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test runner
async function runTests() {
  console.log(`\n${colors.bright}${colors.blue}=== TESTING SERVICES-SERVICE API ===${colors.reset}\n`);

  const tests = [
    {
      name: '✓ Health Check',
      method: 'GET',
      path: '/health',
      body: null,
      expectedStatus: 200
    },
    {
      name: '✓ GET /api/services - Récupérer tous les services',
      method: 'GET',
      path: '/api/services?page=1&limit=10',
      body: null,
      expectedStatus: 200
    },
    {
      name: '✓ POST /api/services - Créer un nouveau service',
      method: 'POST',
      path: '/api/services',
      body: {
        nom: 'Service Test',
        type: 'permit',
        description: 'Service de test',
        badges: 'Electronic,Immediate',
        requirements: 'Test requirements',
        municipalite_id: 1
      },
      expectedStatus: 201,
      saveResponse: 'serviceId'
    },
    {
      name: '✓ GET /api/services/:id - Récupérer un service par ID',
      method: 'GET',
      path: '/api/services/:id',
      body: null,
      expectedStatus: 200
    },
    {
      name: '✓ GET /api/services/municipality/1 - Services par municipalité',
      method: 'GET',
      path: '/api/services/municipality/1',
      body: null,
      expectedStatus: 200
    },
    {
      name: '✓ GET /api/services/type/permit - Services par type',
      method: 'GET',
      path: '/api/services/type/permit',
      body: null,
      expectedStatus: 200
    },
    {
      name: '✓ PUT /api/services/:id - Mettre à jour un service',
      method: 'PUT',
      path: '/api/services/:id',
      body: {
        nom: 'Service Updated',
        description: 'Description mise à jour'
      },
      expectedStatus: 200
    },
    {
      name: '✓ POST /api/service-requests - Créer une demande de service',
      method: 'POST',
      path: '/api/service-requests',
      body: {
        cin: 12345678,
        service_id: ':id',
        requestdescription: 'Je voudrais un permis de construction'
      },
      expectedStatus: 201,
      saveResponse: 'requestId'
    },
    {
      name: '✓ GET /api/service-requests/user/:cin - Mes demandes',
      method: 'GET',
      path: '/api/service-requests/user/12345678',
      body: null,
      expectedStatus: 200
    },
    {
      name: '✓ GET /api/service-requests/:id - Détails d\'une demande',
      method: 'GET',
      path: '/api/service-requests/1',
      body: null,
      expectedStatus: 200
    },
    {
      name: '✓ PUT /api/service-requests/:id/status - Changer le statut',
      method: 'PUT',
      path: '/api/service-requests/1/status',
      body: { status: 'in_progress' },
      expectedStatus: 200
    },
    {
      name: '✓ GET /api/service-requests - Admin: Toutes les demandes',
      method: 'GET',
      path: '/api/service-requests?status=pending&page=1&limit=10',
      body: null,
      expectedStatus: 200
    },
    {
      name: '✓ DELETE /api/services/:id - Supprimer un service',
      method: 'DELETE',
      path: '/api/services/:id',
      body: null,
      expectedStatus: 200
    }
  ];

  let passed = 0;
  let failed = 0;
  const savedData = {};

  for (const test of tests) {
    try {
      console.log(`${colors.bright}${colors.yellow}Testing:${colors.reset} ${test.name}`);
      
      // Remplacer les variables sauvegardées
      let path = test.path;
      let body = test.body ? JSON.parse(JSON.stringify(test.body)) : null;
      
      Object.entries(savedData).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
        
        // Remplacer aussi dans le corps si c'est une chaîne ':key'
        if (body) {
          Object.keys(body).forEach(bodyKey => {
            if (body[bodyKey] === `:${key}`) {
              body[bodyKey] = value;
            }
          });
        }
      });

      const response = await makeRequest(test.method, path, body);

      if (response.status === test.expectedStatus) {
        console.log(`${colors.green}✓ PASS${colors.reset} - Status: ${response.status}`);
        
        // Sauvegarder la réponse si demandé
        if (test.saveResponse && response.body.data) {
          if (test.saveResponse === 'serviceId') {
            savedData.id = response.body.data.id;
            console.log(`  → Service ID saved: ${response.body.data.id}`);
          } else if (test.saveResponse === 'requestId') {
            savedData.requestId = response.body.data.id;
            console.log(`  → Request ID saved: ${response.body.data.id}`);
          }
        }

        // Afficher un aperçu de la réponse
        if (response.body.data) {
          console.log(`  → Response: ${JSON.stringify(response.body.data).substring(0, 100)}...`);
        }
        
        passed++;
      } else {
        console.log(`${colors.red}✗ FAIL${colors.reset} - Expected ${test.expectedStatus}, got ${response.status}`);
        console.log(`  → Error: ${JSON.stringify(response.body)}`);
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗ ERROR${colors.reset} - ${error.message}`);
      failed++;
    }

    console.log('');
  }

  // Summary
  console.log(`${colors.bright}${colors.blue}=== TEST SUMMARY ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total:  ${passed + failed}`);
  console.log('');

  if (failed === 0) {
    console.log(`${colors.green}${colors.bright}All tests passed! ✓${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bright}Some tests failed! ✗${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
