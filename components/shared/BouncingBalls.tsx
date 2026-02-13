'use client';

import React, { memo } from 'react';

interface BouncingBallsProps {
  variant?: 'default' | 'dense' | 'minimal';
  className?: string;
}

const BouncingBalls = memo(({ variant = 'default', className = '' }: BouncingBallsProps) => {
  const getBalls = () => {
    switch (variant) {
      case 'minimal':
        return [
          { size: 'w-8 h-8', gradient: 'from-yellow-400 to-orange-500', position: 'top-20 right-16', delay: '0s', duration: '4s', opacity: 'opacity-80' },
          { size: 'w-6 h-6', gradient: 'from-pink-400 to-purple-500', position: 'bottom-32 left-20', delay: '2s', duration: '3.5s', opacity: 'opacity-60' },
          { size: 'w-5 h-5', gradient: 'from-emerald-400 to-teal-500', position: 'top-40 left-14', delay: '3s', duration: '4.5s', opacity: 'opacity-75' },
        ];
      
      case 'dense':
        return [
          { size: 'w-8 h-8', gradient: 'from-yellow-400 to-orange-500', position: 'top-20 right-16', delay: '0s', duration: '4s', opacity: 'opacity-80' },
          { size: 'w-6 h-6', gradient: 'from-pink-400 to-purple-500', position: 'bottom-32 left-20', delay: '2s', duration: '3.5s', opacity: 'opacity-60' },
          { size: 'w-7 h-7', gradient: 'from-blue-400 to-indigo-500', position: 'top-60 right-12', delay: '1s', duration: '5s', opacity: 'opacity-70' },
          { size: 'w-5 h-5', gradient: 'from-emerald-400 to-teal-500', position: 'top-40 left-14', delay: '3s', duration: '4.5s', opacity: 'opacity-75' },
          { size: 'w-9 h-9', gradient: 'from-violet-400 to-purple-600', position: 'top-80 left-8', delay: '1.5s', duration: '3.8s', opacity: 'opacity-65' },
          { size: 'w-4 h-4', gradient: 'from-cyan-400 to-blue-500', position: 'bottom-20 right-24', delay: '2.5s', duration: '4.2s', opacity: 'opacity-80' },
          { size: 'w-3 h-3', gradient: 'from-rose-400 to-pink-500', position: 'top-96 left-1/3', delay: '4s', duration: '3.2s', opacity: 'opacity-50' },
          { size: 'w-5 h-5', gradient: 'from-indigo-400 to-blue-500', position: 'bottom-60 right-1/3', delay: '2.8s', duration: '4.7s', opacity: 'opacity-60' },
        ];

      default:
        return [
          { size: 'w-8 h-8', gradient: 'from-yellow-400 to-orange-500', position: 'top-20 right-16', delay: '0s', duration: '4s', opacity: 'opacity-80' },
          { size: 'w-6 h-6', gradient: 'from-pink-400 to-purple-500', position: 'bottom-32 left-20', delay: '2s', duration: '3.5s', opacity: 'opacity-60' },
          { size: 'w-7 h-7', gradient: 'from-blue-400 to-indigo-500', position: 'top-60 right-12', delay: '1s', duration: '5s', opacity: 'opacity-70' },
          { size: 'w-5 h-5', gradient: 'from-emerald-400 to-teal-500', position: 'top-40 left-14', delay: '3s', duration: '4.5s', opacity: 'opacity-75' },
          { size: 'w-9 h-9', gradient: 'from-violet-400 to-purple-600', position: 'top-80 left-8', delay: '1.5s', duration: '3.8s', opacity: 'opacity-65' },
          { size: 'w-4 h-4', gradient: 'from-cyan-400 to-blue-500', position: 'bottom-20 right-24', delay: '2.5s', duration: '4.2s', opacity: 'opacity-80' },
        ];
    }
  };

  return (
    <div className={`fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      {getBalls().map((ball, index) => (
        <div
          key={index}
          className={`absolute ${ball.size} bg-gradient-to-r ${ball.gradient} ${ball.position} ${ball.opacity} rounded-full animate-optimized-bounce shadow-lg`}
          style={{ 
            animationDelay: ball.delay, 
            animationDuration: ball.duration 
          }}
        />
      ))}
    </div>
  );
});

BouncingBalls.displayName = 'BouncingBalls';

export default BouncingBalls;
