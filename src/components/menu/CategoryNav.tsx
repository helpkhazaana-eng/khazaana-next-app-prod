'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translateCategory } from '@/lib/translations';

interface CategoryNavProps {
  categories: string[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const { language } = useLanguage();
  
  return (
    <div className="sticky top-[60px] md:top-[80px] z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 mb-8 border-b border-slate-100 shadow-sm">
      {/* Scroll Fade Masks */}
      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden"></div>
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
      
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide py-1 px-1 scroll-smooth">
        {categories.map((category) => {
          const displayCategory = language === 'bn' ? translateCategory(category) : category;
          return (
            <a 
              key={category}
              href={`#category-${category.replace(/\s+/g, '-').toLowerCase()}`}
              className="category-tab shrink-0 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-700 whitespace-nowrap transition-all hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20 active:scale-95 shadow-sm"
            >
              {displayCategory || category}
            </a>
          );
        })}
      </div>
    </div>
  );
}
