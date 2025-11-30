'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Typing animation component (same as before)
const TypingAnimation = () => {
    const [skillIndex, setSkillIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const skills = useMemo(() => [
        'Potential',
        'Creativity',
        'Skills',
        'Talents',
        'Future',
        'Public Speaking',
        'Excel',
        'PowerBI',
        'Data Analysis',
        'Project Management',
        'Digital Marketing',
        'Financial Modeling',
        'Leadership',
        'Business Strategy'
    ], []);

    useEffect(() => {
        const handleTyping = () => {
            const currentSkill = skills[skillIndex];
            
            if (isDeleting) {
                if (displayedText.length > 0) {
                    setDisplayedText(currentSkill.substring(0, displayedText.length - 1));
                } else {
                    setIsDeleting(false);
                    setSkillIndex((prev) => (prev + 1) % skills.length);
                }
            } else {
                if (displayedText.length < currentSkill.length) {
                    setDisplayedText(currentSkill.substring(0, displayedText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            }
        };

        const typingTimeout = setTimeout(handleTyping, isDeleting ? 75 : 150);
        return () => clearTimeout(typingTimeout);
    }, [displayedText, isDeleting, skillIndex, skills]);

    return (
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-bold">
            {displayedText}
            <span className="opacity-75 animate-pulse">|</span>
        </span>
    );
};

const TypingHeroSection = () => {
    return (
        <section className="hero-background-container relative py-16 sm:py-18 md:py-20 px-6 text-center overflow-hidden bg-cover bg-center bg-no-repeat min-h-[450px] sm:min-h-[550px] md:min-h-[700px] flex items-center justify-center" style={{
            backgroundImage: 'url(/hero-background.png)',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center top',
        }}>
            {/* Dark overlay for light mode and gradient for dark mode */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/60 dark:from-black/70 dark:via-black/60 dark:to-black/50 pointer-events-none"></div>

            {/* FIXED: Inline bouncing balls that match the dark background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-16 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-optimized-bounce opacity-80 shadow-lg" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
                <div className="absolute bottom-32 left-20 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-optimized-bounce opacity-60 shadow-md" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
                <div className="absolute top-60 right-12 w-7 h-7 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-optimized-bounce opacity-70 shadow-md" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
                <div className="absolute top-40 left-14 w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-optimized-bounce opacity-75 shadow-sm" style={{ animationDelay: '3s', animationDuration: '4.5s' }}></div>
                <div className="absolute top-80 left-8 w-9 h-9 bg-gradient-to-r from-violet-400 to-purple-600 rounded-full animate-optimized-bounce opacity-65 shadow-lg" style={{ animationDelay: '1.5s', animationDuration: '3.8s' }}></div>
                <div className="absolute bottom-20 right-24 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-optimized-bounce opacity-80 shadow-sm" style={{ animationDelay: '2.5s', animationDuration: '4.2s' }}></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10 py-16 sm:py-12 md:py-16 px-4 sm:px-6">
                {/* Main Heading */}
                <div className="relative mb-8 sm:mb-8 md:mb-10">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent leading-normal md:leading-relaxed transition-all duration-500 hover:scale-105 cursor-pointer">
                        Bridge the Skill Gap
                    </h1>
                    
                    {/* Small decorative balls near the title */}
                    <div className="absolute -top-4 -right-4 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse opacity-80"></div>
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce opacity-60"></div>
                </div>

                {/* Subtitle */}
                <p className="text-base sm:text-lg md:text-2xl text-gray-700 dark:text-gray-200 mb-10 sm:mb-12 md:mb-14 max-w-4xl mx-auto leading-relaxed px-2">
                    Discover your strengths, complete AI-assessed learning paths, perfect your resume and unlock career opportunities.
                </p>

                {/* CTA Button */}
                <div className="relative inline-block mb-12 sm:mb-16 md:mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                    <Link 
                        href="/discover" 
                        className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:scale-105 transform transition-all duration-300 inline-flex items-center gap-2 sm:gap-3 shadow-xl hover:shadow-2xl text-sm sm:text-base"
                    >
                        Discover your talent with SkillDash AI
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>

                {/* Typing Animation */}
                <div className="text-gray-600 dark:text-gray-300 text-lg sm:text-2xl md:text-3xl font-medium pb-8 sm:pb-12 md:pb-16 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 h-auto sm:h-14 md:h-16">
                    <span>Unlock your</span>
                    <TypingAnimation />
                </div>
            </div>
        </section>
    );
};

export default TypingHeroSection;
