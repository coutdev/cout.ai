'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ColorPicker from './ColorPicker';
import { 
  SunIcon, 
  MoonIcon, 
  UserCircleIcon, 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  UserIcon,
  Bars3Icon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email?.includes('admin') || user?.email === 'your-admin-email@example.com';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isDropdownOpen, isMobileMenuOpen]);

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleHomeClick = () => {
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const handleChatClick = () => {
    router.push('/chat');
    setIsMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    router.push('/admin');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/profile');
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-2 md:space-x-6">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 md:space-x-3 group transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-xl p-1"
              style={{ 
                boxShadow: 'focus:0 0 0 2px rgb(var(--color-accent-500) / 0.5)'
              }}
            >
              <div className="relative">
                <div className="w-8 h-8 md:w-10 md:h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-105">
                  <SparklesIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur-xl"
                     style={{ background: `linear-gradient(to right, rgb(var(--color-accent-600)), rgb(var(--color-accent-secondary-600)), rgb(var(--color-accent-700)))` }}></div>
              </div>
              <div className="hidden xs:block">
                <h1 className="text-base md:text-lg font-bold text-gradient">
                  Cout.AI
                </h1>
                <p className="text-xs text-subtle -mt-0.5 font-medium hidden sm:block">
                  AI Assistant
                </p>
              </div>
            </button>

            {/* Desktop Navigation Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Home Button */}
              <button
                onClick={handleHomeClick}
                className="group relative inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl shadow-sm transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80"
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Home</span>
              </button>

              {/* Chat Button */}
              <button
                onClick={handleChatClick}
                className="group relative inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl shadow-sm transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Chat</span>
              </button>

              {/* Admin Button - Only show for admin users */}
              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="group relative inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 rounded-xl shadow-sm transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200/60 dark:border-purple-700/60 hover:border-purple-300/80 dark:hover:border-purple-600/80"
                >
                  <CogIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Admin</span>
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 touch-target"
              aria-label="Toggle mobile menu"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Color Picker - Hidden on small mobile */}
            <div className="hidden xs:block">
              <ColorPicker />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 md:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 touch-target"
              aria-label="Toggle theme"
            >
              <div className="relative">
                {theme === 'light' ? (
                  <MoonIcon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-200" />
                ) : (
                  <SunIcon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-200" />
                )}
              </div>
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="group flex items-center space-x-2 md:space-x-3 px-2 md:px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 touch-target"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                >
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg gradient-bg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                    <UserCircleIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200">
                      {user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-subtle leading-tight hidden md:block">
                      Online
                    </span>
                  </div>
                  <ChevronDownIcon 
                    className={`w-3 h-3 md:w-4 md:h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 md:w-56 py-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-xl z-50 animate-fade-in-scale">
                    <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Account
                      </p>
                      <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 truncate mt-1">
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 group touch-target"
                        role="menuitem"
                      >
                        <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors duration-150">
                          <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">
                            Profile
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            View your account
                          </span>
                        </div>
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left hover:bg-red-50 dark:hover:bg-red-900/20 group touch-target"
                        role="menuitem"
                      >
                        <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-100 dark:bg-red-900/20 group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors duration-150">
                          <ArrowRightStartOnRectangleIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-medium text-red-700 dark:text-red-300">
                            Sign Out
                          </span>
                          <span className="text-xs text-red-500 dark:text-red-400">
                            End your session
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 dark:border-slate-700/50 py-3 animate-fade-in-scale">
            <div className="space-y-2">
              <button
                onClick={handleHomeClick}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-150 touch-target"
              >
                <HomeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Home</span>
              </button>
              
              <button
                onClick={handleChatClick}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-150 touch-target"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Chat</span>
              </button>

              {/* Admin Button - Only show for admin users */}
              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150 touch-target"
                >
                  <CogIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Admin Dashboard</span>
                </button>
              )}

              {/* Show Color Picker in mobile menu for very small screens */}
              <div className="xs:hidden px-3 py-2">
                <ColorPicker />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
} 