'use client';

import { useState, useMemo } from 'react';
import { MoreHorizontal, Edit, Trash2, Archive, PlayCircle, Eye, AlertCircle, Save, X, Search, ChevronLeft, ChevronRight, Power, PowerOff } from 'lucide-react';
import { updateRestaurantStatus } from '@/app/actions/update-restaurant-status';
import { updateRestaurantPriority } from '@/app/actions/update-restaurant-priority';
import { toggleRestaurantOpenAction } from '@/app/actions/restaurant';
import { deleteRestaurant } from '@/app/actions/delete-restaurant';
import type { Restaurant } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [priorityUpdates, setPriorityUpdates] = useState<Record<string, number>>({});
  
  // Search, Filter, Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'archived' | 'deleted'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  // Delete confirmation state (double confirmation)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    step: 0 | 1 | 2;
    restaurantId: string | null;
    restaurantName: string;
  }>({ step: 0, restaurantId: null, restaurantName: '' });

  const showModal = (type: 'success' | 'error' | 'confirm' | 'info', title: string, message: string, onConfirm?: () => void) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Filter and Sort Logic
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter(restaurant => {
        const matchesSearch = 
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = 
          statusFilter === 'all' ? true : 
          (restaurant.adminStatus || 'live') === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Sort by Priority (Ascending) then Name
        const pA = a.priority || 9999;
        const pB = b.priority || 9999;
        if (pA !== pB) return pA - pB;
        return a.name.localeCompare(b.name);
      });
  }, [restaurants, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (id: string, status: 'live' | 'archived' | 'deleted') => {
    setLoadingId(id);
    try {
      const res = await updateRestaurantStatus(id, status);
      if (res.success) {
        showModal('success', 'Status Updated', res.message || `Restaurant status changed to ${status}`);
      } else {
        showModal('error', 'Update Failed', res.message || 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      showModal('error', 'Error', 'Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  // Handle delete with double confirmation
  const initiateDelete = (id: string, name: string) => {
    setDeleteConfirm({ step: 1, restaurantId: id, restaurantName: name });
  };

  const confirmDeleteStep1 = () => {
    setDeleteConfirm(prev => ({ ...prev, step: 2 }));
  };

  const confirmDeleteStep2 = async () => {
    if (!deleteConfirm.restaurantId) return;
    
    setLoadingId(deleteConfirm.restaurantId);
    setDeleteConfirm({ step: 0, restaurantId: null, restaurantName: '' });
    
    try {
      const res = await deleteRestaurant(deleteConfirm.restaurantId);
      if (res.success) {
        showModal('success', 'Restaurant Deleted', res.message || 'Restaurant has been permanently deleted');
        // Redirect to admin dashboard after delete
        router.push('/admin');
      } else {
        showModal('error', 'Delete Failed', res.message || 'Failed to delete restaurant');
      }
    } catch (error) {
      console.error(error);
      showModal('error', 'Error', 'Failed to delete restaurant');
    } finally {
      setLoadingId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ step: 0, restaurantId: null, restaurantName: '' });
  };

  const handlePriorityChange = (id: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      setPriorityUpdates(prev => ({ ...prev, [id]: num }));
    }
  };

  const savePriority = async (id: string) => {
    const priority = priorityUpdates[id];
    if (priority === undefined) return;

    setLoadingId(id);
    try {
      const res = await updateRestaurantPriority(id, priority);
      if (res.success) {
        setPriorityUpdates(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        showModal('success', 'Priority Updated', res.message || 'Priority saved successfully');
      } else {
        showModal('error', 'Update Failed', res.message || 'Failed to update priority');
      }
    } catch (error) {
      console.error(error);
      showModal('error', 'Error', 'Failed to update priority');
    } finally {
      setLoadingId(null);
    }
  };

  const removePriority = async (id: string) => {
    showModal('confirm', 'Remove Priority', 'Remove priority from this restaurant?', async () => {
      closeModal();
      setLoadingId(id);
      try {
        const res = await updateRestaurantPriority(id, null);
        if (res.success) {
          setPriorityUpdates(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
          showModal('success', 'Priority Removed', res.message || 'Priority removed successfully');
        } else {
          showModal('error', 'Update Failed', res.message || 'Failed to remove priority');
        }
      } catch (error) {
        console.error(error);
        showModal('error', 'Error', 'Failed to remove priority');
      } finally {
        setLoadingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search restaurants..."
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
            <option value="live">Live</option>
            <option value="archived">Archived</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* Restaurant Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4 w-32">Priority</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Admin Status</th>
                <th className="px-6 py-4">Open/Close</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        className="w-12 px-2 py-1 border border-slate-200 rounded-lg text-sm font-bold text-center focus:border-orange-500 outline-none"
                        value={priorityUpdates[restaurant.id] !== undefined ? priorityUpdates[restaurant.id] : (restaurant.priority || '')}
                        onChange={(e) => handlePriorityChange(restaurant.id, e.target.value)}
                        placeholder="-"
                      />
                      
                      {/* Save Button */}
                      {priorityUpdates[restaurant.id] !== undefined && priorityUpdates[restaurant.id] !== restaurant.priority && (
                        <button
                          onClick={() => savePriority(restaurant.id)}
                          disabled={loadingId === restaurant.id}
                          className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                          title="Save Priority"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      )}

                      {/* Remove Priority Button */}
                      {restaurant.priority && priorityUpdates[restaurant.id] === undefined && (
                          <button
                              onClick={() => removePriority(restaurant.id)}
                              disabled={loadingId === restaurant.id}
                              className="px-2 py-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors uppercase tracking-wide"
                              title="Remove Priority"
                          >
                              Clear
                          </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
                        {restaurant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{restaurant.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{restaurant.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={restaurant.adminStatus || 'live'} />
                  </td>
                  <td className="px-6 py-4">
                    <OpenCloseToggle 
                      restaurantId={restaurant.id} 
                      isOpen={restaurant.isOpen !== false} 
                      loading={loadingId === restaurant.id}
                      onToggle={async (id, open) => {
                        setLoadingId(id);
                        try {
                          const res = await toggleRestaurantOpenAction(id, open);
                          if (res.success) {
                            showModal('success', 'Status Updated', res.message || `Restaurant is now ${open ? 'OPEN' : 'CLOSED'}`);
                          } else {
                            showModal('error', 'Update Failed', res.message || 'Failed to toggle status');
                          }
                        } catch (e) {
                          showModal('error', 'Error', 'Failed to toggle status');
                        } finally {
                          setLoadingId(null);
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                      {restaurant.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {restaurant.phone}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Link
                          href={`/restaurants/${restaurant.id}`}
                          target="_blank"
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      >
                          View
                      </Link>
                      
                      <Link
                          href={`/admin/preview/${restaurant.id}`}
                          className="px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                      >
                          Edit
                      </Link>

                      {restaurant.adminStatus !== 'live' && (
                          <button
                              onClick={() => handleStatusChange(restaurant.id, 'live')}
                              disabled={loadingId === restaurant.id}
                              className="px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                          >
                              Set Live
                          </button>
                      )}

                      {(restaurant.adminStatus === 'live' || !restaurant.adminStatus) && (
                          <button
                              onClick={() => handleStatusChange(restaurant.id, 'archived')}
                              disabled={loadingId === restaurant.id}
                              className="px-3 py-1.5 text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors border border-yellow-200"
                          >
                              Archive
                          </button>
                      )}

                      {restaurant.adminStatus !== 'deleted' && (
                          <button
                              onClick={() => initiateDelete(restaurant.id, restaurant.name)}
                              disabled={loadingId === restaurant.id}
                              className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                          >
                              Delete
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedRestaurants.length === 0 && (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          No restaurants found matching your filters.
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
              Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredRestaurants.length)}</span> of <span className="font-bold">{filteredRestaurants.length}</span> restaurants
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

      {/* Modal for alerts */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        variant={modal.type}
        onConfirm={modal.onConfirm}
      >
        <p>{modal.message}</p>
      </Modal>

      {/* Delete Confirmation Step 1 */}
      <Modal
        isOpen={deleteConfirm.step === 1}
        onClose={cancelDelete}
        title="Delete Restaurant?"
        variant="confirm"
        onConfirm={confirmDeleteStep1}
        confirmText="Yes, Continue"
      >
        <p className="text-slate-600">
          Are you sure you want to delete <strong>{deleteConfirm.restaurantName}</strong>?
        </p>
        <p className="text-sm text-red-600 mt-2">
          This will permanently remove the restaurant and all its menu data.
        </p>
      </Modal>

      {/* Delete Confirmation Step 2 - Final */}
      <Modal
        isOpen={deleteConfirm.step === 2}
        onClose={cancelDelete}
        title="⚠️ Final Confirmation"
        variant="error"
        onConfirm={confirmDeleteStep2}
        confirmText="DELETE PERMANENTLY"
      >
        <p className="text-slate-600">
          This is your <strong>FINAL WARNING</strong>. Deleting <strong>{deleteConfirm.restaurantName}</strong> cannot be undone.
        </p>
        <p className="text-sm text-red-600 mt-2 font-bold">
          All restaurant data and menus will be permanently lost.
        </p>
      </Modal>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'deleted') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Deleted
      </span>
    );
  }
  if (status === 'archived') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
        Archived
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
      Live
    </span>
  );
}

function OpenCloseToggle({ 
  restaurantId, 
  isOpen, 
  loading, 
  onToggle 
}: { 
  restaurantId: string; 
  isOpen: boolean; 
  loading: boolean;
  onToggle: (id: string, open: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(restaurantId, !isOpen)}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
        isOpen
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isOpen ? (
        <>
          <Power className="w-3.5 h-3.5" />
          Open
        </>
      ) : (
        <>
          <PowerOff className="w-3.5 h-3.5" />
          Closed
        </>
      )}
    </button>
  );
}
