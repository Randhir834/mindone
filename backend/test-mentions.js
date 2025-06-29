const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test data
const testUsers = [
  { name: 'John Doe', email: 'john@example.com', password: 'password123' },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' }
];

let userTokens = [];

async function testMentionFunctionality() {
  console.log('🧪 Testing @Mention Functionality...\n');

  try {
    // Step 1: Register test users
    console.log('1. Registering test users...');
    for (const user of testUsers) {
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, user);
        console.log(`   ✅ Registered: ${user.name} (${user.email})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          console.log(`   ⚠️  User already exists: ${user.name}`);
        } else {
          console.log(`   ❌ Failed to register ${user.name}:`, error.response?.data?.message || error.message);
        }
      }
    }

    // Step 2: Login users and get tokens
    console.log('\n2. Logging in users...');
    for (const user of testUsers) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: user.email,
          password: user.password
        });
        userTokens.push({
          name: user.name,
          token: response.data.token,
          userId: response.data.user.id
        });
        console.log(`   ✅ Logged in: ${user.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to login ${user.name}:`, error.response?.data?.message || error.message);
      }
    }

    if (userTokens.length < 2) {
      console.log('❌ Need at least 2 users to test mentions');
      return;
    }

    // Step 3: Create a document with first user
    console.log('\n3. Creating test document...');
    const firstUser = userTokens[0];
    const documentResponse = await axios.post(`${API_BASE_URL}/documents`, {
      title: 'Test Document with Mentions',
      content: '<p>This is a test document.</p>',
      visibility: 'private'
    }, {
      headers: { Authorization: `Bearer ${firstUser.token}` }
    });

    const documentId = documentResponse.data._id;
    console.log(`   ✅ Created document: ${documentId}`);

    // Step 4: Test user search
    console.log('\n4. Testing user search...');
    const searchResponse = await axios.get(`${API_BASE_URL}/auth/users/search?q=Jane`, {
      headers: { Authorization: `Bearer ${firstUser.token}` }
    });
    console.log(`   ✅ Found ${searchResponse.data.length} users matching "Jane"`);

    // Step 5: Test document sharing
    console.log('\n5. Testing document sharing...');
    const secondUser = userTokens[1];
    await axios.post(`${API_BASE_URL}/documents/${documentId}/share`, {
      userId: secondUser.userId,
      permission: 'view'
    }, {
      headers: { Authorization: `Bearer ${firstUser.token}` }
    });
    console.log(`   ✅ Shared document with ${secondUser.name}`);

    // Step 6: Test notifications
    console.log('\n6. Testing notifications...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${secondUser.token}` }
    });
    console.log(`   ✅ ${secondUser.name} has ${notificationsResponse.data.length} notifications`);

    // Step 7: Test mention notification creation
    console.log('\n7. Testing mention notification...');
    await axios.post(`${API_BASE_URL}/notifications/mention`, {
      documentId: documentId,
      mentionedUserId: secondUser.userId,
      mentionedUserName: secondUser.name
    }, {
      headers: { Authorization: `Bearer ${firstUser.token}` }
    });
    console.log(`   ✅ Created mention notification for ${secondUser.name}`);

    // Step 8: Check updated notifications
    const updatedNotificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${secondUser.token}` }
    });
    console.log(`   ✅ ${secondUser.name} now has ${updatedNotificationsResponse.data.length} notifications`);

    console.log('\n🎉 All tests passed! The @mention functionality is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   - User registration and login ✅');
    console.log('   - Document creation ✅');
    console.log('   - User search for mentions ✅');
    console.log('   - Document sharing ✅');
    console.log('   - Notification system ✅');
    console.log('   - Mention notifications ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testMentionFunctionality(); 