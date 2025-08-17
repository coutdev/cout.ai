'use client';

import { useRouter } from 'next/navigation';
import { SparklesIcon, ChatBubbleLeftRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleNewChat = () => {
    router.push('/chat');
  };

  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Natural Conversations',
      description: 'Engage in human-like conversations with advanced AI that understands context and nuance.'
    },
    {
      icon: SparklesIcon,
      title: 'Intelligent Assistance',
      description: 'Get help with writing, analysis, problem-solving, and creative tasks with AI-powered insights.'
    },
    {
      icon: ArrowRightIcon,
      title: 'Instant Responses',
      description: 'Receive immediate, thoughtful responses to your questions and requests.'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg-subtle">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-24 pb-20">
        <div className="text-center">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center mb-10">
            <div className="relative">
              <div className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center shadow-xl">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r opacity-20 blur-2xl transform scale-150" 
                   style={{ background: `linear-gradient(to right, rgb(var(--color-accent-600)), rgb(var(--color-accent-secondary-600)), rgb(var(--color-accent-700)))` }}></div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mb-16">
            <h1 className="heading-primary mb-8 text-5xl sm:text-6xl lg:text-7xl">
              Welcome to Cout.AI, <span className="text-gradient">{user?.email?.split('@')[0] || 'User'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted max-w-4xl mx-auto leading-relaxed">
              Cout.AI is ready to help you with questions, projects and analysis on any topic. <br />
              Click "Start New Chat" to get started.
            </p>
          </div>

          {/* Main CTA */}
          <div className="mb-20">
            <button
              onClick={handleNewChat}
              className="group relative inline-flex items-center space-x-4 px-10 py-5 text-xl font-semibold text-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              style={{ 
                background: `linear-gradient(to right, rgb(var(--color-accent-600)), rgb(var(--color-accent-secondary-600)), rgb(var(--color-accent-700)))`,
                boxShadow: `0 0 0 2px rgb(var(--color-accent-500) / 0.5), 0 20px 25px -5px rgb(var(--color-accent-500) / 0.3)`
              }}
            >
              <ChatBubbleLeftRightIcon className="w-7 h-7" />
              <span>Start New Chat</span>
              <ArrowRightIcon className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-10 text-center group hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                     style={{ 
                       background: `linear-gradient(to bottom right, rgb(var(--color-accent-100)), rgb(var(--color-accent-200)))` 
                     }}>
                  <feature.icon className="w-10 h-10" 
                                style={{ color: `rgb(var(--color-accent-600))` }} />
                </div>
              </div>
              <h3 className="heading-secondary mb-5 text-xl">
                {feature.title}
              </h3>
              <p className="text-muted leading-relaxed text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 pt-16 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
          <p className="text-subtle text-base">
            Cout.AI • Your conversations are private and secure
          </p>
        </div>
      </div>
    </div>
  );
} 