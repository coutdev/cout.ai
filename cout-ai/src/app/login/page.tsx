'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SparklesIcon, EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import ColorPicker from '../../components/ui/ColorPicker';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      // No need to handle redirect here as it's handled in AuthContext
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen gradient-bg-subtle flex flex-col justify-center py-16 sm:px-8 lg:px-10 relative">
      {/* Theme Controls */}
      <div className="absolute top-5 right-5 flex items-center space-x-3">
        {/* Color Picker */}
        <ColorPicker />
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          aria-label="Toggle theme"
        >
          <div className="relative">
            {theme === 'light' ? (
              <MoonIcon className="w-6 h-6 transition-transform duration-200" />
            ) : (
              <SunIcon className="w-6 h-6 transition-transform duration-200" />
            )}
          </div>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-center text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Cout.AI
        </h1>
        <p className="mt-3 text-center text-base text-gray-600 dark:text-gray-400">
          Enter your credentials to access Cout.AI
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="card p-10">
          <form className="space-y-8" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-lg py-4"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-lg py-4 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-6 h-6" />
                  ) : (
                    <EyeIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-base text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg py-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-base font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  New to CoutAI?
                </span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/register" 
                className="font-medium text-lg text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 