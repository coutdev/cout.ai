'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from '../components/HomePage';
import Header from '../components/ui/Header';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function MainPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-subtle">
        <div className="flex flex-col items-center space-y-8 animate-fade-in-scale">
          <div className="relative">
            <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center shadow-xl animate-pulse">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur-2xl animate-pulse"></div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Loading AI Assistant</div>
            <div className="text-base text-muted">Preparing your personalized experience...</div>
          </div>
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-600))` }}></div>
            <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-secondary-600))`, animationDelay: '0.2s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-600))`, animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen gradient-bg-subtle">
      <Header />
      <main>
        <HomePage />
      </main>
    </div>
  );
}
