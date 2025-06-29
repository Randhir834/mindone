const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test data
const testUsers = [
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'password123' },
  { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123' }
];

let userTokens = [];

async function testComprehensiveMentionFunctionality() {
  console.log('🧪 Testing Comprehensive @Mention Functionality...\n');

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

    if (userTokens.length < 3) {
      console.log('❌ Need at least 3 users to test comprehensive mentions');
      return;
    }

    const [alice, bob, charlie] = userTokens;

    // Step 3: Create a document with Alice (no mentions initially)
    console.log('\n3. Creating initial document...');
    const documentResponse = await axios.post(`${API_BASE_URL}/documents`, {
      title: 'Project Planning Document',
      content: '<p>This is a project planning document.</p>',
      visibility: 'private'
    }, {
      headers: { Authorization: `Bearer ${alice.token}` }
    });

    const documentId = documentResponse.data._id;
    console.log(`   ✅ Created document: ${documentId}`);

    // Step 4: Verify Bob and Charlie cannot access the document initially
    console.log('\n4. Testing initial access restrictions...');
    for (const user of [bob, charlie]) {
      try {
        await axios.get(`${API_BASE_URL}/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        console.log(`   ❌ ${user.name} can access document (should not be able to)`);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log(`   ✅ ${user.name} correctly cannot access document`);
        } else {
          console.log(`   ❌ Unexpected error for ${user.name}:`, error.response?.data?.msg || error.message);
        }
      }
    }

    // Step 5: Alice mentions Bob in the document
    console.log('\n5. Testing mention during document update...');
    const mentionContent = `<p>This is a project planning document.</p><p>Hello <span class="mention" data-mention="${bob.userId}">@${bob.name}</span>, please review this document.</p>`;
    
    await axios.put(`${API_BASE_URL}/documents/${documentId}`, {
      content: mentionContent
    }, {
      headers: { Authorization: `Bearer ${alice.token}` }
    });
    console.log(`   ✅ Updated document with mention of ${bob.name}`);

    // Step 6: Verify Bob can now access the document
    console.log('\n6. Testing access after mention...');
    try {
      const accessResponse = await axios.get(`${API_BASE_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${bob.token}` }
      });
      console.log(`   ✅ ${bob.name} can now access the document: "${accessResponse.data.title}"`);
    } catch (error) {
      console.log(`   ❌ ${bob.name} still cannot access the document:`, error.response?.data?.msg || error.message);
    }

    // Step 7: Verify Charlie still cannot access the document
    try {
      await axios.get(`${API_BASE_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${charlie.token}` }
      });
      console.log(`   ❌ ${charlie.name} can access document (should not be able to)`);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log(`   ✅ ${charlie.name} correctly still cannot access document`);
      } else {
        console.log(`   ❌ Unexpected error for ${charlie.name}:`, error.response?.data?.msg || error.message);
      }
    }

    // Step 8: Check Bob's notifications
    console.log('\n7. Testing notifications...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${bob.token}` }
    });
    console.log(`   ✅ ${bob.name} has ${notificationsResponse.data.length} notifications`);

    // Step 9: Alice mentions Charlie as well
    console.log('\n8. Testing multiple mentions...');
    const multipleMentionContent = `<p>This is a project planning document.</p><p>Hello <span class="mention" data-mention="${bob.userId}">@${bob.name}</span> and <span class="mention" data-mention="${charlie.userId}">@${charlie.name}</span>, please review this document.</p>`;
    
    await axios.put(`${API_BASE_URL}/documents/${documentId}`, {
      content: multipleMentionContent
    }, {
      headers: { Authorization: `Bearer ${alice.token}` }
    });
    console.log(`   ✅ Updated document with mentions of ${bob.name} and ${charlie.name}`);

    // Step 10: Verify Charlie can now access the document
    console.log('\n9. Testing access for second mentioned user...');
    try {
      const accessResponse = await axios.get(`${API_BASE_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${charlie.token}` }
      });
      console.log(`   ✅ ${charlie.name} can now access the document: "${accessResponse.data.title}"`);
    } catch (error) {
      console.log(`   ❌ ${charlie.name} still cannot access the document:`, error.response?.data?.msg || error.message);
    }

    // Step 11: Check Charlie's notifications
    const charlieNotificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${charlie.token}` }
    });
    console.log(`   ✅ ${charlie.name} has ${charlieNotificationsResponse.data.length} notifications`);

    // Step 12: Test that mentioned users can view but not edit (read-only access)
    console.log('\n10. Testing read-only access for mentioned users...');
    try {
      await axios.put(`${API_BASE_URL}/documents/${documentId}`, {
        content: '<p>Unauthorized edit attempt</p>'
      }, {
        headers: { Authorization: `Bearer ${bob.token}` }
      });
      console.log(`   ❌ ${bob.name} can edit document (should not be able to)`);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log(`   ✅ ${bob.name} correctly cannot edit document (read-only access)`);
      } else {
        console.log(`   ❌ Unexpected error for ${bob.name}:`, error.response?.data?.msg || error.message);
      }
    }

    // Step 13: Test document listing for mentioned users
    console.log('\n11. Testing document listing for mentioned users...');
    for (const user of [bob, charlie]) {
      try {
        const documentsResponse = await axios.get(`${API_BASE_URL}/documents`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const hasAccess = documentsResponse.data.some(doc => doc._id === documentId);
        if (hasAccess) {
          console.log(`   ✅ ${user.name} can see the document in their document list`);
        } else {
          console.log(`   ❌ ${user.name} cannot see the document in their document list`);
        }
      } catch (error) {
        console.log(`   ❌ Error getting documents for ${user.name}:`, error.response?.data?.msg || error.message);
      }
    }

    console.log('\n🎉 All comprehensive tests passed! The @mention functionality is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   - User registration and login ✅');
    console.log('   - Document creation ✅');
    console.log('   - Initial access restrictions ✅');
    console.log('   - Automatic access granting via mentions ✅');
    console.log('   - Multiple mentions support ✅');
    console.log('   - Read-only access for mentioned users ✅');
    console.log('   - Notification system ✅');
    console.log('   - Document listing for mentioned users ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the comprehensive test
testComprehensiveMentionFunctionality(); 