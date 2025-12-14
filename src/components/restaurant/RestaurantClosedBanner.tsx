'use client';

import { AlertTriangle } from 'lucide-react';

interface RestaurantClosedBannerProps {
  restaurantName: string;
}

export default function RestaurantClosedBanner({ restaurantName }: RestaurantClosedBannerProps) {
  return (
    <div className="container-custom py-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 text-sm mb-1">
              Restaurant Temporarily Closed
            </h3>
            <p className="text-red-700 text-xs">
              {restaurantName} is currently not accepting orders. Please check back later or browse other restaurants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
