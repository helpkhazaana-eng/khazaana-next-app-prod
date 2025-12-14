'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const HIGHLIGHT_DISMISSED_KEY = 'khazaana_lang_highlight_dismissed';

interface LanguageToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function LanguageToggle({ className = '', showLabel = true }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all ${className}`}
      aria-label={`Switch to ${language === 'en' ? 'Bengali' : 'English'}`}
    >
      <Globe className="w-4 h-4" />
      {showLabel && (
        <span className="text-sm font-medium">
          {language === 'en' ? 'বাংলা' : 'English'}
        </span>
      )}
    </button>
  );
}

// Compact version for mobile and desktop headers with highlight
export function LanguageToggleCompact({ className = '' }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();
  const [showHighlight, setShowHighlight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only show highlight if user is on English and hasn't dismissed
    if (language === 'en') {
      const dismissed = localStorage.getItem(HIGHLIGHT_DISMISSED_KEY);
      if (!dismissed) {
        // Show highlight after a short delay
        const timer = setTimeout(() => setShowHighlight(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [language]);

  const handleClick = () => {
    toggleLanguage();
    setShowHighlight(false);
    localStorage.setItem(HIGHLIGHT_DISMISSED_KEY, 'true');
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all relative",
          showHighlight && mounted
            ? "bg-orange-100 ring-2 ring-orange-400 ring-offset-2 animate-pulse-subtle"
            : "bg-slate-100 hover:bg-slate-200",
          className
        )}
        aria-label={`Switch to ${language === 'en' ? 'Bengali' : 'English'}`}
      >
        <span className="text-sm font-bold">
          {language === 'en' ? 'বা' : 'En'}
        </span>
        
        {/* Sparkle indicator when highlighted */}
        {showHighlight && mounted && (
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-orange-500 animate-bounce" />
        )}
      </button>
      
      {/* Tooltip hint */}
      {showHighlight && mounted && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-lg whitespace-nowrap z-50 animate-fade-in">
          বাংলায় দেখুন!
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

// Pill toggle for settings/header
export function LanguageTogglePill({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center bg-slate-100 rounded-full p-1 ${className}`}>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('bn')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          language === 'bn'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
