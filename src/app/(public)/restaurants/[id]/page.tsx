import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRestaurantById, getAllRestaurants } from '@/lib/restaurant-manager';
import { getMenu, groupByCategory } from '@/lib/data-access';
import MenuItemCard from '@/components/menu/MenuItemCard';
import RestaurantHero from '@/components/restaurant/RestaurantHero';
import CategoryNav from '@/components/menu/CategoryNav';
import CategoryHeader from '@/components/menu/CategoryHeader';
import LanguagePrompt from '@/components/common/LanguagePrompt';
import RestaurantClosedBanner from '@/components/restaurant/RestaurantClosedBanner';
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

  // Check if restaurant is manually closed by admin
  const isRestaurantClosed = restaurant.isOpen === false;

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RestaurantHero restaurant={restaurant} />
      
      {/* Show closed banner if restaurant is manually closed */}
      {isRestaurantClosed && (
        <RestaurantClosedBanner restaurantName={restaurant.name} />
      )}
      
      {/* Language prompt for Bengali */}
      <LanguagePrompt />

      {/* Menu Section */}
      <div className="container-custom py-8 relative z-10">
        
        {/* Category Navigation (Sticky) */}
        <CategoryNav categories={categories} />

        {/* Menu Grid */}
        <div className="space-y-20">
          {categories.map((category) => (
            <div key={category} id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`} className="scroll-mt-40">
              <CategoryHeader category={category} itemCount={groupedMenu[category].length} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedMenu[category].map((item, index) => (
                  <MenuItemCard 
                    key={`${item.itemName}-${item.price}-${index}`} 
                    item={item} 
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    opensAt={restaurant.opensAt}
                    closesAt={restaurant.closesAt}
                    restaurantIsOpen={restaurant.isOpen !== false}
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
