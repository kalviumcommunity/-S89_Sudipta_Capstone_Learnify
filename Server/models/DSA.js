const mongoose = require('mongoose');

const dsaPracticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  testCases: [
    {
      input: String,
      expectedOutput: String
    }
  ]
});

module.exports = mongoose.model('DSAProblem', dsaPracticeSchema);
