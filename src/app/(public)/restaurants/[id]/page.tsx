import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRestaurantById, getAllRestaurants } from '@/lib/restaurant-manager';
import { getMenu, groupByCategory } from '@/lib/data-access';
import MenuItemCard from '@/components/menu/MenuItemCard';
import RestaurantHero from '@/components/restaurant/RestaurantHero';
import { generateRestaurantSchema } from '@/lib/seo';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const restaurants = await getAllRestaurants();
  return restaurants.map((restaurant) => ({
    id: restaurant.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);

  if (!restaurant || (restaurant.adminStatus && restaurant.adminStatus !== 'live')) {
    return {
      title: 'Restaurant Not Found | Khazaana',
    };
  }

  return {
    title: `${restaurant.name} Menu | Khazaana`,
    description: `Order food online from ${restaurant.name} in Aurangabad. View menu, prices, and timings.`,
  };
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);

  if (!restaurant || (restaurant.adminStatus && restaurant.adminStatus !== 'live')) {
    notFound();
  }

  // Load menu from JSON
  const menuItems = await getMenu(restaurant.id);
  const groupedMenu = groupByCategory(menuItems);
  const categories = Object.keys(groupedMenu);

  // Generate Structured Data
  const jsonLd = generateRestaurantSchema(restaurant);

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RestaurantHero restaurant={restaurant} />

      {/* Menu Section */}
      <div className="container-custom py-8 relative z-10">
        
        {/* Category Navigation (Sticky) */}
        <div className="sticky top-[60px] md:top-[80px] z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 mb-8 border-b border-slate-100 shadow-sm">
          {/* Scroll Fade Masks */}
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden"></div>
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
          
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide py-1 px-1 scroll-smooth">
            {categories.map((category) => (
              <a 
                key={category}
                href={`#category-${category.replace(/\s+/g, '-').toLowerCase()}`}
                className="category-tab shrink-0 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-700 whitespace-nowrap transition-all hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 active:scale-95 shadow-sm"
              >
                {category}
              </a>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="space-y-20">
          {categories.map((category) => (
            <div key={category} id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`} className="scroll-mt-40">
              <div className="flex items-center mb-8">
                <div className="w-1.5 h-8 bg-orange-500 rounded-full mr-4 shadow-sm"></div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {category}
                </h2>
                <span className="ml-4 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {groupedMenu[category].length} items
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedMenu[category].map((item, index) => (
                  <MenuItemCard 
                    key={`${item.itemName}-${item.price}-${index}`} 
                    item={item} 
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    opensAt={restaurant.opensAt}
                    closesAt={restaurant.closesAt}
                    index={index} // Pass index for staggered animation
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
