'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, ExclamationTriangleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { sendChatMessage, getSessionHistory } from '../../lib/api';
import ChatSidebar, { ChatSidebarRef } from './ChatSidebar';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Utility function to properly convert timestamps to local timezone
const convertToLocalTime = (timestamp: string | Date): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // The backend creates UTC timestamps, but sometimes they come back without timezone indicators
  // Check if timestamp has timezone info (Z at end, or +/- followed by timezone offset)
  const hasTimezoneZ = timestamp.endsWith('Z');
  const hasTimezoneOffset = /[+-]\d{2}:\d{2}$/.test(timestamp) || /[+-]\d{4}$/.test(timestamp);
  const hasTimezone = hasTimezoneZ || hasTimezoneOffset;
  
  let dateStr = timestamp;
  if (!hasTimezone) {
    // If no timezone info, it's UTC from our backend, so add 'Z'
    dateStr = timestamp + 'Z';
  }
  
  // Create date object from UTC string - JavaScript automatically converts to local timezone
  const date = new Date(dateStr);
  
  // Verify the conversion worked and return fallback if invalid
  if (isNaN(date.getTime())) {
    console.error('Invalid date created from timestamp:', timestamp);
    return new Date(); // Fallback to current time
  }
  
  return date;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<ChatSidebarRef>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if device is mobile and handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
      // Removed auto-expansion for larger screens - sidebar stays hidden by default
    };

    // Check on initial load
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsSidebarCollapsed(!isSidebarCollapsed);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, isMobile ? 120 : 128);
      textarea.style.height = newHeight + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Load chat history for a specific session
  const loadSessionHistory = async (sessionId: string) => {
    try {
      setIsLoadingHistory(true);
      setError(null);
      
      const history = await getSessionHistory(sessionId, 50);
      
      const historyMessages: Message[] = history.map((item) => [
        {
          id: `${item.id}-user`,
          content: item.user_message,
          role: 'user' as const,
          timestamp: convertToLocalTime(item.created_at),
        },
        {
          id: `${item.id}-assistant`,
          content: item.ai_response,
          role: 'assistant' as const,
          timestamp: convertToLocalTime(item.created_at),
        }
      ]).flat();
      
      setMessages(historyMessages);
    } catch (error) {
      console.error('Failed to load session history:', error);
      setError(`Failed to load chat history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle session selection from sidebar
  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadSessionHistory(sessionId);
    // Auto-close sidebar on mobile after selecting session
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  };

  // Handle new chat creation
  const handleNewChat = () => {
    setCurrentSessionId(undefined);
    setMessages([]);
    setError(null);
    // Auto-close sidebar on mobile after creating new chat
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create user message with correct local timestamp
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(), // Keep the local time - don't overwrite this
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Send message to AI backend with session ID
      const response = await sendChatMessage(messageContent, currentSessionId);
      
      // Update current session ID if a new session was created
      if (response.session_id && response.session_id !== currentSessionId) {
        setCurrentSessionId(response.session_id);
      }
      
      // Update session title if it was changed
      if (response.session_title && response.session_id && sidebarRef.current) {
        sidebarRef.current.updateSessionTitle(response.session_id, response.session_title);
      }
      
      // Convert backend timestamp for AI response only
      const aiTimestamp = convertToLocalTime(response.timestamp);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: aiTimestamp,
      };
      
      // Add the assistant message (user message timestamp stays unchanged)
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      
      // Add error message to chat
      const errorChatMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ Error: ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date(), // Use local time for error messages too
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are you trained to know?",
    "Explain the basics of what a NAS is and what it is commonly used for.",
    "Tell me a joke",
    "What is a common tech stack to build a website similar to this one?"
  ];

  return (
    <div className={`relative h-full gradient-bg-subtle ${isMobile ? 'chat-mobile' : ''}`}>
      {/* Mobile Overlay */}
      {!isSidebarCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar - Fixed to left side of browser */}
      <div className={`fixed left-0 top-14 md:top-16 bottom-0 z-30 ${isMobile ? 'chat-mobile' : ''}`}>
        <ChatSidebar
          ref={sidebarRef}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* External Toggle Button - Only visible when sidebar is collapsed */}
      {isSidebarCollapsed && (
        <button
          onClick={handleSidebarToggle}
          className="fixed left-4 top-20 md:top-24 z-40 w-8 h-8 backdrop-blur-xl border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          style={{
            backgroundColor: `rgb(var(--color-accent-600))`,
            borderColor: `rgb(var(--color-accent-500))`,
            color: 'white',
            boxShadow: 'focus:0 0 0 2px rgb(var(--color-accent-500) / 0.5)'
          }}
          title="Show sidebar"
          aria-label="Show sidebar"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      )}

      {/* Main Chat Area - Offset by sidebar width */}
      <div className={`transition-all duration-300 h-full ${
        isSidebarCollapsed 
          ? 'ml-0'
          : isMobile ? 'ml-0' : 'ml-80'
      } ${isMobile ? 'main-content' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Error Alert */}
          {error && (
            <div className={`p-4 md:p-8 ${isMobile ? 'mobile-spacing-sm' : ''}`}>
              <div className="max-w-5xl mx-auto">
                <div className={`card p-4 md:p-5 bg-red-50/90 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/50 flex items-center space-x-4 animate-fade-in-scale ${isMobile ? 'card-mobile' : ''}`}>
                  <ExclamationTriangleIcon className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-red-600 dark:text-red-400 font-medium break-words">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-sm text-red-500 dark:text-red-300 hover:underline mt-1 transition-colors duration-150 touch-target"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading History Indicator */}
          {isLoadingHistory && (
            <div className={`p-4 md:p-8 ${isMobile ? 'mobile-spacing-sm' : ''}`}>
              <div className="max-w-5xl mx-auto">
                <div className={`card p-4 md:p-5 bg-indigo-50/90 dark:bg-indigo-900/20 border-indigo-200/50 dark:border-indigo-800/50 animate-fade-in-scale ${isMobile ? 'card-mobile' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    <p className="text-base text-indigo-600 dark:text-indigo-400 font-medium">Loading chat history...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar scroll-mobile ${isMobile ? 'pb-safe' : ''}`}>
            <div className={`max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-10 space-y-5 md:space-y-10 ${isMobile ? 'mobile-spacing' : ''}`}>
              {messages.length === 0 && !isLoadingHistory && (
                <div className="text-center py-10 md:py-20 animate-fade-in-up">
                  <div className="relative mb-8 md:mb-10">
                    <div className={`w-20 h-20 md:w-24 md:h-24 gradient-bg rounded-3xl flex items-center justify-center mx-auto shadow-xl`}>
                      <SparklesIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur-2xl transform scale-150"></div>
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 md:mb-4 ${isMobile ? 'heading-mobile' : 'heading-primary'}`}>
                    {currentSessionId ? 'Continue Your Conversation' : 'Welcome to AI Assistant!'}
                  </h3>
                  <p className={`text-slate-600 dark:text-slate-400 mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed text-base md:text-lg ${isMobile ? 'text-mobile' : 'text-muted'}`}>
                    {currentSessionId 
                      ? 'This session is ready for your next message.'
                      : "I'm your AI assistant, ready to help you with questions, tasks, and conversations on any topic. Ask me anything!"
                    }
                  </p>
                  {!currentSessionId && (
                    <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'sm:grid-cols-2 gap-4'} max-w-3xl mx-auto`}>
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(question)}
                          className={`card-interactive p-4 md:p-5 text-left bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 text-slate-700 dark:text-slate-300 animate-fade-in-up touch-target ${isMobile ? 'card-mobile' : ''}`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0 mt-1">
                              <SparklesIcon className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: `rgb(var(--color-accent-600))` }} />
                            </div>
                            <span className={`font-medium leading-relaxed text-base ${isMobile ? 'text-mobile' : ''}`}>{question}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`${isMobile ? 'max-w-[90%] message-mobile' : 'max-w-[80%] md:max-w-[70%]'} px-5 md:px-6 py-4 md:py-5 ${
                      message.role === 'user'
                        ? 'message-user'
                        : 'message-assistant'
                    }`}
                  >
                    <div className="text-base md:text-lg">
                      <MarkdownRenderer content={message.content} />
                    </div>
                    <p className={`chat-timestamp mt-3 md:mt-4 text-sm ${isMobile ? 'text-xs' : ''}`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in-scale">
                  <div className={`${isMobile ? 'message-mobile' : 'message-assistant'} px-5 md:px-6 py-4 md:py-5`}>
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                      <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form */}
          <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 ${isMobile ? 'input-mobile pb-safe' : 'p-8'}`}>
            <div className="max-w-5xl mx-auto">
              <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'space-x-3' : 'space-x-5'}`}>
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ask me anything... (Shift+Enter for new line)"
                    className={`input-field ${isMobile ? 'pr-14 py-4 text-lg' : 'pr-16 py-5 text-lg'} resize-none ${isMobile ? 'min-h-[3rem] max-h-[8rem]' : 'min-h-[4rem] max-h-36'}`}
                    disabled={isLoading || isLoadingHistory}
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: isMobile ? '3rem' : '4rem'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim() || isLoadingHistory}
                    className={`absolute ${isMobile ? 'right-3 top-3' : 'right-4 top-5'} ${isMobile ? 'p-2.5' : 'p-3'} text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg touch-target`}
                  >
                    <PaperAirplaneIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 