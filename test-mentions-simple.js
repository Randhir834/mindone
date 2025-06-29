// Simple test script to verify mention extraction logic
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

testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    const result = extractMentionedIds(testCase.content);
    const passed = result.size === testCase.expected;
    console.log(`Expected: ${testCase.expected}, Got: ${result.size}, ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('---');
});

console.log('Test completed!'); 