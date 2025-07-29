import React from 'react';
import '../Styles/Testimonials.css';

const testimonials = [
  {
    name: "Ankita Sharma",
    feedback: "Learnify made my NEET prep so smooth! The mock tests are incredibly realistic and helped me improve consistently.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Rohan Verma",
    feedback: "The DSA Hub is a lifesaver! It helped me build confidence and crack my first internship at a product-based company.",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    name: "Sneha Das",
    feedback: "The UI is stunning, and the leaderboard keeps me motivated. I log in every day just to stay on top!",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Kunal Mehta",
    feedback: "Organization-based tests gave me real-time pressure experience. I now feel fully prepared for college entrance exams.",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    name: "Priya Nair",
    feedback: "Absolutely love the variety of questions. The explanations after each mock are detailed and really helpful.",
    image: "https://randomuser.me/api/portraits/women/50.jpg",
  },
  {
    name: "Arjun Kapoor",
    feedback: "As someone targeting GSoC, the DSA section and test structure are just what I needed. Learnify is gold!",
    image: "https://randomuser.me/api/portraits/men/59.jpg",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonial-section">
      <h2 className="testimonial-heading">What Learners Say</h2>
      <p className="testimonial-subheading">Join thousands of happy students using Learnify 🚀</p>

      <div className="testimonial-cards">
        {testimonials.map((t, index) => (
          <div className="testimonial-card" key={index}>
            <img src={t.image} alt={t.name} className="testimonial-avatar" />
            <p className="testimonial-quote">“{t.feedback}”</p>
            <h3 className="testimonial-name">— {t.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
