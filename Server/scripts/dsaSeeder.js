const mongoose = require('mongoose');
const { DSATopic, DSAProblem } = require('../models/DSA');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learnify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// DSA Topics Data
const dsaTopics = [
  {
    name: 'Arrays',
    slug: 'arrays',
    description: 'Learn about arrays, one of the most fundamental data structures in programming.',
    category: 'basic',
    order: 1,
    estimatedTime: 120,
    concepts: [
      {
        title: 'Array Basics',
        description: 'Understanding array structure, indexing, and basic operations',
        codeExample: 'let arr = [1, 2, 3, 4, 5];\nconsole.log(arr[0]); // 1',
        timeComplexity: 'O(1) for access',
        spaceComplexity: 'O(n)'
      },
      {
        title: 'Array Traversal',
        description: 'Different ways to iterate through arrays',
        codeExample: 'for(let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      }
    ],
    resources: [
      {
        title: 'Array Fundamentals',
        type: 'article',
        url: 'https://example.com/arrays',
        difficulty: 'beginner'
      }
    ]
  },
  {
    name: 'Linked Lists',
    slug: 'linked-lists',
    description: 'Master linked lists and understand dynamic memory allocation.',
    category: 'basic',
    order: 2,
    estimatedTime: 150,
    prerequisites: [],
    concepts: [
      {
        title: 'Singly Linked List',
        description: 'Basic linked list with nodes pointing to next element',
        codeExample: 'class ListNode {\n  constructor(val) {\n    this.val = val;\n    this.next = null;\n  }\n}',
        timeComplexity: 'O(n) for search',
        spaceComplexity: 'O(n)'
      }
    ]
  },
  {
    name: 'Stacks and Queues',
    slug: 'stacks-queues',
    description: 'Learn about LIFO and FIFO data structures.',
    category: 'basic',
    order: 3,
    estimatedTime: 100,
    concepts: [
      {
        title: 'Stack Operations',
        description: 'Push, pop, peek operations in stack',
        codeExample: 'let stack = [];\nstack.push(1);\nlet top = stack.pop();',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(n)'
      }
    ]
  },
  {
    name: 'Trees',
    slug: 'trees',
    description: 'Understand hierarchical data structures and tree algorithms.',
    category: 'intermediate',
    order: 4,
    estimatedTime: 200,
    concepts: [
      {
        title: 'Binary Trees',
        description: 'Trees where each node has at most two children',
        codeExample: 'class TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}',
        timeComplexity: 'O(log n) for balanced trees',
        spaceComplexity: 'O(n)'
      }
    ]
  },
  {
    name: 'Graphs',
    slug: 'graphs',
    description: 'Master graph algorithms and traversal techniques.',
    category: 'intermediate',
    order: 5,
    estimatedTime: 250,
    concepts: [
      {
        title: 'Graph Representation',
        description: 'Adjacency list and adjacency matrix representations',
        codeExample: 'let graph = {\n  A: [\'B\', \'C\'],\n  B: [\'A\', \'D\'],\n  C: [\'A\'],\n  D: [\'B\']\n};',
        timeComplexity: 'Varies by algorithm',
        spaceComplexity: 'O(V + E)'
      }
    ]
  },
  {
    name: 'Dynamic Programming',
    slug: 'dynamic-programming',
    description: 'Learn optimization techniques using memoization and tabulation.',
    category: 'advanced',
    order: 6,
    estimatedTime: 300,
    concepts: [
      {
        title: 'Memoization',
        description: 'Top-down approach with caching',
        codeExample: 'function fib(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 2) return 1;\n  memo[n] = fib(n-1, memo) + fib(n-2, memo);\n  return memo[n];\n}',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      }
    ]
  }
];

// Sample Problems Data
const dsaProblems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Find two numbers in an array that add up to a target sum.',
    difficulty: 'easy',
    tags: ['array', 'hash-table'],
    problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    inputFormat: 'nums = [2,7,11,15], target = 9',
    outputFormat: '[0,1]',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    testCases: [
      {
        input: '[2,7,11,15]\n9',
        expectedOutput: '[0,1]',
        isHidden: false,
        points: 25
      },
      {
        input: '[3,2,4]\n6',
        expectedOutput: '[1,2]',
        isHidden: false,
        points: 25
      },
      {
        input: '[3,3]\n6',
        expectedOutput: '[0,1]',
        isHidden: true,
        points: 50
      }
    ],
    hints: [
      {
        level: 1,
        content: 'Try using a hash map to store the numbers you\'ve seen so far.',
        pointsDeduction: 5
      },
      {
        level: 2,
        content: 'For each number, check if target - number exists in your hash map.',
        pointsDeduction: 10
      }
    ],
    editorialSolution: {
      approach: 'Hash Map',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      code: [
        {
          language: 'javascript',
          solution: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}'
        }
      ],
      explanation: 'We use a hash map to store each number and its index. For each element, we check if its complement (target - current number) exists in the map.'
    },
    totalPoints: 100,
    timeLimit: 1000,
    memoryLimit: 256
  },
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    description: 'Reverse a singly linked list.',
    difficulty: 'easy',
    tags: ['linked-list', 'recursion'],
    problemStatement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    inputFormat: 'head = [1,2,3,4,5]',
    outputFormat: '[5,4,3,2,1]',
    constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: 'Reverse the linked list.'
      }
    ],
    testCases: [
      {
        input: '[1,2,3,4,5]',
        expectedOutput: '[5,4,3,2,1]',
        isHidden: false,
        points: 50
      },
      {
        input: '[1,2]',
        expectedOutput: '[2,1]',
        isHidden: false,
        points: 25
      },
      {
        input: '[]',
        expectedOutput: '[]',
        isHidden: true,
        points: 25
      }
    ],
    hints: [
      {
        level: 1,
        content: 'Think about changing the direction of the pointers.',
        pointsDeduction: 5
      }
    ],
    editorialSolution: {
      approach: 'Iterative',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: [
        {
          language: 'javascript',
          solution: 'function reverseList(head) {\n    let prev = null;\n    let current = head;\n    \n    while (current !== null) {\n        let next = current.next;\n        current.next = prev;\n        prev = current;\n        current = next;\n    }\n    \n    return prev;\n}'
        }
      ],
      explanation: 'We iterate through the list and reverse the direction of each pointer.'
    }
  }
];

async function seedDSAData() {
  try {
    console.log('Starting DSA data seeding...');
    
    // Clear existing data
    await DSATopic.deleteMany({});
    await DSAProblem.deleteMany({});
    console.log('Cleared existing DSA data');
    
    // Insert topics
    const insertedTopics = await DSATopic.insertMany(dsaTopics);
    console.log(`Inserted ${insertedTopics.length} DSA topics`);
    
    // Create a map of topic names to IDs
    const topicMap = {};
    insertedTopics.forEach(topic => {
      topicMap[topic.slug] = topic._id;
    });
    
    // Update problems with correct topic IDs
    const problemsWithTopicIds = dsaProblems.map(problem => ({
      ...problem,
      topic: topicMap['arrays'] // For now, assign all problems to arrays topic
    }));
    
    // Insert problems
    const insertedProblems = await DSAProblem.insertMany(problemsWithTopicIds);
    console.log(`Inserted ${insertedProblems.length} DSA problems`);
    
    console.log('DSA data seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding DSA data:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeder
if (require.main === module) {
  seedDSAData();
}

module.exports = { seedDSAData };
