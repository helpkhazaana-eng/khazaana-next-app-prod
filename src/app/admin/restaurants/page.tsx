import { getAllRestaurants } from '@/lib/restaurant-manager';
import RestaurantList from './RestaurantList';

export const metadata = {
  title: 'Manage Restaurants | Khazaana Admin',
};

export default async function RestaurantListPage() {
  const restaurants = await getAllRestaurants(true); // Include hidden ones

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Restaurants</h1>
          <p className="text-slate-500 font-medium mt-1">Manage restaurant partners, status, and visibility.</p>
        </div>
      </div>

      <RestaurantList restaurants={restaurants} />
    </div>
  );
}
