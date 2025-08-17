'use client';

import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '../../components/Chat/ChatInterface';
import Header from '../../components/ui/Header';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ChatPage() {
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
        <div className="flex flex-col items-center space-y-6 animate-fade-in-scale">
          <div className="relative">
            <div className="w-16 h-16 gradient-bg rounded-3xl flex items-center justify-center shadow-xl animate-pulse">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur-2xl animate-pulse"></div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Loading Chat Interface</div>
            <div className="text-sm text-muted">Preparing your AI assistant...</div>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-600))` }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-secondary-600))`, animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-600))`, animationDelay: '0.4s' }}></div>
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
      <main className="h-[calc(100vh-4rem)]">
        <ChatInterface />
      </main>
    </div>
  );
} 