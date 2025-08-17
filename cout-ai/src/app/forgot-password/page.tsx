'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { 
  SparklesIcon, 
  EnvelopeIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ColorPicker from '../../components/ui/ColorPicker';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsEmailSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Reset state when going back
    setEmail('');
    setError(null);
    setIsEmailSent(false);
  };

  return (
    <div className="min-h-screen gradient-bg-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Theme Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {/* Color Picker */}
        <ColorPicker />
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          aria-label="Toggle theme"
        >
          <div className="relative">
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5 transition-transform duration-200" />
            ) : (
              <SunIcon className="w-5 h-5 transition-transform duration-200" />
            )}
          </div>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {!isEmailSent ? (
          <>
            <h1 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Reset your password
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mt-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ 
                     background: `linear-gradient(to bottom right, rgb(var(--color-accent-100)), rgb(var(--color-accent-200)))` 
                   }}>
                <CheckCircleIcon className="w-8 h-8" 
                                style={{ color: `rgb(var(--color-accent-600))` }} />
              </div>
            </div>
            <h1 className="mt-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>
            </p>
          </>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8">
          {!isEmailSent ? (
            <form className="space-y-6" onSubmit={handleResetRequest}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending reset link...
                  </div>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success message content */}
              <div className="text-center space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Check your inbox and click the link in the email to reset your password.
                  </p>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Didn't receive the email? Check your spam folder or</p>
                  <button
                    onClick={() => setIsEmailSent(false)}
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    try again with a different email address
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Remember your password?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                onClick={handleBackToLogin}
                className="inline-flex items-center font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 