const mongoose = require('mongoose');
const config = require('../config');
const { DSATopic, DSAProblem } = require('../models/DSA');

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Sample DSA topics
const sampleTopics = [
  {
    name: 'Arrays',
    slug: 'arrays',
    description: 'Learn about arrays, one of the most fundamental data structures',
    category: 'basic',
    order: 1,
    estimatedTime: 120,
    concepts: [
      {
        title: 'Array Basics',
        description: 'Understanding array structure and operations',
        timeComplexity: 'O(1) for access, O(n) for search',
        spaceComplexity: 'O(n)'
      }
    ],
    isActive: true
  },
  {
    name: 'Linked Lists',
    slug: 'linked-lists',
    description: 'Master linked lists and their various types',
    category: 'basic',
    order: 2,
    estimatedTime: 150,
    concepts: [
      {
        title: 'Singly Linked List',
        description: 'Basic linked list with forward pointers',
        timeComplexity: 'O(n) for search, O(1) for insertion/deletion at head',
        spaceComplexity: 'O(n)'
      }
    ],
    isActive: true
  },
  {
    name: 'Stacks and Queues',
    slug: 'stacks-queues',
    description: 'Learn about LIFO and FIFO data structures',
    category: 'basic',
    order: 3,
    estimatedTime: 100,
    concepts: [
      {
        title: 'Stack Operations',
        description: 'Push, pop, peek operations',
        timeComplexity: 'O(1) for all operations',
        spaceComplexity: 'O(n)'
      }
    ],
    isActive: true
  },
  {
    name: 'Trees',
    slug: 'trees',
    description: 'Explore tree data structures and algorithms',
    category: 'intermediate',
    order: 4,
    estimatedTime: 200,
    concepts: [
      {
        title: 'Binary Trees',
        description: 'Trees with at most two children per node',
        timeComplexity: 'O(log n) for balanced trees',
        spaceComplexity: 'O(n)'
      }
    ],
    isActive: true
  },
  {
    name: 'Graphs',
    slug: 'graphs',
    description: 'Master graph algorithms and traversals',
    category: 'advanced',
    order: 5,
    estimatedTime: 250,
    concepts: [
      {
        title: 'Graph Traversal',
        description: 'DFS and BFS algorithms',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)'
      }
    ],
    isActive: true
  }
];

// Sample DSA problems
const sampleProblems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    difficulty: 'easy',
    tags: ['array', 'hash-table'],
    constraints: [
      'Each input would have exactly one solution',
      'You may not use the same element twice'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] = 2 + 7 = 9'
      }
    ],
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expectedOutput: [0, 1],
        isHidden: false
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expectedOutput: [1, 2],
        isHidden: false
      }
    ],
    hints: [
      {
        level: 1,
        content: 'Try using a hash map to store the numbers you\'ve seen',
        pointsDeduction: 5
      }
    ],
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n    // Your code here\n}',
      python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
      java: 'public int[] twoSum(int[] nums, int target) {\n    // Your code here\n}',
      cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}'
    },
    totalAttempts: 0,
    totalSolved: 0,
    successRate: 0,
    isActive: true
  },
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    description: 'Reverse a singly linked list.',
    difficulty: 'easy',
    tags: ['linked-list', 'recursion'],
    constraints: [
      'The number of nodes in the list is the range [0, 5000]',
      '-5000 <= Node.val <= 5000'
    ],
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: 'Reverse the linked list'
      }
    ],
    testCases: [
      {
        input: { head: [1, 2, 3, 4, 5] },
        expectedOutput: [5, 4, 3, 2, 1],
        isHidden: false
      }
    ],
    hints: [
      {
        level: 1,
        content: 'Think about using three pointers: prev, current, and next',
        pointsDeduction: 5
      }
    ],
    starterCode: {
      javascript: 'function reverseList(head) {\n    // Your code here\n}',
      python: 'def reverse_list(head):\n    # Your code here\n    pass'
    },
    totalAttempts: 0,
    totalSolved: 0,
    successRate: 0,
    isActive: true
  }
];

async function seedDSAData() {
  try {
    console.log('🌱 Starting DSA data seeding...');

    // Check if topics already exist
    const existingTopicsCount = await DSATopic.countDocuments();
    console.log(`📊 Found ${existingTopicsCount} existing topics`);

    if (existingTopicsCount === 0) {
      console.log('📝 Creating sample topics...');
      const createdTopics = await DSATopic.insertMany(sampleTopics);
      console.log(`✅ Created ${createdTopics.length} topics`);

      // Create problems and link them to topics
      console.log('📝 Creating sample problems...');
      const topicMap = {};
      createdTopics.forEach(topic => {
        topicMap[topic.slug] = topic._id;
      });

      // Link problems to topics
      sampleProblems[0].topic = topicMap['arrays']; // Two Sum -> Arrays
      sampleProblems[1].topic = topicMap['linked-lists']; // Reverse Linked List -> Linked Lists

      const createdProblems = await DSAProblem.insertMany(sampleProblems);
      console.log(`✅ Created ${createdProblems.length} problems`);
    } else {
      console.log('ℹ️ Topics already exist, skipping seeding');
    }

    console.log('🎉 DSA data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding DSA data:', error);
  }
}

async function main() {
  await connectDB();
  await seedDSAData();
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedDSAData };
