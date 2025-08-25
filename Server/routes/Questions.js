const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

function kebabToChapterName(str) {
  const words = str.split('-');
  return words
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join(' ');
}

router.get('/', async (req, res) => {
  const { exam, chapter, limit = 30 } = req.query;

  try {
    // Check if required parameters are provided
    if (!exam || !chapter) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both exam and chapter parameters are required',
        example: '/api/questions?exam=JEE&chapter=algebra'
      });
    }

    const chapterTitle = kebabToChapterName(chapter);

    console.log(`Fetching questions for: exam=${exam}, chapter=${chapterTitle}`);

    const questionCount = await Question.countDocuments({ exam, chapter: chapterTitle });
    console.log(`Found ${questionCount} questions in database`);

    if (questionCount === 0) {
      return res.json({
        message: `No questions found for ${exam} - ${chapterTitle}`,
        suggestions: 'Please run the question generator to populate questions',
        questions: []
      });
    }

    const questions = await Question.aggregate([
      { $match: { exam, chapter: chapterTitle } },
      { $sample: { size: Math.min(parseInt(limit), questionCount) } }
    ]);

    console.log(`Returning ${questions.length} questions`);
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
