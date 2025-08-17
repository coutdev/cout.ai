'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  showText = false, 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative animate-fade-in-scale">
        <div className={`${sizeClasses[size]} gradient-bg rounded-2xl flex items-center justify-center shadow-lg animate-pulse`}>
          <SparklesIcon className={`${iconSizes[size]} text-white`} />
        </div>
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur-xl animate-pulse`}></div>
      </div>
      
      {showText && (
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className={`${textSizes[size]} font-semibold text-slate-700 dark:text-slate-200`}>
            {text}
          </div>
        </div>
      )}
      
      <div className="flex space-x-1 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-600))` }}></div>
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-secondary-600))`, animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-600))`, animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
} 