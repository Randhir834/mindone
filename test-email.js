const axios = require('axios');

// Test email functionality
async function testEmail() {
  try {
    console.log('🧪 Testing email functionality...');
    
    const response = await axios.post('http://localhost:5001/api/test-email', {
      email: 'test@example.com'
    });
    
    console.log('✅ Response:', response.data);
    console.log('📧 Check the server console for email preview URL');
    
  } catch (error) {
    console.error('❌ Error testing email:', error.response?.data || error.message);
  }
}

// Test forgot password functionality
async function testForgotPassword() {
  try {
    console.log('🔐 Testing forgot password functionality...');
    
    const response = await axios.post('http://localhost:5001/api/auth/forgot', {
      email: 'test@example.com'
    });
    
    console.log('✅ Response:', response.data);
    console.log('📧 Check the server console for email preview URL');
    
  } catch (error) {
    console.error('❌ Error testing forgot password:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting email tests...\n');
  
  await testEmail();
  console.log('\n' + '='.repeat(50) + '\n');
  await testForgotPassword();
  
  console.log('\n✅ Tests completed!');
  console.log('📧 Check the server console for email preview URLs');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server is not running. Please start the backend server first:');
    console.error('   cd backend && npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main(); 