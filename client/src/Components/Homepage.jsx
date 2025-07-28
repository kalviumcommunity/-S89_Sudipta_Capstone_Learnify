import React from "react";
import "./HomePage.css";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import ExamCategories from "./ExamCategories";
import Background from "./Background";

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Background */}
      <Background />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Exam Categories Section */}
      <ExamCategories />
    </div>
  );
};

export default HomePage;
