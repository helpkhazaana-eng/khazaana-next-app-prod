import type { Metadata } from 'next';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import { getAllRestaurants } from '@/lib/restaurant-manager';
import { getSystemConfig } from '@/lib/system-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout | Khazaana',
  description: 'Complete your order and get delicious food delivered to your doorstep.',
};

export default async function CheckoutPage() {
  const [restaurants, systemConfig] = await Promise.all([
    getAllRestaurants(),
    getSystemConfig()
  ]);
  
  // Create a map of restaurant open status for client-side lookup
  const restaurantOpenStatus: Record<string, boolean> = {};
  restaurants.forEach(r => {
    // Restaurant is open if: isOpen !== false (undefined means auto/open)
    restaurantOpenStatus[r.id] = r.isOpen !== false;
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order details</p>
        </div>
        <CheckoutClient 
          restaurantOpenStatus={restaurantOpenStatus}
          globalOverride={systemConfig.globalOverride}
          systemPhone={systemConfig.whatsappOrderNumber}
        />
      </div>
    </main>
  );
}
