'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ChevronRight, Store, Utensils } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import type { SearchResult } from '@/lib/search';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300); // 300ms debounce
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
      // Disable body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.results);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Search error:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const handleResultClick = (url: string) => {
    onClose();
    router.push(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl"
        >
          <div className="container-custom h-full flex flex-col pt-4 md:pt-8">
            {/* Search Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4 md:pb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for 'Biryani', 'Cake', or restaurants..."
                  className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-lg font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                onClick={onClose}
                className="text-slate-500 font-bold hover:text-slate-900 transition-colors px-2"
              >
                Cancel
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto py-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-sm font-medium">Searching...</span>
                </div>
              ) : query.length > 0 && query.length < 2 ? (
                <div className="text-center text-slate-400 mt-10">
                  <p className="text-sm">Type at least 2 characters to search</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Top Results</p>
                  {results.map((result) => (
                    <m.button
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group text-left border border-transparent hover:border-slate-100"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${result.type === 'restaurant' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {result.type === 'restaurant' ? <Store className="w-6 h-6" /> : <Utensils className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">{result.title}</h4>
                        <p className="text-sm text-slate-500 truncate">{result.subtitle}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                    </m.button>
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No results found</h3>
                  <p className="text-slate-500">Try searching for something else like &quot;Biryani&quot; or &quot;Rolls&quot;</p>
                </div>
              ) : (
                // Empty State / Suggestions
                <div className="px-2">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Popular Cuisines</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Biryani', 'Rolls', 'Pizza', 'Burger', 'Chinese', 'Cake', 'Momos'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-4 py-2 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-transparent rounded-full text-sm font-bold text-slate-600 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
