import React, { useState } from 'react';
import '../Styles/FAQ.css';

const faqData = [
  {
    question: 'Are the tests free?',
    answer: 'Yes, most mock tests on Learnify are completely free to access and practice.',
  },
  {
    question: 'What exams are supported?',
    answer: 'Currently, we support NEET, JEE, GATE, and more exam categories are coming soon!',
  },
  {
    question: 'Can I track my performance?',
    answer: 'Absolutely! Your dashboard gives you a detailed performance report and history.',
  },
  {
    question: 'Is this platform beginner-friendly?',
    answer: '100%! Learnify is designed for all levels — from beginner to expert.',
  },
  {
    question: 'Do I get solutions after the test?',
    answer: 'Yes, each mock test comes with detailed solutions and explanations after submission.',
  },
  {
    question: 'How often are tests updated?',
    answer: 'We update our question bank weekly and add new mock tests regularly.',
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h2 className="faq-heading">Frequently Asked Questions</h2>
      <div className="faq-container">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'active' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">{faq.question}</div>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQs;
