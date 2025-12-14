'use client';

import { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const PROMPT_DISMISSED_KEY = 'khazaana_language_prompt_dismissed';

interface LanguagePromptProps {
  className?: string;
}

export default function LanguagePrompt({ className = '' }: LanguagePromptProps) {
  const { language, setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Only show if user is on English and hasn't dismissed permanently
    if (language === 'bn') return;
    
    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (dismissed === 'permanent') return;
    
    // Show after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Auto-hide after 6 seconds
      const hideTimer = setTimeout(() => {
        handleDismiss();
      }, 6000);
      
      return () => clearTimeout(hideTimer);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [language]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleDismissPermanent = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'permanent');
    handleDismiss();
  };

  const handleSwitchToBengali = () => {
    setLanguage('bn');
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'permanent');
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "transition-all duration-300 ease-out",
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className
      )}
    >
      <div className="bg-white rounded-xl p-3 shadow-lg border border-slate-200 flex items-center gap-3 max-w-xs">
        {/* Icon */}
        <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Globe className="w-4 h-4 text-orange-600" />
        </div>
        
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">বাংলায় দেখুন?</p>
          <p className="text-xs text-slate-500">View in Bengali</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleSwitchToBengali}
            className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
          >
            হ্যাঁ
          </button>
          <button
            onClick={handleDismissPermanent}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
