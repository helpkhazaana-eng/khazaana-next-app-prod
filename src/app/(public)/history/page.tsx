import type { Metadata } from 'next';
import OrderHistoryClient from '@/components/history/OrderHistoryClient';

export const metadata: Metadata = {
  title: 'Order History | Khazaana',
  description: 'View your past orders and track your food ordering history with Khazaana.',
};

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Order History</h1>
          <p className="text-gray-600">View your past orders</p>
        </div>

        {/* Warning about incognito mode */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div>
              <p className="font-semibold text-yellow-800 mb-1">Order History is Stored Locally</p>
              <p className="text-sm text-yellow-700">
                Your order history is saved in your browser. Do not use incognito mode or clear browser data 
                if you want to keep your order history. Orders are also saved in our system via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <OrderHistoryClient />
      </div>
    </main>
  );
}
