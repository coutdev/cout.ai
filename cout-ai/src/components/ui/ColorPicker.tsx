'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useColor, colorThemes } from '../../context/ColorContext';

export default function ColorPicker() {
  const { currentColor, setColor } = useColor();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleColorSelect = (colorKey: string) => {
    setColor(colorKey as keyof typeof colorThemes);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Color Picker Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group"
        style={{ 
          boxShadow: isOpen ? `0 0 0 2px rgb(var(--color-accent-500) / 0.5)` : undefined
        }}
        aria-label="Change accent color"
        aria-expanded={isOpen}
      >
        <div className="relative flex items-center space-x-2">
          {/* Current Color Preview */}
          <div className="relative">
            <div 
              className="w-5 h-5 rounded-lg shadow-sm border border-white/20"
              style={{ 
                background: `linear-gradient(135deg, ${colorThemes[currentColor].primary}, ${colorThemes[currentColor].secondary})`
              }}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          
          {/* Dropdown Arrow */}
          <ChevronDownIcon 
            className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-xl z-50 animate-fade-in-scale">
          <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Accent Color
            </p>
          </div>
          
          <div className="p-2 space-y-1">
            {Object.entries(colorThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleColorSelect(key)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 group ${
                  currentColor === key 
                    ? 'bg-slate-50 dark:bg-slate-700/50 ring-1 ring-slate-200 dark:ring-slate-600' 
                    : ''
                }`}
              >
                {/* Color Preview */}
                <div className="relative">
                  <div 
                    className="w-6 h-6 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-600/50"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                    }}
                  />
                  {currentColor === key && (
                    <div className="absolute inset-0 rounded-lg border-2 border-white shadow-sm" />
                  )}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {/* Color Name */}
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {theme.name}
                  </span>
                  {currentColor === key && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Current
                    </div>
                  )}
                </div>
                
                {/* Checkmark for current selection */}
                {currentColor === key && (
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-current to-current opacity-60" 
                       style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 