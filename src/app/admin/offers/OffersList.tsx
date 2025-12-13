'use client';

import { useState, useMemo } from 'react';
import { Edit, Trash2, PlayCircle, Archive, Plus, Truck, UtensilsCrossed, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { deleteOffer, toggleOfferStatus } from '@/app/actions/manage-offers';
import type { ExclusiveOffer } from '@/data/offers';
import Link from 'next/link';

interface OffersListProps {
  offers: ExclusiveOffer[];
}

export default function OffersList({ offers }: OffersListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'combo' | 'delivery'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and Sort Logic
  const filteredOffers = useMemo(() => {
    return offers
      .filter(offer => {
        const matchesSearch = 
          offer.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.restaurantName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = 
          statusFilter === 'all' ? true : 
          statusFilter === 'active' ? offer.isActive : !offer.isActive;

        const matchesType = 
          typeFilter === 'all' ? true : 
          offer.offerType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // Descending by Date
  }, [offers, searchQuery, statusFilter, typeFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    setLoadingId(id);
    try {
      const res = await deleteOffer(id);
      if (!res.success) alert(res.message);
    } catch (error) {
      alert('Failed to delete offer');
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      const res = await toggleOfferStatus(id, !currentStatus);
      if (!res.success) alert(res.message);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search offers or restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-medium text-slate-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-medium text-slate-600"
          >
            <option value="all">All Types</option>
            <option value="combo">Combos</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Offer</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900">{offer.dishName}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{offer.description}</p>
                      <div className="flex gap-2 mt-1">
                          {offer.offerType === 'combo' ? (
                              <>
                                  <span className="text-xs font-bold text-slate-400 line-through">₹{offer.originalPrice}</span>
                                  <span className="text-xs font-bold text-orange-600">₹{offer.offerPrice}</span>
                                  {offer.discountPercent && (
                                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{offer.discountPercent}% OFF</span>
                                  )}
                              </>
                          ) : (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  Free Delivery {'>'} ₹{offer.minOrderValue}
                              </span>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      {offer.offerType === 'combo' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                              <UtensilsCrossed className="w-3 h-3" /> Combo
                          </span>
                      ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                              <Truck className="w-3 h-3" /> Delivery
                          </span>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                      {offer.restaurantName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge isActive={offer.isActive} />
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                    {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                          onClick={() => handleToggleStatus(offer.id, offer.isActive)}
                          disabled={loadingId === offer.id}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${offer.isActive ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200' : 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200'}`}
                      >
                          {offer.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                          onClick={() => handleDelete(offer.id)}
                          disabled={loadingId === offer.id}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                      >
                          Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedOffers.length === 0 && (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          No offers found matching your filters.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredOffers.length)}</span> of <span className="font-bold">{filteredOffers.length}</span> offers
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
        Inactive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
      Active
    </span>
  );
}
