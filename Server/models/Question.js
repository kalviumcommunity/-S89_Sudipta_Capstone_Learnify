// backend/models/Question.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  exam: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  chapter: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Question', questionSchema);
