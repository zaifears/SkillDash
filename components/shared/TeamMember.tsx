import React from 'react'
import OptimizedImage from './OptimizedImage'

interface TeamMemberProps {
  name: string
  role: string
  imageUrl: string
  description: string
  contactUrl: string
  gradient: string
  index: number
}

const TeamMember: React.FC<TeamMemberProps> = ({ 
  name, 
  role, 
  imageUrl, 
  description, 
  contactUrl, 
  gradient, 
  index 
}) => {
  return (
    <div 
      className={`group relative flex flex-col items-center text-center p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-200/30 dark:border-gray-700/50 backdrop-blur-sm bg-gradient-to-br ${gradient}`}
      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
    >
      {/* Floating decoration */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Profile Image */}
      <div className="relative w-36 h-36 mb-6 rounded-full overflow-hidden shadow-xl border-4 border-white/50 dark:border-gray-700/50 transform group-hover:scale-110 transition-all duration-500">
        <OptimizedImage
          src={imageUrl}
          alt={`${name} profile`}
          width={144}
          height={144}
          className="object-cover"
          priority={index < 3} // Priority for first 3 team members
          sizes="(max-width: 768px) 144px, 144px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Name */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {name}
      </h2>

      {/* Role */}
      <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-pink-400/20 rounded-full border border-blue-200/50 dark:border-blue-700/50 mb-4">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
          {role}
        </p>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">
        {description}
      </p>

      {/* Contact Button */}
      <a
        href={contactUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Get in Touch
      </a>
    </div>
  )
}

export default TeamMember
