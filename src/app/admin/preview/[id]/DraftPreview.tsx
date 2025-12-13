'use client';

import { useState } from 'react';
import { Check, X, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { publishMenu, discardDraft } from '@/app/actions/publish-menu';
import { publishRestaurant } from '@/app/actions/publish-restaurant';
import type { MenuItem, Restaurant } from '@/types';

interface PreviewProps {
  restaurant: Restaurant;
  draftItems: MenuItem[];
  liveItems: MenuItem[];
}

export default function DraftPreview({ restaurant, draftItems, liveItems }: PreviewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this menu live?')) return;
    
    setLoading(true);
    
    // Check if this is a new restaurant (exists in drafts but might not be fully live yet)
    // We can assume if liveItems is empty, it might be a new restaurant, or just a menu update.
    // For safety, we'll try to publish the restaurant metadata first if it's dynamic.
    
    // First try to publish restaurant metadata (if it's a new dynamic restaurant)
    const resRes = await publishRestaurant(restaurant.id);
    
    // Then publish menu
    const resMenu = await publishMenu(restaurant.id);
    
    if (resRes.success || resMenu.success) {
      alert('Published successfully!');
      router.push('/admin');
      router.refresh();
    } else {
      alert(`Failed: ${resRes.message} | ${resMenu.message}`);
      setLoading(false);
    }
  };

  const handleDiscard = async () => {
    if (!confirm('Are you sure you want to discard this draft? This action cannot be undone.')) return;

    setLoading(true);
    const res = await discardDraft(restaurant.id);
    if (res.success) {
      alert(res.message);
      router.push('/admin');
      router.refresh();
    } else {
      alert(res.message);
      setLoading(false);
    }
  };

  // Simple stats
  const addedCount = Math.max(0, draftItems.length - liveItems.length);
  const removedCount = Math.max(0, liveItems.length - draftItems.length);
  const isPriceChange = JSON.stringify(draftItems.map(i => i.price)) !== JSON.stringify(liveItems.map(i => i.price));
  const isNewRestaurant = liveItems.length === 0 && draftItems.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isNewRestaurant ? 'Activate New Restaurant' : 'Review Menu Update'}
            </h1>
            <p className="text-slate-500 font-medium">{restaurant.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDiscard}
            disabled={loading}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Discard
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {loading ? 'Publishing...' : (isNewRestaurant ? 'Activate Live' : 'Publish Changes')}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{draftItems.length}</p>
          <p className="text-xs text-slate-400 mt-1">Previous: {liveItems.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Changes Detected</p>
          <div className="flex gap-3 mt-2 flex-wrap">
             {isNewRestaurant && <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-md">New Restaurant</span>}
             {!isNewRestaurant && addedCount > 0 && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">+{addedCount} Items</span>}
             {!isNewRestaurant && removedCount > 0 && <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-md">-{removedCount} Items</span>}
             {!isNewRestaurant && isPriceChange && <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">Price Updates</span>}
             {!isNewRestaurant && addedCount === 0 && removedCount === 0 && !isPriceChange && <span className="text-xs font-bold text-slate-400">Content Updates</span>}
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            <div>
                <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Preview Mode</p>
                <p className="text-xs text-yellow-700 mt-1 font-medium">You are viewing the draft version. This content is not yet visible to customers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Preview Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Menu Preview</h3>
            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">Draft Version</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-900 font-bold uppercase text-xs border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Item Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-right">Price</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {draftItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{item.itemName}</td>
                            <td className="px-6 py-4">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{item.category}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.vegNonVeg === 'Veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.vegNonVeg}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900">₹{item.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
