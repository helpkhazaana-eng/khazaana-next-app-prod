import { MetadataRoute } from 'next';
import { getAllRestaurants } from '@/lib/restaurant-manager';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khazaana.co.in';
  const currentDate = new Date().toISOString();

  // Static routes
  const routes = [
    '',
    '/restaurants',
    '/about',
    '/terms',
    '/history',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic restaurant routes
  const restaurants = await getAllRestaurants(false); // Only live
  const restaurantRoutes = restaurants.map((restaurant) => ({
    url: `${siteUrl}/restaurants/${restaurant.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...restaurantRoutes];
}
