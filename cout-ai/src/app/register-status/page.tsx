'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  SunIcon, 
  MoonIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import ColorPicker from '../../components/ui/ColorPicker';

interface RegistrationStatus {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
}

export default function RegisterStatusPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_approvals')
        .select('id, email, status, requested_at, processed_at, admin_notes')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          setError('No registration request found for this email address.');
        } else {
          throw error;
        }
      } else {
        setStatus(data);
      }
      
      setSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while checking status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
      case 'denied':
        return <XCircleIcon className="w-8 h-8 text-red-500" />;
      case 'pending':
      default:
        return <ClockIcon className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'denied':
        return 'red';
      case 'pending':
      default:
        return 'yellow';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <ColorPicker />
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
          Registration Status
        </h1>
        <p className="mt-3 text-center text-base text-gray-600 dark:text-gray-400">
          Check the status of your Cout.AI registration request
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="card p-10">
          {!searched ? (
            <form className="space-y-6" onSubmit={handleCheckStatus}>
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
                  placeholder="Enter your email to check status"
                />
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
                    Checking status...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-5 h-5 mr-3" />
                    Check Status
                  </div>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {status ? (
                <div className="space-y-6">
                  {/* Status Display */}
                  <div className={`bg-${getStatusColor(status.status)}-50 dark:bg-${getStatusColor(status.status)}-900/20 border border-${getStatusColor(status.status)}-200 dark:border-${getStatusColor(status.status)}-800 rounded-lg p-6`}>
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(status.status)}
                      <div>
                        <h3 className={`text-xl font-semibold text-${getStatusColor(status.status)}-700 dark:text-${getStatusColor(status.status)}-300 capitalize`}>
                          {status.status}
                        </h3>
                        <p className={`text-sm text-${getStatusColor(status.status)}-600 dark:text-${getStatusColor(status.status)}-400`}>
                          Your registration request is {status.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">{status.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Request Submitted
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">
                        {formatDate(status.requested_at)}
                      </p>
                    </div>

                    {status.processed_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Processed On
                        </label>
                        <p className="text-base text-gray-900 dark:text-white">
                          {formatDate(status.processed_at)}
                        </p>
                      </div>
                    )}

                    {status.admin_notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Admin Notes
                        </label>
                        <p className="text-base text-gray-900 dark:text-white">
                          {status.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status-specific actions */}
                  {status.status === 'approved' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-green-700 dark:text-green-300 mb-3">
                        🎉 Great news! Your account has been approved.
                      </p>
                      <Link 
                        href="/login" 
                        className="btn-primary w-full text-lg py-3 inline-block text-center"
                      >
                        Sign In to Your Account
                      </Link>
                    </div>
                  )}

                  {status.status === 'pending' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Your request is still being reviewed. We typically respond within 1-2 business days. 
                        You will receive an email notification once a decision has been made.
                      </p>
                    </div>
                  )}

                  {status.status === 'denied' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        Your registration request was not approved. If you believe this is an error 
                        or would like to appeal this decision, please contact support.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No registration request found for <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    If you haven't submitted a registration request yet, you can do so below.
                  </p>
                  <Link 
                    href="/register" 
                    className="btn-primary text-base py-3 px-6"
                  >
                    Submit Registration Request
                  </Link>
                </div>
              )}

              {/* Check Another Email */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setSearched(false);
                    setStatus(null);
                    setError(null);
                    setEmail('');
                  }}
                  className="text-base font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Check different email
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Other Options
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-3 text-center">
              <Link 
                href="/login" 
                className="font-medium text-base text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Back to Sign In
              </Link>
              
              <Link 
                href="/register" 
                className="font-medium text-base text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
              >
                Submit New Registration Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 