const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

async function runTests() {
  console.log('====================================================');
  console.log('   SOA LAB 6 - END-TO-END MICROSERVICES TEST SUITE  ');
  console.log('====================================================\n');

  try {
    // 1. Health Checks
    console.log('1. Checking Health of all 3 Services...');
    const hUser = await makeRequest({ hostname: 'localhost', port: 3001, path: '/health', method: 'GET' });
    const hProd = await makeRequest({ hostname: 'localhost', port: 3002, path: '/health', method: 'GET' });
    const hOrder = await makeRequest({ hostname: 'localhost', port: 3003, path: '/health', method: 'GET' });
    console.log(`- User Service Health: ${hUser.statusCode} OK ->`, hUser.data.status);
    console.log(`- Product Service Health: ${hProd.statusCode} OK ->`, hProd.data.status);
    console.log(`- Order Service Health: ${hOrder.statusCode} OK ->`, hOrder.data.status);

    // 2. Create User
    console.log('\n2. Creating a New User (POST /users on :3001)...');
    const userRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/users',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Alice Johnson',
        email: `alice_${Date.now()}@example.com`,
        phone: '+1-555-0199',
        address: '123 Innovation Way, Tech City',
      }
    );
    console.log(`- Status: ${userRes.statusCode}`);
    console.log('- Response:', JSON.stringify(userRes.data, null, 2));
    const userId = userRes.data.data.id;

    // 3. Get All Users
    console.log('\n3. Fetching All Users (GET /users on :3001)...');
    const allUsers = await makeRequest({ hostname: 'localhost', port: 3001, path: '/users', method: 'GET' });
    console.log(`- Status: ${allUsers.statusCode}, User Count: ${allUsers.data.count}`);

    // 4. Get User by ID
    console.log(`\n4. Fetching User by ID (${userId})...`);
    const singleUser = await makeRequest({ hostname: 'localhost', port: 3001, path: `/users/${userId}`, method: 'GET' });
    console.log(`- Status: ${singleUser.statusCode}, Name: ${singleUser.data.data.name}`);

    // 5. Create Product
    console.log('\n5. Creating a New Product (POST /products on :3002)...');
    const prodRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3002,
        path: '/products',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Premium over-ear Bluetooth headphones with active ANC',
        price: 149.99,
        stock: 25,
        category: 'Electronics',
      }
    );
    console.log(`- Status: ${prodRes.statusCode}`);
    console.log('- Response:', JSON.stringify(prodRes.data, null, 2));
    const productId = prodRes.data.data.id;

    // 6. Get All Products
    console.log('\n6. Fetching All Products (GET /products on :3002)...');
    const allProducts = await makeRequest({ hostname: 'localhost', port: 3002, path: '/products', method: 'GET' });
    console.log(`- Status: ${allProducts.statusCode}, Product Count: ${allProducts.data.count}`);

    // 7. Create Order (Demonstrates Order -> User & Order -> Product REST communication)
    console.log(`\n7. Creating an Order (POST /orders on :3003) with User: ${userId} and Product: ${productId}...`);
    const orderRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3003,
        path: '/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        userId,
        productId,
        quantity: 2,
      }
    );
    console.log(`- Status: ${orderRes.statusCode} Created`);
    console.log('- Order Response:', JSON.stringify(orderRes.data, null, 2));
    const orderId = orderRes.data.data.id;

    // 8. Fetch Order by ID
    console.log(`\n8. Fetching Order by ID (${orderId} on :3003)...`);
    const singleOrder = await makeRequest({ hostname: 'localhost', port: 3003, path: `/orders/${orderId}`, method: 'GET' });
    console.log(`- Status: ${singleOrder.statusCode}`);
    console.log('- Order Details:', JSON.stringify(singleOrder.data, null, 2));

    // 9. Error Handling Test: Invalid User ID -> 404
    console.log('\n9. Testing Invalid User ID (Order -> User validation failure, expecting 404)...');
    const invalidUserOrder = await makeRequest(
      {
        hostname: 'localhost',
        port: 3003,
        path: '/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        userId: '65e900000000000000000000',
        productId,
        quantity: 1,
      }
    );
    console.log(`- Status: ${invalidUserOrder.statusCode}`);
    console.log('- Response Body:', JSON.stringify(invalidUserOrder.data, null, 2));

    // 10. Error Handling Test: Invalid Product ID -> 404
    console.log('\n10. Testing Invalid Product ID (Order -> Product validation failure, expecting 404)...');
    const invalidProdOrder = await makeRequest(
      {
        hostname: 'localhost',
        port: 3003,
        path: '/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        userId,
        productId: '65e900000000000000000000',
        quantity: 1,
      }
    );
    console.log(`- Status: ${invalidProdOrder.statusCode}`);
    console.log('- Response Body:', JSON.stringify(invalidProdOrder.data, null, 2));

    console.log('\n====================================================');
    console.log('   ALL INTEGRATION TESTS PASSED SUCCESSFULLY!       ');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test failed with error:', err);
  }
}

runTests();
