import React from 'react';
import Image from 'next/image';

// ✅ SAFE: Simple shared UI components
export const LoadingScreen = () => (
  <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
  </div>
);

export const BotIcon = () => (
  <Image 
    src="/skilldash-logo.png" 
    alt="SkillDash AI" 
    width={40}
    height={40}
    className="rounded-full shadow-md object-cover" 
  />
);

export const LoadingDots = () => (
  <div className="flex items-center space-x-1.5 px-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

export interface Message {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
  id?: string;
}
