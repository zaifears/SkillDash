'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MessageBubble from '../../components/discover/MessageBubble';
import LoadingDots from '../../components/discover/LoadingDots';

// Lazy load heavy components
const SuggestionsCard = dynamic(() => import('../../components/discover/SuggestionsCard'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

// Optimized loading screen
const AuthLoadingScreen = () => (
  <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
  </div>
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  skillsToDevelop: string[];
  suggestedCourses: { title: string; description: string }[];
  nextStep: 'resume' | 'jobs';
  forceEnd?: boolean; // For handling irrelevant inputs
}

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillSuggestions | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdCounter = useRef(0);

  // Auth redirect effect
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to use the Discover feature. We require login for fair usage.');
      sessionStorage.setItem('redirectAfterLogin', '/discover');
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Auto-focus input
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions, scrollToBottom]);

  // Initialize conversation with friendlier welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi there! I'm SkillDashAI, your personal career guide. 🌟\n\nI know this might feel like a mini-interview, but trust me - the insights we'll discover about your unique strengths will be absolutely worth it! Many students are surprised by what they learn about themselves.\n\nLet's start with something fun: If you had a completely free weekend to work on any project you wanted, what would you build or create? (Don't worry about being 'practical' - dream big! ✨)"
      }]);
    }
  }, [user, messages.length]);

  // Enhanced form submission with better error handling
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || suggestions || conversationEnded) return;

    // Basic client-side validation for obviously irrelevant inputs
    const cleanInput = userInput.trim().toLowerCase();
    if (cleanInput.length < 2) {
      // Give a gentle nudge for very short inputs
      const nudgeId = `nudge-${++messageIdCounter.current}`;
      const nudgeMessage: Message = { 
        id: nudgeId,
        role: 'assistant', 
        content: "I'd love to hear a bit more! Can you give me a little more detail? Even a sentence or two would be great! 😊" 
      };
      setMessages(prev => [...prev, nudgeMessage]);
      return;
    }

    const messageId = `msg-${++messageIdCounter.current}`;
    const userMessage: Message = { 
      id: messageId, 
      role: 'user', 
      content: userInput.trim() 
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/discover-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(({ id, ...msg }) => msg)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const botMessageId = `bot-${++messageIdCounter.current}`;

      if (data.isComplete) {
        if (data.forceEnd) {
          // Handle forced end due to irrelevant inputs
          setConversationEnded(true);
          const endMessage: Message = { 
            id: botMessageId,
            role: 'assistant', 
            content: data.summary || "Thanks for trying SkillDash Discover! Come back when you're ready to explore your career potential seriously. 🌟"
          };
          setMessages(prev => [...prev, endMessage]);
        } else {
          // Normal completion
          setSuggestions(data);
          const finalBotMessage: Message = { 
            id: botMessageId,
            role: 'assistant', 
            content: "Fantastic! I've gathered everything I need. Here's your personalized skill analysis - I think you'll find some exciting insights! 🎯" 
          };
          setMessages(prev => [...prev, finalBotMessage]);
        }
      } else {
        const botMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: data.reply 
        };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessageId = `error-${++messageIdCounter.current}`;
      const errorMessage: Message = {
        id: errorMessageId,
        role: 'assistant',
        content: "Oops! I'm having a little trouble connecting right now. Please check your internet connection and try again. Your insights are waiting! 🔄"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, suggestions, messages, conversationEnded]);

  // Handle input change with character limit feedback
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  }, []);

  // Show loading screen while authenticating
  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  // Get placeholder text based on conversation state
  const getPlaceholder = () => {
    if (suggestions) return "Your Skill Quest is complete! 🎉";
    if (conversationEnded) return "Conversation ended";
    if (isLoading) return "Thinking...";
    return "Share your thoughts here... (be as detailed as you'd like!)";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black font-sans antialiased">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            SkillDash <span className="font-light bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Discover</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your Personal AI Career Guide</p>
          {messages.length > 1 && !suggestions && !conversationEnded && (
            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              💡 Take your time - thoughtful answers lead to better insights!
            </div>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 chat-container">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            ))}

            {isLoading && (
              <MessageBubble
                role="assistant"
                content={<LoadingDots />}
                isLoading
              />
            )}

            {suggestions && !suggestions.forceEnd && <SuggestionsCard data={suggestions} />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Footer */}
      <footer className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-t border-black/5 p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder={getPlaceholder()}
                className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow pr-12"
                disabled={isLoading || !!suggestions || conversationEnded}
                maxLength={500}
              />
              {userInput.length > 400 && (
                <div className="absolute right-14 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {500 - userInput.length}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:shadow-lg disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading || !userInput.trim() || !!suggestions || conversationEnded}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          {!suggestions && !conversationEnded && (
            <div className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
              💭 The more you share, the better I can help you discover your unique strengths!
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
