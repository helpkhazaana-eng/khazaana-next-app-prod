import { getAllOffers } from '@/lib/offer-manager';
import OffersList from './OffersList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const metadata = {
  title: 'Manage Offers | Khazaana Admin',
};

export default async function OffersListPage() {
  const offers = await getAllOffers();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Exclusive Offers</h1>
          <p className="text-slate-500 font-medium mt-1">Manage promotional campaigns and discounts.</p>
        </div>
        <Link 
            href="/admin/offers/new"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95"
        >
            <Plus className="w-5 h-5" />
            Create Offer
        </Link>
      </div>

      <OffersList offers={offers} />
    </div>
  );
}
