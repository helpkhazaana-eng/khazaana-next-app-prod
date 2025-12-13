import { notFound } from 'next/navigation';
import { getRestaurantById } from '@/lib/restaurant-manager';
import { getMenu } from '@/lib/data-access';
import DraftPreview from './DraftPreview';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  // Fetch both live and draft menus for comparison
  const draftItems = await getMenu(id, 'draft');
  const liveItems = await getMenu(id, 'live');

  // If it's a new restaurant (no live menu) AND has draft items, it's a valid state for "New Restaurant" preview.
  // If it's an existing restaurant, check if draft differs or exists.
  
  if (draftItems.length === 0) {
    return (
        <div className="max-w-2xl mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Draft Found</h2>
            <p className="text-slate-500 mb-6">There is no pending draft for this restaurant.</p>
            <a href="/admin" className="text-orange-600 font-bold hover:underline">Return to Dashboard</a>
        </div>
    );
  }

  return (
    <DraftPreview 
        restaurant={restaurant} 
        draftItems={draftItems} 
        liveItems={liveItems} 
    />
  );
}
