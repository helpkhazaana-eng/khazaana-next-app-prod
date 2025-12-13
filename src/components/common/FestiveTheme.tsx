'use client';

import { useEffect, useState, useMemo } from 'react';

// Festive period configuration
const FESTIVE_END_DATE = new Date('2026-01-05T23:30:00+05:30'); // Jan 5, 2026 23:30 IST

// Check if we're in the festive period
export function isFestivePeriod(): boolean {
  const now = new Date();
  return now < FESTIVE_END_DATE;
}

// CSS-only Snowflake component - no framer-motion to reduce bundle size
function Snowflake({ delay, duration, left, size }: { delay: number; duration: number; left: number; size: number }) {
  return (
    <div
      className="fixed pointer-events-none z-50 animate-snowfall"
      style={{ 
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      <div 
        className="rounded-full bg-white blur-[1px]"
        style={{ 
          width: size, 
          height: size,
          boxShadow: '0 0 4px rgba(255,255,255,0.8)'
        }} 
      />
    </div>
  );
}

export default function FestiveTheme() {
  const [showFestive, setShowFestive] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Generate fewer snowflakes for performance
  const snowflakes = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
      left: Math.random() * 100,
      size: 2 + Math.random() * 2
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
    setShowFestive(isFestivePeriod());
  }, []);

  if (!mounted || !showFestive) return null;

  return (
    <>
      {/* CSS Keyframe Animation for snowfall */}
      <style jsx>{`
        @keyframes snowfall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-snowfall {
          animation: snowfall linear infinite;
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map((flake) => (
          <Snowflake
            key={flake.id}
            delay={flake.delay}
            duration={flake.duration}
            left={flake.left}
            size={flake.size}
          />
        ))}
      </div>
    </>
  );
}
