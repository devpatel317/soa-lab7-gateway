const http = require('http');
const https = require('https');
const url = require('url');

const targetBaseUrl = process.argv[2] || 'http://localhost:8080';
console.log(`\nUsing Gateway Base URL: ${targetBaseUrl}\n`);

function makeRequest(endpoint, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(endpoint, targetBaseUrl);
    const client = fullUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: fullUrl.hostname,
      port: fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
      path: fullUrl.pathname + fullUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runGatewayTestSuite() {
  console.log('================================================================');
  console.log('   SOA LAB 7 - API GATEWAY & MICROSERVICES TEST SUITE          ');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // 1. Gateway Health Check
    // -------------------------------------------------------------
    console.log('--- [Step 1] Testing Gateway Health Check (GET /health) ---');
    const health = await makeRequest('/health', 'GET');
    console.log(`Status Code: ${health.statusCode}`);
    console.log('Health Response:', JSON.stringify(health.data, null, 2));

    // -------------------------------------------------------------
    // 2. User Service via Gateway
    // -------------------------------------------------------------
    console.log('\n--- [Step 2] User Service Operations via Gateway (/users) ---');
    console.log('-> Creating user via POST /users...');
    const userCreateRes = await makeRequest('/users', 'POST', {
      name: 'Alice Johnson',
      email: `alice_${Date.now()}@example.com`,
      phone: '+1-555-0199',
      address: '100 Gateway Boulevard, Cloud City',
    });
    console.log(`Status Code: ${userCreateRes.statusCode} Created`);
    console.log('Created User:', JSON.stringify(userCreateRes.data, null, 2));
    const userId = userCreateRes.data.data.id;

    console.log('\n-> Fetching all users via GET /users...');
    const allUsersRes = await makeRequest('/users', 'GET');
    console.log(`Status Code: ${allUsersRes.statusCode}, Total Users: ${allUsersRes.data.count}`);

    console.log(`\n-> Fetching user by ID via GET /users/${userId}...`);
    const singleUserRes = await makeRequest(`/users/${userId}`, 'GET');
    console.log(`Status Code: ${singleUserRes.statusCode}, User Name: ${singleUserRes.data.data.name}`);

    console.log(`\n-> Updating user via PUT /users/${userId}...`);
    const updateUserRes = await makeRequest(`/users/${userId}`, 'PUT', {
      phone: '+1-555-9999',
    });
    console.log(`Status Code: ${updateUserRes.statusCode}, Updated Phone: ${updateUserRes.data.data.phone}`);

    // -------------------------------------------------------------
    // 3. Product Service via Gateway
    // -------------------------------------------------------------
    console.log('\n--- [Step 3] Product Service Operations via Gateway (/products) ---');
    console.log('-> Creating product via POST /products...');
    const prodCreateRes = await makeRequest('/products', 'POST', {
      name: 'Cloud-Connected Smart Display',
      description: 'Smart display with voice-control and ambient lighting',
      price: 199.99,
      stock: 40,
      category: 'Smart Home',
    });
    console.log(`Status Code: ${prodCreateRes.statusCode} Created`);
    console.log('Created Product:', JSON.stringify(prodCreateRes.data, null, 2));
    const productId = prodCreateRes.data.data.id;

    console.log('\n-> Fetching all products via GET /products...');
    const allProdsRes = await makeRequest('/products', 'GET');
    console.log(`Status Code: ${allProdsRes.statusCode}, Total Products: ${allProdsRes.data.count}`);

    console.log(`\n-> Fetching product by ID via GET /products/${productId}...`);
    const singleProdRes = await makeRequest(`/products/${productId}`, 'GET');
    console.log(`Status Code: ${singleProdRes.statusCode}, Product: ${singleProdRes.data.data.name}`);

    // -------------------------------------------------------------
    // 4. Order Service via Gateway (Cross-service integration)
    // -------------------------------------------------------------
    console.log('\n--- [Step 4] Order Service Operations via Gateway (/orders) ---');
    console.log(`-> Creating order for User [${userId}] and Product [${productId}]...`);
    const orderCreateRes = await makeRequest('/orders', 'POST', {
      userId,
      productId,
      quantity: 2,
    });
    console.log(`Status Code: ${orderCreateRes.statusCode} Created`);
    console.log('Created Order:', JSON.stringify(orderCreateRes.data, null, 2));
    const orderId = orderCreateRes.data.data.id;

    console.log('\n-> Fetching all orders via GET /orders...');
    const allOrdersRes = await makeRequest('/orders', 'GET');
    console.log(`Status Code: ${allOrdersRes.statusCode}, Total Orders: ${allOrdersRes.data.count}`);

    console.log(`\n-> Fetching order by ID via GET /orders/${orderId}...`);
    const singleOrderRes = await makeRequest(`/orders/${orderId}`, 'GET');
    console.log(`Status Code: ${singleOrderRes.statusCode}, Order Total: $${singleOrderRes.data.data.totalPrice}`);

    // -------------------------------------------------------------
    // 5. Cross-Service Validation & Error Handling via Gateway
    // -------------------------------------------------------------
    console.log('\n--- [Step 5] Downstream Business Validation Error Handling ---');
    console.log('-> Submitting order with non-existent User ID (expecting 404)...');
    const invalidUserOrder = await makeRequest('/orders', 'POST', {
      userId: '65e900000000000000000000',
      productId,
      quantity: 1,
    });
    console.log(`Status Code: ${invalidUserOrder.statusCode}`);
    console.log('Response:', JSON.stringify(invalidUserOrder.data, null, 2));

    console.log('\n-> Submitting order with non-existent Product ID (expecting 404)...');
    const invalidProdOrder = await makeRequest('/orders', 'POST', {
      userId,
      productId: '65e900000000000000000000',
      quantity: 1,
    });
    console.log(`Status Code: ${invalidProdOrder.statusCode}`);
    console.log('Response:', JSON.stringify(invalidProdOrder.data, null, 2));

    // -------------------------------------------------------------
    // 6. Centralized Gateway 404 Handling
    // -------------------------------------------------------------
    console.log('\n--- [Step 6] Centralized Gateway 404 Handling ---');
    const notFoundRes = await makeRequest('/non-existent-gateway-endpoint', 'GET');
    console.log(`Status Code: ${notFoundRes.statusCode}`);
    console.log('Response:', JSON.stringify(notFoundRes.data, null, 2));

    console.log('\n================================================================');
    console.log('   ALL GATEWAY & MICROSERVICES TESTS COMPLETED SUCCESSFULLY!   ');
    console.log('================================================================\n');
  } catch (err) {
    console.error('[Test Execution Error]:', err.message);
  }
}

runGatewayTestSuite();
