import React from 'react';

// ✅ SAFE: Simple shared UI components
export const LoadingScreen = () => (
  <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
  </div>
);

export const BotIcon = () => (
  <img src="/skilldash-logo.png" alt="SkillDash AI" className="w-10 h-10 rounded-full shadow-md object-cover" />
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
