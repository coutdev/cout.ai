'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon, 
  TrashIcon, 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolidIcon } from '@heroicons/react/24/solid';
import { getChatSessions, createChatSession, deleteChatSession, deleteAllChatSessions } from '../../lib/api';

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatSidebarProps {
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export interface ChatSidebarRef {
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
}

const ChatSidebar = forwardRef<ChatSidebarRef, ChatSidebarProps>(({ currentSessionId, onSessionSelect, onNewChat, isCollapsed, onToggle }, ref) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    updateSessionTitle: (sessionId: string, newTitle: string) => {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle }
          : session
      ));
    }
  }));

  // Load chat sessions
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const sessionsList = await getChatSessions();
      setSessions(sessionsList);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Create new chat session
  const handleNewChat = async () => {
    try {
      setIsCreating(true);
      const newSession = await createChatSession();
      setSessions(prev => [newSession, ...prev]);
      onSessionSelect(newSession.id);
    } catch (error) {
      console.error('Failed to create new session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete a chat session
  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) {
      return;
    }

    try {
      await deleteChatSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // If the deleted session was the current one, start a new chat
      if (currentSessionId === sessionId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // Delete all chat sessions
  const handleDeleteAllSessions = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllChatSessions();
      setSessions([]);
      setShowDeleteAllModal(false);
      
      // Start a new chat since all sessions are deleted
      onNewChat();
    } catch (error) {
      console.error('Failed to delete all sessions:', error);
      setError('Failed to delete all sessions. Please try again.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 px-0.5 rounded font-semibold" style={{
          backgroundColor: `rgb(var(--color-accent-100))`,
          color: `rgb(var(--color-accent-800))`
        }}>
          {part}
        </span>
      ) : part
    );
  };

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard shortcut for search (Ctrl/Cmd + F)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f' && !isCollapsed) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, isCollapsed]);

  // Clear search when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed && searchQuery) {
      setSearchQuery('');
    }
  }, [isCollapsed, searchQuery]);

  return (
    <div className={`${
      isCollapsed ? 'w-0' : 'w-80'
    } h-full sidebar transition-all duration-300 ease-in-out relative`}>
      
      {/* Collapse/Expand Toggle Button - Only visible when expanded */}
      {!isCollapsed && (
        <button
          onClick={onToggle}
          onKeyDown={(e) => e.key === 'Enter' && onToggle()}
          aria-label="Collapse sidebar"
          className="absolute -right-6 top-6 z-20 w-8 h-8 backdrop-blur-xl border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          style={{
            backgroundColor: `rgb(var(--color-accent-600))`,
            borderColor: `rgb(var(--color-accent-500))`,
            color: 'white',
            boxShadow: 'focus:0 0 0 2px rgb(var(--color-accent-500) / 0.5)'
          }}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      )}

      {/* Sidebar Content - Only visible when expanded */}
      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-secondary text-slate-900 dark:text-slate-100">
                Chat Sessions
              </h2>
            </div>
            
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              disabled={isCreating}
              className="btn-primary w-full mb-4"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{isCreating ? 'Creating...' : 'New Chat'}</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-4 w-4 transition-colors duration-200 ${
                  searchQuery ? 'text-accent-500' : 'text-slate-400 dark:text-slate-500'
                }`} style={searchQuery ? { color: `rgb(var(--color-accent-500))` } : undefined} />
              </div>
              <input
                type="text"
                placeholder="Search conversations... (Ctrl+F)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 hover:border-slate-300/80 dark:hover:border-slate-600/80 hover:bg-white/80 dark:hover:bg-slate-800/80"
                style={{
                  boxShadow: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = `rgb(var(--color-accent-400))`;
                  e.target.style.boxShadow = `0 0 0 2px rgb(var(--color-accent-500) / 0.3)`;
                  e.target.style.backgroundColor = 'rgb(255 255 255 / 0.9)';
                  if (document.documentElement.classList.contains('dark')) {
                    e.target.style.backgroundColor = 'rgb(30 41 59 / 0.9)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '';
                }}
                ref={searchInputRef}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 hover:scale-110"
                  title="Clear search (Esc)"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50/80 dark:bg-red-900/20 border-b border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-500 dark:text-red-300 hover:underline mt-1 transition-colors duration-150"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="loading-shimmer">
                    <div className={`${
                      'h-16 rounded-xl'
                    }`}></div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
                    No chat sessions yet
                  </p>
                  <p className="text-xs text-subtle">
                    Create your first chat to get started!
                  </p>
                </div>
              )
            ) : filteredSessions.length === 0 ? (
              (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
                    No conversations found
                  </p>
                  <p className="text-xs text-subtle">
                    Try searching with different keywords
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs text-accent-600 dark:text-accent-400 hover:underline transition-colors duration-200"
                    style={{ color: `rgb(var(--color-accent-600))` }}
                  >
                    Clear search
                  </button>
                </div>
              )
            ) : (
              <div className="p-3 space-y-2">
                {filteredSessions.map((session, index) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionSelect(session.id)}
                    className={`group sidebar-item cursor-pointer p-3 ${
                      currentSessionId === session.id ? 'sidebar-item-active' : ''
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    title={session.title}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Session Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        currentSessionId === session.id
                          ? 'text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                      style={currentSessionId === session.id ? {
                        background: `linear-gradient(to bottom right, rgb(var(--color-accent-500)), rgb(var(--color-accent-secondary-600)), rgb(var(--color-accent-600)))`
                      } : undefined}>
                        {currentSessionId === session.id ? (
                          <ChatBubbleLeftRightSolidIcon className="w-5 h-5" />
                        ) : (
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        )}
                      </div>

                      {/* Session Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-semibold truncate transition-colors duration-200 ${
                            currentSessionId === session.id
                              ? 'text-slate-800 dark:text-slate-100'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                          style={currentSessionId === session.id ? {
                            color: `rgb(var(--color-accent-800))`,
                          } : undefined}>
                            {highlightSearchTerm(session.title, searchQuery)}
                          </h3>
                          
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:scale-110"
                            title="Delete session"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted font-medium">
                            {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-subtle">
                            {formatDate(session.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="space-y-3">
              <div className="flex items-center justify-center text-xs text-subtle">
                <CalendarIcon className="w-3 h-3 mr-1.5" />
                <span className="font-medium">
                  {searchQuery ? (
                    <>
                      {filteredSessions.length} of {sessions.length} sessions
                      {searchQuery && (
                        <span className="ml-1 text-accent-600 dark:text-accent-400" style={{ color: `rgb(var(--color-accent-600))` }}>
                          • "{searchQuery}"
                        </span>
                      )}
                    </>
                  ) : (
                    `${sessions.length} total sessions`
                  )}
                </span>
              </div>
              
              {/* Delete All Chats Button */}
              {sessions.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllModal(true)}
                  disabled={isDeletingAll}
                  className="w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                  <span>{isDeletingAll ? 'Deleting...' : 'Delete All'}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete All Sessions Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full animate-fade-in-scale">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="heading-secondary text-lg text-slate-900 dark:text-slate-100">
                  Delete All Chats
                </h3>
                <p className="text-sm text-muted">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete all {sessions.length} chat session{sessions.length !== 1 ? 's' : ''}? 
              This will permanently remove all your conversations and cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={isDeletingAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllSessions}
                disabled={isDeletingAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-xl hover:bg-red-700 hover:border-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeletingAll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar; 