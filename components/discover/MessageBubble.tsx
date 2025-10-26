'use client';

import React from 'react';
import BotIcon from './BotIcon';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
  isLoading?: boolean;
}

const MessageBubble = React.memo<MessageBubbleProps>(({ role, content }) => {
  return (
    <div className={`flex items-start gap-3 animate-fade-in-up ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role === 'assistant' && <BotIcon />}
      <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
        role === 'user' 
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none'
      }`}>
        {typeof content === 'string' ? (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
export default MessageBubble;