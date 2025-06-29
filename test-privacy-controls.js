const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test data
let testUsers = [];
let testDocuments = [];
let authTokens = [];

async function createTestUser(name, email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      password
    });
    console.log(`✅ Created user: ${name}`);
    return response.data.user;
  } catch (error) {
    console.log(`❌ Failed to create user ${name}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    console.log(`✅ Logged in user: ${email}`);
    return response.data.token;
  } catch (error) {
    console.log(`❌ Failed to login user ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function createDocument(token, title, content, visibility = 'private') {
  try {
    const response = await axios.post(`${API_BASE_URL}/documents`, {
      title,
      content,
      visibility
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Created document: ${title} (${visibility})`);
    return response.data;
  } catch (error) {
    console.log(`❌ Failed to create document ${title}:`, error.response?.data?.msg || error.message);
    return null;
  }
}

async function testPublicDocumentAccess(documentId) {
  try {
    // Test public access without authentication
    const response = await axios.get(`${API_BASE_URL}/documents/public/${documentId}`);
    console.log(`✅ Public document accessible without auth: ${response.data.title}`);
    return true;
  } catch (error) {
    console.log(`❌ Public document not accessible:`, error.response?.data?.msg || error.message);
    return false;
  }
}

async function testPrivateDocumentAccess(token, documentId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Private document accessible with auth: ${response.data.title}`);
    return true;
  } catch (error) {
    console.log(`❌ Private document not accessible:`, error.response?.data?.msg || error.message);
    return false;
  }
}

async function testShareDocument(token, documentId, userId, permission) {
  try {
    const response = await axios.post(`${API_BASE_URL}/documents/${documentId}/share`, {
      userId,
      permission
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Document shared with user ${userId} (${permission} permission)`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to share document:`, error.response?.data?.msg || error.message);
    return false;
  }
}

async function testRemoveSharedUser(token, documentId, userId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}/share/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ User ${userId} removed from document sharing`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to remove user:`, error.response?.data?.msg || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Privacy Controls Test Suite\n');

  // Step 1: Create test users
  console.log('📝 Creating test users...');
  const user1 = await createTestUser('Test User 1', 'test1@example.com', 'password123');
  const user2 = await createTestUser('Test User 2', 'test2@example.com', 'password123');
  const user3 = await createTestUser('Test User 3', 'test3@example.com', 'password123');
  
  testUsers = [user1, user2, user3].filter(Boolean);
  
  if (testUsers.length < 2) {
    console.log('❌ Need at least 2 users for testing. Exiting.');
    return;
  }

  // Step 2: Login users
  console.log('\n🔐 Logging in users...');
  const token1 = await loginUser('test1@example.com', 'password123');
  const token2 = await loginUser('test2@example.com', 'password123');
  
  authTokens = [token1, token2].filter(Boolean);
  
  if (authTokens.length < 2) {
    console.log('❌ Need at least 2 logged in users for testing. Exiting.');
    return;
  }

  // Step 3: Create test documents
  console.log('\n📄 Creating test documents...');
  const publicDoc = await createDocument(token1, 'Public Test Document', 'This is a public document content.', 'public');
  const privateDoc = await createDocument(token1, 'Private Test Document', 'This is a private document content.', 'private');
  const sharedDoc = await createDocument(token1, 'Shared Test Document', 'This is a shared document content.', 'shared');
  
  testDocuments = [publicDoc, privateDoc, sharedDoc].filter(Boolean);
  
  if (testDocuments.length < 3) {
    console.log('❌ Need at least 3 documents for testing. Exiting.');
    return;
  }

  // Step 4: Test public document access
  console.log('\n🌍 Testing public document access...');
  await testPublicDocumentAccess(publicDoc._id);

  // Step 5: Test private document access
  console.log('\n🔒 Testing private document access...');
  await testPrivateDocumentAccess(token1, privateDoc._id);
  await testPrivateDocumentAccess(token2, privateDoc._id); // Should fail

  // Step 6: Test document sharing
  console.log('\n👥 Testing document sharing...');
  await testShareDocument(token1, sharedDoc._id, user2._id, 'view');
  await testShareDocument(token1, sharedDoc._id, user3._id, 'edit');

  // Step 7: Test shared document access
  console.log('\n🔓 Testing shared document access...');
  await testPrivateDocumentAccess(token2, sharedDoc._id); // Should work now
  await testPrivateDocumentAccess(token1, sharedDoc._id); // Author should always work

  // Step 8: Test removing shared users
  console.log('\n🗑️ Testing remove shared users...');
  await testRemoveSharedUser(token1, sharedDoc._id, user2._id);

  // Step 9: Verify user was removed
  console.log('\n✅ Verifying user removal...');
  await testPrivateDocumentAccess(token2, sharedDoc._id); // Should fail now

  console.log('\n🎉 Privacy Controls Test Suite completed!');
  console.log('\n📊 Summary:');
  console.log(`- Created ${testUsers.length} test users`);
  console.log(`- Created ${testDocuments.length} test documents`);
  console.log(`- Tested public document access`);
  console.log(`- Tested private document access`);
  console.log(`- Tested document sharing and permissions`);
  console.log(`- Tested removing shared users`);
}

// Run the tests
runTests().catch(console.error); 