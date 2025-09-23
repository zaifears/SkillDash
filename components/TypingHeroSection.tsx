'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// A more dynamic and smooth typing animation component
const TypingAnimation = () => {
    const [skillIndex, setSkillIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Using useMemo to prevent re-creation of the skills array on every render
    const skills = useMemo(() => [
        'Potential',
        'Creativity',
        'Skills',
        'Talents',
        'Future',
        'Public Speaking',
        'Microsoft Excel',
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
                // Handle deleting text
                if (displayedText.length > 0) {
                    setDisplayedText(currentSkill.substring(0, displayedText.length - 1));
                } else {
                    setIsDeleting(false);
                    setSkillIndex((prev) => (prev + 1) % skills.length);
                }
            } else {
                // Handle typing text
                if (displayedText.length < currentSkill.length) {
                    setDisplayedText(currentSkill.substring(0, displayedText.length + 1));
                } else {
                    // Pause at the end of the word, then start deleting
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
        <section className="relative py-16 px-6 text-center">
            <div className="max-w-6xl mx-auto">
                {/* FIXED: Proper line spacing for the main heading */}
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-8 leading-normal md:leading-relaxed">
                    Bridge the Skill Gap
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                    From Classroom to Career. The AI-powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.
                </p>

                {/* CTA Button */}
                <div className="relative inline-block mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                    <Link
                        href="/discover"
                        className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-full hover:scale-105 transform transition-all duration-300 inline-flex items-center gap-3"
                    >
                        Discover your talent with SkillDash AI
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>

                {/* Typing Animation Section - Alignment Fixed */}
                <div className="text-gray-500 dark:text-gray-400 text-2xl md:text-3xl font-medium pb-16 flex items-center justify-center gap-x-3 h-14 md:h-16">
                    <span>Unlock your</span>
                    <TypingAnimation />
                </div>
            </div>
        </section>
    );
};

export default TypingHeroSection;
