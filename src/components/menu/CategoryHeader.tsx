'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translateCategory } from '@/lib/translations';

interface CategoryHeaderProps {
  category: string;
  itemCount: number;
}

export default function CategoryHeader({ category, itemCount }: CategoryHeaderProps) {
  const { language } = useLanguage();
  
  const displayCategory = language === 'bn' ? translateCategory(category) : category;
  const itemsText = language === 'bn' ? 'আইটেম' : 'items';
  
  return (
    <div className="flex items-center mb-8">
      <div className="w-1.5 h-8 bg-orange-500 rounded-full mr-4 shadow-sm"></div>
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
        {displayCategory}
      </h2>
      <span className="ml-4 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        {itemCount} {itemsText}
      </span>
    </div>
  );
}
