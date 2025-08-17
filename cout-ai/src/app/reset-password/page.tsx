'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { 
  SparklesIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  MoonIcon, 
  SunIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import ColorPicker from '../../components/ui/ColorPicker';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if the user has a valid session (from email link)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsValidSession(false);
          return;
        }

        // Check if we have an access token (indicates valid reset session)
        if (data.session?.access_token) {
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen gradient-bg-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 gradient-bg rounded-3xl flex items-center justify-center shadow-xl animate-pulse">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center mt-6">
            <div className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Verifying reset link</div>
            <div className="text-sm text-muted">Please wait while we validate your request...</div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid session - show error
  if (!isValidSession) {
    return (
      <div className="min-h-screen gradient-bg-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="mt-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Invalid reset link
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          
          <div className="mt-8 text-center">
            <Link 
              href="/forgot-password" 
              className="inline-flex items-center font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Theme Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ColorPicker />
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
        
        {!isSuccess ? (
          <>
            <h1 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Set new password
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Choose a strong password to secure your account
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
              Password updated!
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Your password has been successfully updated. Redirecting to sign in...
            </p>
          </>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8">
          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password requirements */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Password requirements:</h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li className="flex items-center">
                    <span className={`mr-2 ${password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`}>
                      {password.length >= 6 ? '✓' : '○'}
                    </span>
                    At least 6 characters
                  </li>
                  <li className="flex items-center">
                    <span className={`mr-2 ${/(?=.*[a-z])/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                      {/(?=.*[a-z])/.test(password) ? '✓' : '○'}
                    </span>
                    One lowercase letter
                  </li>
                  <li className="flex items-center">
                    <span className={`mr-2 ${/(?=.*[A-Z])/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                      {/(?=.*[A-Z])/.test(password) ? '✓' : '○'}
                    </span>
                    One uppercase letter
                  </li>
                  <li className="flex items-center">
                    <span className={`mr-2 ${/(?=.*\d)/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                      {/(?=.*\d)/.test(password) ? '✓' : '○'}
                    </span>
                    One number
                  </li>
                </ul>
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
                disabled={isLoading || !password.trim() || !confirmPassword.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating password...
                  </div>
                ) : (
                  'Update password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  You can now sign in with your new password.
                </p>
              </div>
              
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-600))` }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-secondary-600))`, animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `rgb(var(--color-accent-600))`, animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 