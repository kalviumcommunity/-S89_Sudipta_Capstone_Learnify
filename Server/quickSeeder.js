const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const quickQuestions = [
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Plant physiology',
    questionText: 'Which part of the plant is responsible for photosynthesis?',
    options: ['Root', 'Stem', 'Leaf', 'Flower'],
    correctAnswer: 'Leaf',
  },
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Plant physiology',
    questionText: 'What is the primary pigment involved in photosynthesis?',
    options: ['Chlorophyll a', 'Chlorophyll b', 'Carotenoids', 'Anthocyanins'],
    correctAnswer: 'Chlorophyll a',
  },
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Plant physiology',
    questionText: 'In which organelle does photosynthesis occur?',
    options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'],
    correctAnswer: 'Chloroplast',
  },
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Plant physiology',
    questionText: 'What is the end product of photosynthesis?',
    options: ['Carbon dioxide', 'Water', 'Glucose', 'Oxygen'],
    correctAnswer: 'Glucose',
  },
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Plant physiology',
    questionText: 'Which process occurs in the stomata?',
    options: ['Photosynthesis', 'Respiration', 'Gas exchange', 'Protein synthesis'],
    correctAnswer: 'Gas exchange',
  },

  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Human physiology',
    questionText: 'Which organ is responsible for pumping blood?',
    options: ['Liver', 'Kidney', 'Heart', 'Lungs'],
    correctAnswer: 'Heart',
  },
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Human physiology',
    questionText: 'What is the normal human body temperature?',
    options: ['36°C', '37°C', '38°C', '39°C'],
    correctAnswer: '37°C',
  },
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Human physiology',
    questionText: 'Which blood cells are responsible for immunity?',
    options: ['Red blood cells', 'White blood cells', 'Platelets', 'Plasma'],
    correctAnswer: 'White blood cells',
  },

  {
    exam: 'jee',
    subject: 'physics',
    chapter: 'Mechanics',
    questionText: 'What is the SI unit of force?',
    options: ['Joule', 'Newton', 'Watt', 'Pascal'],
    correctAnswer: 'Newton',
  },
  {
    exam: 'jee',
    subject: 'physics',
    chapter: 'Mechanics',
    questionText: 'According to Newton\'s first law, an object at rest will:',
    options: ['Start moving', 'Remain at rest', 'Accelerate', 'Change direction'],
    correctAnswer: 'Remain at rest',
  },
  {
    exam: 'jee',
    subject: 'physics',
    chapter: 'Mechanics',
    questionText: 'What is the formula for kinetic energy?',
    options: ['mgh', '½mv²', 'mv', 'ma'],
    correctAnswer: '½mv²',
  },

  {
    exam: 'jee',
    subject: 'mathematics',
    chapter: 'Calculus',
    questionText: 'What is the derivative of x²?',
    options: ['x', '2x', 'x³', '2x²'],
    correctAnswer: '2x',
  },
  {
    exam: 'jee',
    subject: 'mathematics',
    chapter: 'Calculus',
    questionText: 'What is the integral of 1/x?',
    options: ['ln(x)', 'x²', '1/x²', 'e^x'],
    correctAnswer: 'ln(x)',
  },

  {
    exam: 'jee',
    subject: 'chemistry',
    chapter: 'Organic chemistry',
    questionText: 'What is the molecular formula of methane?',
    options: ['CH₄', 'C₂H₆', 'C₃H₈', 'C₄H₁₀'],
    correctAnswer: 'CH₄',
  },
  {
    exam: 'jee',
    subject: 'chemistry',
    chapter: 'Organic chemistry',
    questionText: 'Which functional group is present in alcohols?',
    options: ['-OH', '-COOH', '-CHO', '-NH₂'],
    correctAnswer: '-OH',
  },
];


function generateAdditionalQuestions() {
  const additionalQuestions = [];
  const chapters = [...new Set(quickQuestions.map(q => `${q.exam}-${q.subject}-${q.chapter}`))];
  
  chapters.forEach(chapterKey => {
    const [exam, subject, chapter] = chapterKey.split('-');
    const existingCount = quickQuestions.filter(q => 
      q.exam === exam && q.subject === subject && q.chapter === chapter
    ).length;
    
    const needed = 30 - existingCount;
    
    for (let i = 0; i < needed; i++) {
      additionalQuestions.push({
        exam,
        subject,
        chapter,
        questionText: `Sample question ${i + 1} for ${chapter} in ${subject}?`,
        options: [
          `Correct answer for ${chapter}`,
          `Wrong option A for ${chapter}`,
          `Wrong option B for ${chapter}`,
          `Wrong option C for ${chapter}`
        ],
        correctAnswer: `Correct answer for ${chapter}`,
      });
    }
  });
  
  return additionalQuestions;
}

async function quickSeed() {
  try {
    console.log('🚀 Quick seeding questions for immediate testing...');
    
    await Question.deleteMany({});
    console.log('🗑️ Cleared existing questions');

    await Question.insertMany(quickQuestions);
    console.log(`✅ Inserted ${quickQuestions.length} base questions`);

    const additionalQuestions = generateAdditionalQuestions();
    await Question.insertMany(additionalQuestions);
    console.log(`✅ Inserted ${additionalQuestions.length} additional questions`);

    const total = quickQuestions.length + additionalQuestions.length;
    console.log(`🎉 Total questions in database: ${total}`);
    const summary = await Question.aggregate([
      {
        $group: {
          _id: { exam: '$exam', subject: '$subject', chapter: '$chapter' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.exam': 1, '_id.subject': 1, '_id.chapter': 1 } }
    ]);
    
    console.log('\n📊 Questions by chapter:');
    summary.forEach(item => {
      console.log(`  ${item._id.exam.toUpperCase()} - ${item._id.subject} - ${item._id.chapter}: ${item.count} questions`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
  } finally {
    mongoose.connection.close();
  }
}


if (require.main === module) {
  quickSeed();
}

module.exports = { quickSeed };
