'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import { getActiveAnnouncements } from '@/data/announcements';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<ReturnType<typeof getActiveAnnouncements>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnnouncements(getActiveAnnouncements());
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length, isPaused]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  if (announcements.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  return (
    <div 
      className="bg-orange-600 text-white relative border-b border-orange-500 z-40 h-10 flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full px-2 flex items-center justify-between gap-1.5">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className={`p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 !w-6 !h-6 flex items-center justify-center ${announcements.length <= 1 ? 'invisible' : ''}`}
          aria-label="Previous announcement"
          disabled={announcements.length <= 1}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Announcement Content */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div 
            className="flex items-center justify-center gap-2 max-w-full"
          >
            <Megaphone className="w-3.5 h-3.5 flex-shrink-0 text-white/90 hidden sm:block" />
            <p className="text-[11px] font-bold tracking-wide leading-none truncate">
              {announcements[currentIndex]?.message}
            </p>
            {announcements[currentIndex]?.link && announcements[currentIndex]?.linkText && (
              <Link
                href={announcements[currentIndex].link}
                className="flex-shrink-0 bg-white text-orange-600 text-[10px] font-extrabold px-2.5 h-5 flex items-center justify-center rounded-full hover:bg-orange-50 transition-colors whitespace-nowrap shadow-sm !min-w-0"
              >
                {announcements[currentIndex].linkText}
              </Link>
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className={`p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 !w-6 !h-6 flex items-center justify-center ${announcements.length <= 1 ? 'invisible' : ''}`}
          aria-label="Next announcement"
          disabled={announcements.length <= 1}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
