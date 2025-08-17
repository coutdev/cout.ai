'use client';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useColor } from '../context/ColorContext';
import { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  CalendarDaysIcon, 
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ChartBarIcon,
  PaintBrushIcon,
  CogIcon,
  BookOpenIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  EyeIcon,
  KeyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getChatSessions, getChatHistory } from '../lib/api';

interface UserStats {
  totalSessions: number;
  totalMessages: number;
  averageMessagesPerSession: number;
  firstSessionDate: Date | null;
  lastActivityDate: Date | null;
  activeDays: number;
  longestSession: number;
  favoriteTimeOfDay: string;
  streakDays: number;
}

export default function ProfilePage() {
  const { user, resetPassword } = useAuth();
  const { theme } = useTheme();
  const { currentColor } = useColor();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState<string | null>(null);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Get all user sessions
        const sessions = await getChatSessions(100);
        
        if (sessions.length === 0) {
          setUserStats({
            totalSessions: 0,
            totalMessages: 0,
            averageMessagesPerSession: 0,
            firstSessionDate: null,
            lastActivityDate: null,
            activeDays: 0,
            longestSession: 0,
            favoriteTimeOfDay: 'N/A',
            streakDays: 0
          });
          return;
        }

        // Calculate comprehensive statistics
        const totalSessions = sessions.length;
        const totalMessages = sessions.reduce((sum, session) => sum + session.message_count, 0);
        const averageMessagesPerSession = totalMessages / totalSessions;

        // Find first and last activity dates
        const sessionDates = sessions.map(s => new Date(s.created_at));
        const firstSessionDate = new Date(Math.min(...sessionDates.map(d => d.getTime())));
        const lastActivityDate = new Date(Math.max(...sessionDates.map(d => d.getTime())));

        // Calculate active days (unique days with sessions)
        const uniqueDays = new Set(
          sessions.map(s => new Date(s.created_at).toDateString())
        );
        const activeDays = uniqueDays.size;

        // Find longest session by message count
        const longestSession = Math.max(...sessions.map(s => s.message_count));

        // Calculate favorite time of day (simplified - based on session creation times)
        const hours = sessions.map(s => new Date(s.created_at).getHours());
        const timeRanges = {
          'Morning (6-12)': hours.filter(h => h >= 6 && h < 12).length,
          'Afternoon (12-18)': hours.filter(h => h >= 12 && h < 18).length,
          'Evening (18-24)': hours.filter(h => h >= 18 || h < 6).length,
        };
        const favoriteTimeOfDay = Object.entries(timeRanges)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

        // Calculate streak (simplified - consecutive days with activity)
        const sortedDates = Array.from(uniqueDays).sort();
        let streakDays = 1;
        for (let i = sortedDates.length - 2; i >= 0; i--) {
          const currentDate = new Date(sortedDates[i + 1]);
          const prevDate = new Date(sortedDates[i]);
          const diffTime = currentDate.getTime() - prevDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            streakDays++;
          } else {
            break;
          }
        }

        setUserStats({
          totalSessions,
          totalMessages,
          averageMessagesPerSession,
          firstSessionDate,
          lastActivityDate,
          activeDays,
          longestSession,
          favoriteTimeOfDay,
          streakDays
        });

      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        setUserStats(null);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const profileInfo = [
    {
      icon: EnvelopeIcon,
      label: 'Email Address',
      value: user?.email || 'Not available',
      description: 'Your account email address'
    },
    {
      icon: CalendarDaysIcon,
      label: 'Member Since',
      value: user?.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Not available',
      description: 'When you joined Cout.AI'
    },
    {
      icon: CheckBadgeIcon,
      label: 'Account Status',
      value: user?.email_confirmed_at ? 'Verified' : 'Pending Verification',
      description: 'Your account verification status'
    }
  ];

  const activityStats = [
    {
      icon: ChatBubbleLeftRightIcon,
      label: 'Total Conversations',
      value: userStats?.totalSessions.toLocaleString() || '0',
      description: 'Chat sessions started',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BookOpenIcon,
      label: 'Messages Exchanged',
      value: userStats?.totalMessages.toLocaleString() || '0',
      description: 'Total messages sent and received',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: ChartBarIcon,
      label: 'Average Session Length',
      value: userStats?.averageMessagesPerSession ? `${Math.round(userStats.averageMessagesPerSession)} msgs` : '0 msgs',
      description: 'Messages per conversation',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrophyIcon,
      label: 'Longest Session',
      value: userStats?.longestSession ? `${userStats.longestSession} messages` : '0 messages',
      description: 'Your most engaging conversation',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: CalendarDaysIcon,
      label: 'Active Days',
      value: userStats?.activeDays.toLocaleString() || '0',
      description: 'Days with AI conversations',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: FireIcon,
      label: 'Current Streak',
      value: userStats?.streakDays ? `${userStats.streakDays} days` : '0 days',
      description: 'Consecutive days of activity',
      color: 'from-red-500 to-red-600'
    }
  ];

  const preferences = [
    {
      icon: PaintBrushIcon,
      label: 'Color Theme',
      value: currentColor.charAt(0).toUpperCase() + currentColor.slice(1),
      description: 'Your current accent color',
      preview: true
    },
    {
      icon: EyeIcon,
      label: 'Display Mode',
      value: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
      description: 'Your preferred visual theme'
    },
    {
      icon: ClockIcon,
      label: 'Favorite Time',
      value: userStats?.favoriteTimeOfDay || 'N/A',
      description: 'When you chat most often'
    },
    {
      icon: SparklesIcon,
      label: 'First Session',
      value: userStats?.firstSessionDate ? userStats.firstSessionDate.toLocaleDateString() : 'N/A',
      description: 'Your first conversation date'
    }
  ];

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setPasswordResetError('No email address found for this account');
      return;
    }

    setIsResettingPassword(true);
    setPasswordResetError(null);
    setPasswordResetMessage(null);

    try {
      await resetPassword(user.email);
      setPasswordResetMessage(`Password reset email sent to ${user.email}. Check your inbox for reset instructions.`);
    } catch (error) {
      setPasswordResetError(error instanceof Error ? error.message : 'Failed to send password reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 gradient-bg rounded-3xl flex items-center justify-center shadow-xl">
                <UserCircleIcon className="w-14 h-14 text-white" />
              </div>
              <div className="absolute inset-0 rounded-3xl opacity-20 blur-2xl transform scale-150" 
                   style={{ background: `linear-gradient(to right, rgb(var(--color-accent-600)), rgb(var(--color-accent-secondary-600)), rgb(var(--color-accent-700)))` }}></div>
            </div>
          </div>
          
          <h1 className="heading-primary mb-4 text-4xl sm:text-5xl">
            My Profile
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            Your personalized dashboard for managing account settings, tracking activity, and customizing your Cout.AI experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Information Card */}
          <div className="card p-8">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ 
                     background: `linear-gradient(to bottom right, rgb(var(--color-accent-100)), rgb(var(--color-accent-200)))` 
                   }}>
                <UserCircleIcon className="w-8 h-8" 
                                style={{ color: `rgb(var(--color-accent-600))` }} />
              </div>
              <div>
                <h2 className="heading-secondary mb-2 text-2xl">
                  Welcome, {user?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className="text-muted">
                  Your account information and current settings
                </p>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              {profileInfo.map((info, index) => (
                <div
                  key={index}
                  className="group p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:shadow-md animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                         style={{ 
                           background: `linear-gradient(to bottom right, rgb(var(--color-accent-50)), rgb(var(--color-accent-100)))` 
                         }}>
                      <info.icon className="w-5 h-5" 
                                 style={{ color: `rgb(var(--color-accent-600))` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {info.label}
                      </h3>
                      <p className="text-base font-medium text-slate-900 dark:text-slate-100 mb-2 break-words">
                        {info.value}
                      </p>
                      <p className="text-xs text-subtle">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Overview */}
          <div className="card p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ 
                     background: `linear-gradient(to bottom right, rgb(var(--color-accent-100)), rgb(var(--color-accent-200)))` 
                   }}>
                <ChartBarIcon className="w-8 h-8" 
                              style={{ color: `rgb(var(--color-accent-600))` }} />
              </div>
              <div>
                <h2 className="heading-secondary mb-2 text-2xl">
                  Activity Overview
                </h2>
                <p className="text-muted">
                  Your AI assistant usage statistics
                </p>
              </div>
            </div>

            {isLoadingStats ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {activityStats.map((stat, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:shadow-md animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${stat.color} shadow-sm`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-subtle leading-tight">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preferences & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ 
                     background: `linear-gradient(to bottom right, rgb(var(--color-accent-100)), rgb(var(--color-accent-200)))` 
                   }}>
                <CogIcon className="w-8 h-8" 
                         style={{ color: `rgb(var(--color-accent-600))` }} />
              </div>
              <div>
                <h2 className="heading-secondary mb-2 text-2xl">
                  Preferences
                </h2>
                <p className="text-muted">
                  Your personalization settings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {preferences.map((pref, index) => (
                <div
                  key={index}
                  className="group p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:shadow-md animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                           style={{ 
                             background: `linear-gradient(to bottom right, rgb(var(--color-accent-50)), rgb(var(--color-accent-100)))` 
                           }}>
                        <pref.icon className="w-5 h-5" 
                                   style={{ color: `rgb(var(--color-accent-600))` }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {pref.label}
                        </h3>
                        <p className="text-xs text-subtle">
                          {pref.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {pref.preview && (
                        <div className="w-4 h-4 rounded-full shadow-sm"
                             style={{ backgroundColor: `rgb(var(--color-accent-500))` }}></div>
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {pref.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Information */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-full" 
                   style={{ backgroundColor: `rgb(var(--color-accent-100))` }}>
                <CheckBadgeIcon className="w-6 h-6"
                               style={{ color: `rgb(var(--color-accent-600))` }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Security Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your account security status and authentication details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Authentication Method
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Email & Password
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Last Sign In
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Account Verification
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.email_confirmed_at ? 'Email Verified' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <BoltIcon className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Data Protection
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Encrypted & Secure
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Reset Section */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-full" 
                   style={{ backgroundColor: `rgb(var(--color-accent-100))` }}>
                <KeyIcon className="w-6 h-6"
                        style={{ color: `rgb(var(--color-accent-600))` }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Password Management
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reset your password securely via email verification
                </p>
              </div>
            </div>

            {/* Success Message */}
            {passwordResetMessage && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckBadgeIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-600 dark:text-green-400">{passwordResetMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {passwordResetError && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{passwordResetError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Password Reset
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send a secure password reset link to your email
                  </p>
                </div>
                <button
                  onClick={handlePasswordReset}
                  disabled={isResettingPassword}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResettingPassword ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <KeyIcon className="w-4 h-4 mr-2" />
                      Reset Password
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Tips */}
        <div className="card p-8 mb-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                 style={{ 
                   background: `linear-gradient(to bottom right, rgb(var(--color-accent-100)), rgb(var(--color-accent-200)))` 
                 }}>
              <BoltIcon className="w-8 h-8" 
                        style={{ color: `rgb(var(--color-accent-600))` }} />
            </div>
            <div>
              <h2 className="heading-secondary mb-2 text-2xl">
                Personal Insights
              </h2>
              <p className="text-muted">
                Discover patterns in your AI assistant usage
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Engagement Level</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                {userStats?.averageMessagesPerSession && userStats.averageMessagesPerSession > 5 
                  ? "You have great conversations with your AI assistant!" 
                  : "Try having longer conversations to get better assistance."}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Average: {userStats?.averageMessagesPerSession ? Math.round(userStats.averageMessagesPerSession) : 0} messages per chat
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <CalendarDaysIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">Consistency</h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                {userStats?.activeDays && userStats.activeDays > 7 
                  ? "You're building a great habit of regular AI assistance!" 
                  : "Try using your AI assistant more regularly for better results."}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Active on {userStats?.activeDays || 0} different days
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Exploration</h3>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                {userStats?.totalSessions && userStats.totalSessions > 5 
                  ? "You're great at exploring different topics and conversations!" 
                  : "Try starting new conversations about different topics."}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {userStats?.totalSessions || 0} unique conversations started
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
            <p className="text-subtle text-xs">
            Contact the admin for support.
          </p>
        </div>
      </div>
    </div>
  );
} 