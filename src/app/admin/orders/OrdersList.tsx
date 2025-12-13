'use client';

import { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, FileText, CheckCircle2, Clock, AlertCircle, RefreshCw, Wand2 } from 'lucide-react';
import type { AdminOrder } from '@/lib/googleSheets';
import { useRouter } from 'next/navigation';
import { generateReceipt } from '@/app/actions/orders';

interface OrdersListProps {
  orders: AdminOrder[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  searchParams: {
    page?: string;
    status?: string;
    search?: string;
  };
}

export default function OrdersList({ orders, pagination, searchParams }: OrdersListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.status || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchQuery, page: '1' });
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    updateParams({ status: status === 'all' ? undefined : status, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const updateParams = (newParams: Record<string, string | undefined>) => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const handleGenerateReceipt = async (orderId: string) => {
    setGeneratingId(orderId);
    try {
      const res = await generateReceipt(orderId);
      if (res.success) {
        alert('Receipt generated and sent to customer!');
        router.refresh();
      } else {
        alert('Failed to generate receipt: ' + res.error);
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Customer, or Restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </form>
        
        <div className="flex gap-2 w-full md:w-auto items-center">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-medium text-slate-600 bg-white"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button 
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{order.orderId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.restaurantName}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ₹{order.totalPrice}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(order.orderTime).toLocaleDateString()}
                    <br />
                    {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.invoiceUrl ? (
                      <a 
                        href={order.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <FileText className="w-3 h-3" /> View Receipt
                      </a>
                    ) : (
                      <button
                        onClick={() => handleGenerateReceipt(order.orderId)}
                        disabled={generatingId === order.orderId}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 disabled:opacity-50"
                      >
                        {generatingId === order.orderId ? (
                          <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                        Generate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p>No orders found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing page <span className="font-bold">{pagination.page}</span> of <span className="font-bold">{pagination.pages}</span> ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
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

function OrderStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  
  if (s === 'delivered') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" /> Delivered
      </span>
    );
  }
  if (s === 'confirmed' || s === 'preparing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> {status}
      </span>
    );
  }
  if (s === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        <AlertCircle className="w-3 h-3" /> Cancelled
      </span>
    );
  }
  // Pending or others
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
      <Clock className="w-3 h-3" /> {status}
    </span>
  );
}
