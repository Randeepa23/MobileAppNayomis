async function testAdminLogin() {
  try {
    console.log('\n=== Testing Admin Login ===\n');
    
    const response = await fetch('http://localhost:5000/api/admin-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@nayomis.com',
        password: 'admin123'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin Login Successful!\n');
      console.log('Response:');
      console.log(JSON.stringify(data, null, 2));
      
      // Test token verification
      console.log('\n=== Testing Token Verification ===\n');
      const token = data.token;
      
      const verifyResponse = await fetch('http://localhost:5000/api/admin-auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        console.log('✅ Token Verification Successful!\n');
        console.log('Response:');
        console.log(JSON.stringify(verifyData, null, 2));
        console.log('\n✅ All tests passed! Admin authentication is working correctly.\n');
      } else {
        console.error('❌ Token verification failed:', verifyData);
      }
    } else {
      console.error('❌ Login failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminLogin();
