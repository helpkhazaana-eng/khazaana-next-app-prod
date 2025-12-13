import type { Metadata } from 'next';
import { getAllRestaurants } from '@/lib/restaurant-manager';
import RestaurantCard from '@/components/restaurant/RestaurantCard';

export const metadata: Metadata = {
  title: 'Restaurants | Khazaana',
  description: 'Browse top restaurants in Aurangabad, West Bengal. Order food online for delivery.',
};

export default async function RestaurantsPage() {
  const restaurants = await getAllRestaurants();

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />
      
      <div className="container-custom py-12 md:py-16 relative z-10">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">All Restaurants</h1>
          <p className="text-slate-500 text-lg font-medium">
            Discover the best food in Aurangabad. From local favorites to popular chains, we have it all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="h-full">
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
