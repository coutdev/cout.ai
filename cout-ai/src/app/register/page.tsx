'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { SparklesIcon, EyeIcon, EyeSlashIcon, SunIcon, MoonIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import ColorPicker from '../../components/ui/ColorPicker';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists in user_approvals
      const { data: existingApproval, error: checkError } = await supabase
        .from('user_approvals')
        .select('id, status')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingApproval) {
        if (existingApproval.status === 'pending') {
          setError('A registration request with this email is already pending approval.');
          return;
        } else if (existingApproval.status === 'approved') {
          setError('This email is already registered. Please sign in instead.');
          return;
        } else if (existingApproval.status === 'denied') {
          setError('A previous registration request with this email was denied. Please contact support if you believe this is an error.');
          return;
        }
      }

      // Create entry in user_approvals table
      const { error: insertError } = await supabase
        .from('user_approvals')
        .insert([
          {
            email: email,
            password: password,
            status: 'pending',
            requested_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;

      // Show success message
      setSubmitted(true);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // Success state - show confirmation message
  if (submitted) {
    return (
      <div className="min-h-screen gradient-bg-subtle flex flex-col justify-center py-16 sm:px-8 lg:px-10 relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="flex justify-center">
            <div className="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="mt-8 text-center text-4xl font-bold text-gray-900 dark:text-white">
            Registration Submitted!
          </h1>
          <div className="mt-10 card p-10 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <p className="text-lg text-blue-700 dark:text-blue-300 mb-4">
                Thank you for your interest in Cout.AI!
              </p>
              <p className="text-base text-blue-600 dark:text-blue-400 mb-4">
                Your registration request has been submitted and is pending administrator approval.
              </p>
              <p className="text-sm text-blue-500 dark:text-blue-500">
                You will receive an email notification once your account has been reviewed. This process typically takes 1-2 business days.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link 
                href="/register-status" 
                className="btn-primary w-full text-lg py-4 inline-block"
              >
                Check Application Status
              </Link>
              
              <Link 
                href="/login" 
                className="block text-base font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-subtle flex flex-col justify-center py-16 sm:px-8 lg:px-10 relative">
      {/* Back Button */}
      <Link
        href="/login"
        className="absolute top-5 left-5 p-4 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-3"
      >
        <ArrowLeftIcon className="w-6 h-6" />
        <span className="text-base font-medium">Back to Login</span>
      </Link>

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
          Request Access to Cout.AI
        </h1>
        <p className="mt-3 text-center text-base text-gray-600 dark:text-gray-400">
          Submit your registration request for admin approval
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="card p-10">
          {/* Information Banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Please note:</strong> All new accounts require administrator approval. You will receive an email notification once your request has been reviewed.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleRegister}>
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-lg py-4 pr-12"
                  placeholder="Create a password"
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
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field text-lg py-4 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
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
              disabled={loading}
              className="btn-primary w-full text-lg py-4"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Submitting request...
                </div>
              ) : (
                'Submit Registration Request'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/login" 
                className="font-medium text-lg text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 