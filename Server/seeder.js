const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleQuestions = [
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Plant physiology',
    questionText: 'Which part of the plant is responsible for reproduction?',
    options: ['Root', 'Stem', 'Flower', 'Leaf'],
    correctAnswer: 'Flower',
  },
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Plant physiology',
    questionText: 'Pollination in plants is done by:',
    options: ['Wind', 'Water', 'Animals', 'All of these'],
    correctAnswer: 'All of these',
  },
  {
    exam: 'neet',
    subject: 'biology',
    chapter: 'Plant physiology',
    questionText: 'Which of the following is a unisexual flower?',
    options: ['Mustard', 'Hibiscus', 'Papaya', 'Datura'],
    correctAnswer: 'Papaya',
  },
];


async function seed() {
  try {
    await Question.deleteMany({}); // Optional: clears old data
    await Question.insertMany(sampleQuestions);
    console.log('✅ Sample questions inserted successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding questions:', err);
    process.exit(1);
  }
}

seed();
