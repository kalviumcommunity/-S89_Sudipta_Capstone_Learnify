import React from 'react';
import HeroSection from './HeroSection';
import ExamCategories from './ExamCategories';
import WhyChooseUs from './WhyChooseUs'; 
import Testimonials from './Testimonials';
import CallToAction from './CallToAction';
import Footer from './Footer'; 
import FAQ from './FAQ'; 
const Home = () => {
  return (
    <>
      <HeroSection />
      <ExamCategories />
      <WhyChooseUs />
        <Testimonials />
        <CallToAction />
        <FAQ />
        <Footer />
        
    
    </>
  );
};

export default Home;
