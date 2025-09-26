import React from 'react';

const HiringHeader = React.memo(() => {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 overflow-hidden">
      {/* Bouncing balls animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-4 h-4 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-32 right-20 w-3 h-3 bg-blue-400/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-pink-400/30 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute bottom-60 right-32 w-3 h-3 bg-indigo-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
        <div className="absolute top-40 left-1/3 w-4 h-4 bg-green-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }} />
        <div className="absolute bottom-32 right-1/4 w-6 h-6 bg-yellow-400/25 rounded-full animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3.8s' }} />
        <div className="absolute top-60 right-10 w-3 h-3 bg-teal-400/35 rounded-full animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '4.2s' }} />
        <div className="absolute bottom-20 left-1/2 w-4 h-4 bg-orange-400/30 rounded-full animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '3.6s' }} />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-400/20 to-pink-400/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-gradient-to-t from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="text-center">
          {/* Main heading with gradient text */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-12 leading-tight">
            Hire Top{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
              Student Talent
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-16">
            Connect with skilled, motivated students and recent graduates. Find your next intern, part-time employee, or entry-level hire from our verified talent pool.
          </p>
        </div>
      </div>
    </div>
  );
});

HiringHeader.displayName = 'HiringHeader';
export default HiringHeader;
