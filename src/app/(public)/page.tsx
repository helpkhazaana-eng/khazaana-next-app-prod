import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
// Dynamic imports for below-the-fold components to reduce initial bundle size
const OffersSection = dynamic(() => import('@/components/home/OffersSection'), {
  loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl my-8 mx-4" />,
});
const FeaturedRestaurants = dynamic(() => import('@/components/home/FeaturedRestaurants'), {
  loading: () => <div className="h-96 bg-slate-50 animate-pulse rounded-xl my-8 mx-4" />,
});
const AboutSection = dynamic(() => import('@/components/home/AboutSection'));

import { getAdsByPlacement } from '@/data/ads';
import { getActiveOffers } from '@/lib/offer-manager';
import { getAllRestaurants } from '@/lib/restaurant-manager';
import { generateSEOTitle, generateSEODescription } from '@/lib/seo';

export const metadata: Metadata = {
  title: generateSEOTitle('Home'),
  description: generateSEODescription('Home'),
};

export default async function Home() {
  const heroAds = getAdsByPlacement('hero');
  const activeOffers = await getActiveOffers();
  const restaurants = await getAllRestaurants();

  return (
    <>
      <Hero heroAds={heroAds} />
      
      {activeOffers.length > 0 && (
        <OffersSection offers={activeOffers} />
      )}
      
      <FeaturedRestaurants restaurants={restaurants} />
      
      <AboutSection />
    </>
  );
}
