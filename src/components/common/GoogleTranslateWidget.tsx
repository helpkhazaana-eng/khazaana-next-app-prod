'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

interface GoogleTranslateWidgetProps {
  isMobile?: boolean;
}

export default function GoogleTranslateWidget({ isMobile = false }: GoogleTranslateWidgetProps) {
  const initializedRef = useRef(false);
  const widgetId = isMobile ? 'google_translate_element_mobile' : 'google_translate_element';

  useEffect(() => {
    // If already initialized, just return
    if (initializedRef.current) return;

    // Define the init function globally if not exists
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function() {
        // We need to try/catch because sometimes the element might not be ready
        try {
          const config = {
            pageLanguage: 'en',
            includedLanguages: 'en,bn',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          };

          // Initialize desktop widget if element exists
          if (document.getElementById('google_translate_element')) {
            new window.google.translate.TranslateElement(config, 'google_translate_element');
          }

          // Initialize mobile widget if element exists
          if (document.getElementById('google_translate_element_mobile')) {
            new window.google.translate.TranslateElement(config, 'google_translate_element_mobile');
          }
        } catch (e) {
          console.error('Google Translate Init Error:', e);
        }
      };
    }

    // Check if script is already present
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      // If script loaded but widget not initialized (e.g. navigation)
      window.googleTranslateElementInit();
    }

    initializedRef.current = true;
  }, [widgetId]);

  return (
    <div 
      id={widgetId} 
      className={isMobile ? "translate-widget-mobile scale-75 origin-right" : "translate-widget"}
      style={{ minWidth: isMobile ? 'auto' : '120px', minHeight: '24px' }}
    />
  );
}
