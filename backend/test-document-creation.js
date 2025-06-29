// Test script to verify document creation and mention processing
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Document = require('./models/Document');
const User = require('./models/User');

// Import the functions we want to test
const extractMentionedIds = (content) => {
    if (!content) return new Set();
    
    const ids = new Set();
    const mentionRegex = /data-mention="([^"]+)"/g;
    let match;
    
    console.log('Extracting mentions from content:', content.substring(0, 200) + '...');
    
    while ((match = mentionRegex.exec(content)) !== null) {
        const userId = match[1];
        if (userId && userId.trim()) {
            ids.add(userId.trim());
            console.log('Found mention:', userId);
        }
    }
    
    console.log('Total mentions found:', ids.size);
    return ids;
};

const processMentions = async (document, newContent, oldContent, authorId) => {
    try {
        const newMentionIds = extractMentionedIds(newContent);
        const oldMentionIds = extractMentionedIds(oldContent);

        const newlyMentionedIds = [...newMentionIds].filter(id => !oldMentionIds.has(id));

        if (newlyMentionedIds.length === 0) {
            console.log('No new mentions to process');
            return;
        }

        console.log(`Found ${newlyMentionedIds.length} new mentions.`);

        for (const userId of newlyMentionedIds) {
            try {
                if (userId === authorId.toString()) {
                    console.log(`Skipping self-mention for user ${userId}`);
                    continue;
                }

                const isAlreadyShared = document.sharedWith.some(
                    share => share.user.toString() === userId
                );

                if (!isAlreadyShared) {
                    document.sharedWith.push({ user: userId, permission: 'view' });
                    console.log(`Auto-sharing document "${document.title}" with user ${userId}`);
                }

                const notification = {
                    documentId: document._id,
                    mentionedBy: authorId,
                    timestamp: new Date(),
                    read: false
                };

                await User.findByIdAndUpdate(userId, {
                    $push: { 
                        notifications: {
                            $each: [notification],
                            $position: 0
                        }
                    }
                });
                console.log(`Pushed in-app notification to user ${userId} for document ${document._id}`);
            } catch (userError) {
                console.error(`Error processing mention for user ${userId}:`, userError);
            }
        }
    } catch (error) {
        console.error('Error in processMentions:', error);
        throw error;
    }
};

const createDocument = async (title, content, visibility, authorId) => {
    try {
        console.log('Creating document...');
        
        let newDocument = new Document({
            title,
            content,
            visibility,
            author: authorId
        });
        
        await newDocument.save();
        console.log('Document saved with ID:', newDocument._id);

        try {
            await processMentions(newDocument, content, '', authorId);
        } catch (mentionError) {
            console.error('Error processing mentions:', mentionError);
        }

        const savedDocument = await newDocument.save();
        console.log('Document creation completed successfully');
        return savedDocument;
    } catch (err) {
        console.error('Error creating document:', err.message);
        throw err;
    }
};

// Test function
const runTests = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');

        // Create test users
        console.log('\nCreating test users...');
        const testUser1 = await User.create({
            name: 'Test User 1',
            email: 'test1@example.com',
            password: 'password123'
        });
        
        const testUser2 = await User.create({
            name: 'Test User 2',
            email: 'test2@example.com',
            password: 'password123'
        });

        console.log('Test users created:', testUser1._id, testUser2._id);

        // Test cases
        const testCases = [
            {
                name: 'Document without mentions',
                title: 'Test Document 1',
                content: '<p>This is a regular document without any mentions.</p>',
                visibility: 'private'
            },
            {
                name: 'Document with single mention',
                title: 'Test Document 2',
                content: `<p>Hello <span class="mention" data-mention="${testUser1._id}">@Test User 1</span>, how are you?</p>`,
                visibility: 'private'
            },
            {
                name: 'Document with multiple mentions',
                title: 'Test Document 3',
                content: `<p>Hello <span class="mention" data-mention="${testUser1._id}">@Test User 1</span> and <span class="mention" data-mention="${testUser2._id}">@Test User 2</span>, how are you?</p>`,
                visibility: 'private'
            }
        ];

        console.log('\nRunning document creation tests...');
        
        for (const testCase of testCases) {
            console.log(`\n--- Testing: ${testCase.name} ---`);
            try {
                const document = await createDocument(
                    testCase.title,
                    testCase.content,
                    testCase.visibility,
                    testUser1._id
                );
                console.log(`✅ ${testCase.name} - SUCCESS`);
                console.log('Document ID:', document._id);
                console.log('Shared with:', document.sharedWith.length, 'users');
            } catch (error) {
                console.log(`❌ ${testCase.name} - FAILED:`, error.message);
            }
        }

        console.log('\n✅ All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

// Run the tests
runTests(); 