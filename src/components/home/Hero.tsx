'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, ArrowRight, MapPin } from 'lucide-react';
import type { Ad } from '@/types';
import { isFestivePeriod } from '@/components/common/FestiveTheme';
import { useEffect, useState } from 'react';

interface HeroProps {
  heroAds: Ad[];
}

export default function Hero({ heroAds }: HeroProps) {
  const [isFestive, setIsFestive] = useState(false);

  useEffect(() => {
    setIsFestive(isFestivePeriod());
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white min-h-[calc(100vh-80px)] flex items-center py-12 md:py-20 lg:py-24">
      {/* Background Gradients/Pattern - Fresh & Light */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Warm Gradient Blobs - Static for LCP optimization */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl mix-blend-multiply pointer-events-none opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100 rounded-full blur-3xl mix-blend-multiply pointer-events-none opacity-50" />
      
      <div className="container-custom relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left w-full">
            {/* Status Chip - No entry animation for LCP */}
            <div 
              className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-orange-100/50 rounded-full px-5 py-2 mb-8 shadow-sm hover:shadow-md transition-all hover:bg-white relative group"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <span className="text-orange-700 text-sm font-bold tracking-wide uppercase">Serving Aurangabad</span>
              {isFestive && (
                <span className="absolute -top-3 -right-2 text-xl pointer-events-none animate-bounce">
                  🎅
                </span>
              )}
            </div>
            
            {/* H1 Headline - Static for LCP */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1] sm:leading-[1.1]">
              Delicious Food, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 pb-2 relative">
                Delivered Fast.
                {isFestive && (
                  <span className="absolute -top-1 -right-8 text-4xl hidden lg:inline-block animate-bounce">🎁</span>
                )}
              </span>
            </h1>
            
            {/* Subtext */}
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Order from top restaurants in Aurangabad. Fresh, hot, and hygienic food delivered to your doorstep in minutes.
            </p>
            
            {/* CTA Buttons - No animation for LCP */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-10">
              <Link href="/restaurants" className="w-full sm:w-auto">
                <button className={`w-full sm:w-auto px-8 py-4 ${isFestive ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-orange-600'} text-white font-bold text-lg rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95 duration-200`}>
                  Order Food Now
                  <ArrowRight className="w-5 h-5" />
                  {isFestive && <span>❄️</span>}
                </button>
              </Link>
              
              <a href="tel:+918695902696" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-1 active:scale-95 duration-200">
                  <Phone className="w-5 h-5 text-orange-500" />
                  Call to Order
                </button>
              </a>
            </div>

            {/* Trust Indicators - No animation for LCP */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center lg:justify-start gap-10">
                <div className="text-center lg:text-left">
                    <p className="text-3xl font-extrabold text-slate-900">5+</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Partners</p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="text-center lg:text-left">
                    <p className="text-3xl font-extrabold text-slate-900">30m</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Avg Time</p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="text-center lg:text-left">
                    <p className="text-3xl font-extrabold text-slate-900">100+</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Happy Users</p>
                </div>
            </div>
          </div>
          
          {/* Hero Image - Light & Clean - No entry animation for LCP */}
          <div 
            className="flex-1 w-full max-w-xl lg:max-w-none mt-10 lg:mt-0 relative px-4 sm:px-0"
          >
             <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white border-[6px] border-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-100">
                 {/* Abstract Food Pattern/Gradient since we might not have ad images always */}
                 <div className="absolute inset-0 bg-orange-50/50"></div>
                 
                 {heroAds.length > 0 ? (
                    <Image 
                        src={heroAds[0].imageUrl} 
                        alt="Delicious Food"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    />
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
                        <div className="text-center p-8">
                            <span className="text-8xl animate-bounce inline-block">🥘</span>
                            <p className="text-slate-600 font-bold mt-8 tracking-widest text-xl uppercase">Fresh Food</p>
                        </div>
                    </div>
                 )}
                 
                 {/* Floating Card - No animation for LCP */}
                 <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm shrink-0">
                            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm sm:text-base truncate">Delivering to</p>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">Aurangabad & nearby areas</p>
                        </div>
                    </div>
                 </div>

                 {/* Festive Overlay on Image */}
                 {isFestive && (
                    <div className="absolute top-4 right-4 text-4xl animate-pulse pointer-events-none drop-shadow-lg">
                      🌟
                    </div>
                 )}
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
