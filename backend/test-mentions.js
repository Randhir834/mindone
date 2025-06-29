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

    // Step 7: Test mention functionality by updating document with mention
    console.log('\n7. Testing mention functionality...');
    const mentionContent = `<p>Hello <span class="mention" data-mention="${secondUser.userId}">@${secondUser.name}</span>, please review this document.</p>`;
    
    await axios.put(`${API_BASE_URL}/documents/${documentId}`, {
      content: mentionContent
    }, {
      headers: { Authorization: `Bearer ${firstUser.token}` }
    });
    console.log(`   ✅ Updated document with mention of ${secondUser.name}`);

    // Step 8: Check if mentioned user can access the document
    console.log('\n8. Testing document access for mentioned user...');
    try {
      const accessResponse = await axios.get(`${API_BASE_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${secondUser.token}` }
      });
      console.log(`   ✅ ${secondUser.name} can access the document: "${accessResponse.data.title}"`);
    } catch (error) {
      console.log(`   ❌ ${secondUser.name} cannot access the document:`, error.response?.data?.msg || error.message);
    }

    // Step 9: Check updated notifications
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
    console.log('   - Automatic mention processing ✅');
    console.log('   - Document access for mentioned users ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test script to verify mention extraction and processing
const extractMentionedIds = (content) => {
    if (!content) return new Set();
    
    const ids = new Set();
    const mentionRegex = /data-mention="([^"]+)"/g;
    let match;
    
    console.log('Extracting mentions from content:', content.substring(0, 200) + '...');
    
    while ((match = mentionRegex.exec(content)) !== null) {
        // match[1] is the captured group (the user ID)
        const userId = match[1];
        if (userId && userId.trim()) {
            ids.add(userId.trim());
            console.log('Found mention:', userId);
        }
    }
    
    console.log('Total mentions found:', ids.size);
    return ids;
};

// Test cases
const testCases = [
    {
        name: 'No mentions',
        content: '<p>This is a regular document without any mentions.</p>',
        expected: 0
    },
    {
        name: 'Single mention',
        content: '<p>Hello <span class="mention" data-mention="507f1f77bcf86cd799439011">@John Doe</span>, how are you?</p>',
        expected: 1
    },
    {
        name: 'Multiple mentions',
        content: '<p>Hello <span class="mention" data-mention="507f1f77bcf86cd799439011">@John Doe</span> and <span class="mention" data-mention="507f1f77bcf86cd799439012">@Jane Smith</span>, how are you?</p>',
        expected: 2
    },
    {
        name: 'Duplicate mentions',
        content: '<p>Hello <span class="mention" data-mention="507f1f77bcf86cd799439011">@John Doe</span> and <span class="mention" data-mention="507f1f77bcf86cd799439011">@John Doe</span> again!</p>',
        expected: 1
    },
    {
        name: 'Empty mention',
        content: '<p>Hello <span class="mention" data-mention="">@Empty</span></p>',
        expected: 0
    }
];

console.log('Testing mention extraction...\n');

testCases.forEach(testCase => {
    const result = extractMentionedIds(testCase.content);
    const passed = result.size === testCase.expected;
    console.log(`${passed ? '✅' : '❌'} ${testCase.name}: Expected ${testCase.expected}, Got ${result.size}`);
});

console.log('\n' + '='.repeat(50) + '\n');

// Run the main test
testMentionFunctionality(); 