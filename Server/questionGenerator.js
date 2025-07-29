const mongoose = require('mongoose');
const Question = require('./models/Question');
const examChapters = require('../client/src/data/examChapters');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function generateQuestionsWithAI(exam, subject, chapter, count = 30) {
  const prompt = `Generate ${count} multiple choice questions for ${exam.toUpperCase()} exam, subject: ${subject}, chapter: ${chapter}.
  
  Format each question as JSON:
  {
    "questionText": "Question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Correct option text"
  }
  
  Requirements:
  - Questions should be ${exam.toUpperCase()} level difficulty
  - Cover different aspects of ${chapter}
  - Include conceptual, application, and analytical questions
  - Ensure correct answers are accurate
  - Make distractors plausible but clearly wrong
  
  Return only valid JSON array.`;

  try {
    return generateSampleQuestions(exam, subject, chapter, count);
  } catch (error) {
    console.error('AI generation failed, using fallback:', error);
    return generateSampleQuestions(exam, subject, chapter, count);
  }
}
function generateSampleQuestions(exam, subject, chapter, count = 30) {
  const questions = [];
  const templates = {
    Biology: [
      {
        pattern: "What is the primary function of {concept} in {chapter}?",
        concepts: ["mitochondria", "chloroplasts", "ribosomes", "nucleus", "cell membrane"],
      },
      {
        pattern: "Which of the following is responsible for {process} in {chapter}?",
        processes: ["photosynthesis", "respiration", "protein synthesis", "cell division", "transport"],
      },
      {
        pattern: "The {structure} in {chapter} is primarily involved in:",
        structures: ["stomata", "xylem", "phloem", "epidermis", "cortex"],
      }
    ],
    Physics: [
      {
        pattern: "What is the unit of {quantity} in {chapter}?",
        quantities: ["force", "energy", "power", "momentum", "acceleration"],
      },
      {
        pattern: "According to {law}, what happens when {condition}?",
        laws: ["Newton's first law", "Newton's second law", "conservation of energy", "Ohm's law"],
        conditions: ["force is applied", "no external force acts", "current flows", "temperature increases"],
      }
    ],
    Chemistry: [
      {
        pattern: "What is the molecular formula of {compound} discussed in {chapter}?",
        compounds: ["water", "methane", "ethanol", "glucose", "sodium chloride"],
      },
      {
        pattern: "Which type of bond is formed in {chapter} when {condition}?",
        conditions: ["electrons are shared", "electrons are transferred", "atoms combine", "molecules interact"],
      }
    ],
    Mathematics: [
      {
        pattern: "What is the derivative of {function} in {chapter}?",
        functions: ["x²", "sin(x)", "cos(x)", "ln(x)", "eˣ"],
      },
      {
        pattern: "The integral of {function} with respect to x is:",
        functions: ["x", "x²", "1/x", "sin(x)", "cos(x)"],
      }
    ]
  };

  const subjectTemplates = templates[subject] || templates.Biology;
  
  for (let i = 0; i < count; i++) {
    const template = subjectTemplates[i % subjectTemplates.length];
    const questionText = template.pattern
      .replace('{chapter}', chapter)
      .replace('{concept}', template.concepts?.[i % (template.concepts?.length || 1)] || 'structure')
      .replace('{process}', template.processes?.[i % (template.processes?.length || 1)] || 'function')
      .replace('{structure}', template.structures?.[i % (template.structures?.length || 1)] || 'component')
      .replace('{quantity}', template.quantities?.[i % (template.quantities?.length || 1)] || 'measurement')
      .replace('{law}', template.laws?.[i % (template.laws?.length || 1)] || 'principle')
      .replace('{condition}', template.conditions?.[i % (template.conditions?.length || 1)] || 'change occurs')
      .replace('{compound}', template.compounds?.[i % (template.compounds?.length || 1)] || 'substance')
      .replace('{function}', template.functions?.[i % (template.functions?.length || 1)] || 'f(x)');

    const options = generateOptions(subject, chapter, i);

    questions.push({
      exam,
      subject: subject.toLowerCase(),
      chapter,
      questionText,
      options,
      correctAnswer: options[0],
    });
  }
  
  return questions;
}

function generateOptions(subject, chapter, index) {
  const optionSets = {
    Biology: [
      ["Cellular respiration", "Photosynthesis", "Protein synthesis", "DNA replication"],
      ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
      ["Glucose", "Oxygen", "Carbon dioxide", "Water"],
      ["Enzyme", "Hormone", "Vitamin", "Mineral"],
    ],
    Physics: [
      ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"],
      ["Acceleration increases", "Velocity remains constant", "Force decreases", "Mass changes"],
      ["Kinetic energy", "Potential energy", "Thermal energy", "Chemical energy"],
      ["Direct proportion", "Inverse proportion", "No relation", "Exponential relation"],
    ],
    Chemistry: [
      ["H₂O", "CO₂", "NaCl", "CH₄"],
      ["Covalent bond", "Ionic bond", "Metallic bond", "Hydrogen bond"],
      ["Oxidation", "Reduction", "Neutralization", "Precipitation"],
      ["Acid", "Base", "Salt", "Buffer"],
    ],
    Mathematics: [
      ["2x", "x²", "x³", "1/x"],
      ["x²/2", "x³/3", "ln(x)", "eˣ"],
      ["Continuous", "Discontinuous", "Undefined", "Infinite"],
      ["Linear", "Quadratic", "Exponential", "Logarithmic"],
    ]
  };

  const subjectOptions = optionSets[subject] || optionSets.Biology;
  return subjectOptions[index % subjectOptions.length];
}

async function populateAllQuestions() {
  try {
    console.log('🚀 Starting automated question generation...');

    await Question.deleteMany({});
    console.log('🗑️ Cleared existing questions');

    let totalGenerated = 0;
    for (const [examId, subjects] of Object.entries(examChapters)) {
      console.log(`\n📚 Generating questions for ${examId.toUpperCase()}...`);
      
      for (const [subject, chapters] of Object.entries(subjects)) {
        console.log(`  📖 Subject: ${subject}`);
        
        for (const chapter of chapters) {
          console.log(`    📝 Chapter: ${chapter}`);

          const questions = await generateQuestionsWithAI(examId, subject, chapter, 30);

          await Question.insertMany(questions);
          totalGenerated += questions.length;

          console.log(`    ✅ Generated ${questions.length} questions`);
        }
      }
    }
    
    console.log(`\n🎉 Successfully generated ${totalGenerated} questions!`);
    console.log('📊 Database populated with questions for all exams, subjects, and chapters.');
    
  } catch (error) {
    console.error('❌ Error generating questions:', error);
  } finally {
    mongoose.connection.close();
  }
}


if (require.main === module) {
  populateAllQuestions();
}

module.exports = { generateQuestionsWithAI, populateAllQuestions };
