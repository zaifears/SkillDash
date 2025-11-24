'use client';

import React from 'react';
import FeatureCard from '@/components/FeatureCard';
import { ROUTES } from '@/lib/constants';
import './FeaturesSection.css';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Discover Your Skills',
      description: 'Take our AI-powered skill assessment to uncover your unique talents and strengths',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7V12L16 14" />
        </svg>
      ),
      href: ROUTES.DISCOVER,
    },
    {
      title: 'Test & Learn Skills',
      description: 'Explore hands-on courses and test your abilities across 17+ in-demand skill areas',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
          <polyline points="10 6 14 10 10 14" />
        </svg>
      ),
      href: ROUTES.LEARN_SKILL,
    },
    {
      title: 'Perfect Your Resume',
      description: 'Get AI-powered feedback to craft a resume that stands out to employers',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="13" x2="12" y2="19" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      ),
      href: ROUTES.RESUME_FEEDBACK,
    },
    {
      title: 'Find Opportunities',
      description: 'Access curated job listings, internships, and freelance projects tailored to your skills',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 11h.01" />
          <path d="M8 11h.01" />
          <path d="M12 3v4" />
        </svg>
      ),
      href: ROUTES.OPPORTUNITIES,
    },
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <h2 className="features-title">Your Path to Success</h2>
        <p className="features-subtitle">Follow our proven 4-step process to unlock your potential</p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              number={String(index + 1).padStart(2, '0')}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              href={feature.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
