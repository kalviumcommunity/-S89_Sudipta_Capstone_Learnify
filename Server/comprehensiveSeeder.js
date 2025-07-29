const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Comprehensive exam chapters mapping
const examChapters = {
  neet: {
    Biology: [
      'Plant physiology', 'Structural organisation in animals', 'The Living World', 'Animal Kingdom',
      'Biological classification', 'Cell: the unit of life', 'Microbes in human welfare', 'Biotechnology',
      'Human physiology', 'Human reproduction', 'Evolution', 'Digestion and absorption', 'Body fluids and circulation',
      'Locomotion and Movement', 'Excretory products and their elimination', 'Neural Control and coordination',
      'Human Health and disease', 'Ecosystem', 'Biomolecules', 'Coordination complex'
    ],
    Physics: [
      'Kinematics', 'Units of measurement', 'Newton\'s laws of motion', 'Work, energy and power',
      'Rotational Motion', 'Gravitation', 'Thermodynamics', 'Oscillation', 'Electrostatics',
      'Current electricity', 'Magnetism', 'Alternating current', 'Electromagnetic waves', 'Optics',
      'Electronics', 'Atomic nucleus', 'Dual nature of matter and radiation', 'Mechanical properties of fluids',
      'Kinetic theory of gases', 'Experimental skills'
    ],
    Chemistry: [
      'Chemical bonding', 'Hydrocarbons', 'Thermodynamics', 'Organic chemistry', 'Classification of elements and periodicity',
      'Chemical kinetics', 'Electrochemistry', 'Biomolecules', 'Atomic Structure', 'Coordination complex', 'Inorganic chemistry',
      'Unit vi: equilibrium', 'Aromatic compounds', 'Carboxylic acid', 'Organic compounds Containing Halogens',
      'Organic compounds containing nitrogen', 'Chemistry in everyday life', 'Hydrogen', 'P-block', 'D and f block'
    ]
  },
  jee: {
    Physics: ['Kinematics', 'Laws of Motion', 'Gravitation', 'Thermodynamics', 'Waves', 'Current Electricity'],
    Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Thermodynamics', 'Chemical Kinetics'],
    Mathematics: ['Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry', 'Probability']
  },
  tbjee: {
    Physics: ['Kinematics', 'Work and Energy', 'Gravitation'],
    Chemistry: ['States of Matter', 'The p-Block Element', 'Redox Reactions'],
    Biology: ['Cell Structure', 'Genetics', 'Photosynthesis'],
    Mathematics: ['Quadratic Equations', 'Probability', 'Differential Calculus']
  },
  wbjee: {
    Physics: ['Physical World', 'Thermodynamics', 'Optics'],
    Chemistry: ['Chemical Bonding', 'Coordination Compounds', 'Solid State'],
    Mathematics: ['Vectors', 'Matrices', 'Limits and Derivatives']
  }
};

// Question templates for different subjects
const questionTemplates = {
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
      pattern: "What is the SI unit of {quantity} in {chapter}?",
      quantities: ["force", "energy", "power", "momentum", "acceleration"],
    },
    {
      pattern: "According to {law}, what happens when {condition}?",
      laws: ["Newton's first law", "Newton's second law", "conservation of energy", "Ohm's law"],
      conditions: ["force is applied", "no external force acts", "temperature increases", "current flows"]
    }
  ],
  Chemistry: [
    {
      pattern: "Which {compound} is commonly found in {chapter}?",
      compounds: ["acid", "base", "salt", "organic compound", "inorganic compound"],
    },
    {
      pattern: "What is the molecular formula of {compound} in {chapter}?",
      compounds: ["methane", "ethanol", "benzene", "glucose", "water"]
    }
  ],
  Mathematics: [
    {
      pattern: "What is the derivative of {function} in {chapter}?",
      functions: ["sin(x)", "cos(x)", "x²", "ln(x)", "e^x"],
    },
    {
      pattern: "In {chapter}, what is the value of {expression}?",
      expressions: ["sin(90°)", "cos(0°)", "log(10)", "√4", "2³"]
    }
  ]
};

function generateOptions(subject, chapter, index) {
  const baseOptions = {
    Biology: [
      "Mitochondria", "Chloroplast", "Nucleus", "Ribosome",
      "Cell membrane", "Cytoplasm", "Vacuole", "Endoplasmic reticulum"
    ],
    Physics: [
      "Newton", "Joule", "Watt", "Pascal",
      "Meter", "Second", "Kilogram", "Ampere"
    ],
    Chemistry: [
      "H₂O", "CO₂", "NaCl", "CaCO₃",
      "HCl", "NaOH", "CH₄", "C₆H₁₂O₆"
    ],
    Mathematics: [
      "0", "1", "-1", "∞",
      "π", "e", "√2", "i"
    ]
  };

  const subjectOptions = baseOptions[subject] || baseOptions.Biology;
  const shuffled = [...subjectOptions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

function generateQuestionsForChapter(exam, subject, chapter, count = 30) {
  const questions = [];
  const templates = questionTemplates[subject] || questionTemplates.Biology;
  
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    let questionText = template.pattern
      .replace('{chapter}', chapter)
      .replace('{concept}', template.concepts?.[i % (template.concepts?.length || 1)] || 'structure')
      .replace('{process}', template.processes?.[i % (template.processes?.length || 1)] || 'function')
      .replace('{structure}', template.structures?.[i % (template.structures?.length || 1)] || 'component')
      .replace('{quantity}', template.quantities?.[i % (template.quantities?.length || 1)] || 'measurement')
      .replace('{law}', template.laws?.[i % (template.laws?.length || 1)] || 'principle')
      .replace('{condition}', template.conditions?.[i % (template.conditions?.length || 1)] || 'change occurs')
      .replace('{compound}', template.compounds?.[i % (template.compounds?.length || 1)] || 'substance')
      .replace('{function}', template.functions?.[i % (template.functions?.length || 1)] || 'f(x)')
      .replace('{expression}', template.expressions?.[i % (template.expressions?.length || 1)] || 'value');

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

async function populateAllQuestions() {
  try {
    console.log('🚀 Starting comprehensive question generation...');

    await Question.deleteMany({});
    console.log('🗑️ Cleared existing questions');

    let totalGenerated = 0;
    for (const [examId, subjects] of Object.entries(examChapters)) {
      console.log(`\n📚 Generating questions for ${examId.toUpperCase()}...`);
      
      for (const [subject, chapters] of Object.entries(subjects)) {
        console.log(`  📖 Subject: ${subject}`);
        
        for (const chapter of chapters) {
          console.log(`    📝 Chapter: ${chapter}`);

          const questions = generateQuestionsForChapter(examId, subject, chapter, 30);

          await Question.insertMany(questions);
          totalGenerated += questions.length;

          console.log(`    ✅ Generated ${questions.length} questions`);
        }
      }
    }

    console.log(`\n🎉 Total questions generated: ${totalGenerated}`);
    
    // Show summary
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
    console.error('❌ Error generating questions:', error);
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  populateAllQuestions();
}

module.exports = { populateAllQuestions };
