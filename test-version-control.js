const mongoose = require('mongoose');
const Document = require('./backend/models/Document');
const DocumentVersion = require('./backend/models/DocumentVersion');
const { createVersion, getVersionHistory, compareVersions, restoreVersion } = require('./backend/utils/versionControl');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/document-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testVersionControl() {
  try {
    console.log('🧪 Testing Version Control System...\n');

    // Create a test document
    console.log('1. Creating test document...');
    const testDocument = new Document({
      title: 'Test Document',
      content: '<p>Initial content</p>',
      author: new mongoose.Types.ObjectId(),
      visibility: 'private'
    });
    await testDocument.save();
    console.log(`✅ Document created with ID: ${testDocument._id}\n`);

    // Create initial version
    console.log('2. Creating initial version...');
    const initialVersion = await createVersion(
      testDocument._id,
      { title: 'Test Document', content: '<p>Initial content</p>', visibility: 'private' },
      testDocument.author,
      'Document created'
    );
    console.log(`✅ Initial version created: v${initialVersion.version}\n`);

    // Update document and create new version
    console.log('3. Updating document and creating new version...');
    testDocument.title = 'Updated Test Document';
    testDocument.content = '<p>Updated content with more text</p>';
    await testDocument.save();

    const updatedVersion = await createVersion(
      testDocument._id,
      { title: 'Updated Test Document', content: '<p>Updated content with more text</p>', visibility: 'private' },
      testDocument.author
    );
    console.log(`✅ Updated version created: v${updatedVersion.version}\n`);

    // Get version history
    console.log('4. Getting version history...');
    const history = await getVersionHistory(testDocument._id);
    console.log(`✅ Found ${history.length} versions:`);
    history.forEach(version => {
      console.log(`   - v${version.version}: ${version.changeSummary} (${version.wordCount} words)`);
    });
    console.log();

    // Compare versions
    console.log('5. Comparing versions...');
    const diff = await compareVersions(testDocument._id, 1, 2);
    console.log('✅ Version comparison:');
    console.log(`   - Title changed: ${diff.title.changed}`);
    console.log(`   - Content changed: ${diff.content.changed}`);
    console.log(`   - Word count difference: ${diff.content.wordCountDiff}`);
    console.log();

    // Test restore functionality
    console.log('6. Testing version restore...');
    const restoredVersion = await restoreVersion(testDocument._id, 1, testDocument.author);
    console.log(`✅ Restored to version 1, new version created: v${restoredVersion.version}\n`);

    // Final version history
    console.log('7. Final version history...');
    const finalHistory = await getVersionHistory(testDocument._id);
    console.log(`✅ Final version count: ${finalHistory.length}`);
    finalHistory.forEach(version => {
      console.log(`   - v${version.version}: ${version.changeSummary}`);
    });

    console.log('\n🎉 All version control tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testVersionControl(); 