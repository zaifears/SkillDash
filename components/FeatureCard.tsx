'use client';

import React from 'react';
import Link from 'next/link';
import './FeatureCard.css';

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ number, title, description, icon, href }) => {
  return (
    <Link href={href} className="card-link">
      <div className="card">
        <span className="icon">
          {icon}
        </span>
        <h4>{title}</h4>
        <p>{description}</p>
        <div className="shine"></div>
        <div className="background">
          <div className="tiles">
            <div className="tile tile-1"></div>
            <div className="tile tile-2"></div>
            <div className="tile tile-3"></div>
            <div className="tile tile-4"></div>
            <div className="tile tile-5"></div>
            <div className="tile tile-6"></div>
            <div className="tile tile-7"></div>
            <div className="tile tile-8"></div>
            <div className="tile tile-9"></div>
            <div className="tile tile-10"></div>
          </div>
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
