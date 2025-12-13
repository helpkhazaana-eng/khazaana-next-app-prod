'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Restaurant } from '@/types';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';

interface FeaturedRestaurantsProps {
  restaurants: Restaurant[];
}

export default function FeaturedRestaurants({ restaurants }: FeaturedRestaurantsProps) {
  // Filter only featured or take top 3
  const displayRestaurants = restaurants.filter(r => r.featured).slice(0, 3);
  // If not enough featured, take top 3 by rating
  if (displayRestaurants.length < 3) {
    const remaining = 3 - displayRestaurants.length;
    const others = restaurants
      .filter(r => !r.featured)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, remaining);
    displayRestaurants.push(...others);
  }

  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6">
          <m.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Popular Restaurants</h2>
            <p className="text-slate-600 font-medium text-lg">Order from the most loved places in town</p>
          </m.div>
          
          <m.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link 
              href="/restaurants" 
              className="group flex items-center space-x-2 text-orange-600 hover:text-white hover:bg-orange-600 font-bold transition-all duration-300 bg-white px-6 py-3 rounded-full border border-orange-100 shadow-sm hover:shadow-lg hover:border-orange-600"
            >
              <span>View All Restaurants</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </m.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayRestaurants.map((restaurant, idx) => (
            <m.div 
              key={restaurant.id} 
              className="relative group block h-full w-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <m.span
                    className="absolute inset-0 h-full w-full bg-orange-50 block rounded-3xl shadow-xl shadow-orange-500/10 border border-orange-100"
                    layoutId="hoverBackground"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 0.15 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15, delay: 0.2 },
                    }}
                  />
                )}
              </AnimatePresence>
              <div className="relative z-20 h-full p-2 transform group-hover:-translate-y-1 transition-transform duration-300">
                <RestaurantCard restaurant={restaurant} />
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
