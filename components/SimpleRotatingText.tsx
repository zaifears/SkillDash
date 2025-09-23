'use client';

import { useState, useEffect } from 'react';

const SimpleRotatingText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const skills = [
    'Excel Mastery', 
    'Video Editing', 
    'Typing Skills', 
    'Data Analysis', 
    'Content Writing', 
    'Slide Design', 
    'Social Media Strategy', 
    'Graphic Design', 
    'Web Development', 
    'Project Management', 
    'Financial Planning', 
    'Communication Skills', 
    'Leadership Qualities', 
    'Problem Solving', 
    'Critical Thinking', 
    'Presentation Skills', 
    'Research Abilities', 
    'Entrepreneurship',
    'SQL Basics',
    'Market Research'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // Change text after fade out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % skills.length);
        setIsVisible(true);
      }, 200);
    }, 1800);

    return () => clearInterval(interval);
  }, [skills.length]);

  return (
    <span 
      className={`bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-bold inline-block transition-all duration-200 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      {skills[currentIndex]}
    </span>
  );
};

export default SimpleRotatingText;