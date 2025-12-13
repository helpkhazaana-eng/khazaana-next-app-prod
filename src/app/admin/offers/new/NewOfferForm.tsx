'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Calendar, Truck, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import type { Restaurant } from '@/types';
import { createOffer } from '@/app/actions/manage-offers';

interface NewOfferPageProps {
  restaurants: Restaurant[];
}

export default function NewOfferForm({ restaurants }: NewOfferPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Calculate default dates
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const defaultEndDate = nextWeek.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    offerType: 'combo' as 'combo' | 'delivery',
    minOrderValue: '0',
    dishName: '',
    description: '',
    restaurantId: '',
    restaurantName: '',
    originalPrice: '',
    offerPrice: '',
    deliveryCharge: '0',
    startDate: today,
    endDate: defaultEndDate,
    vegNonVeg: 'Veg' as 'Veg' | 'Non-Veg',
    terms: 'Limited time offer. While stocks last.'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'restaurantId') {
      const selectedRestaurant = restaurants.find(r => r.id === value);
      setFormData(prev => ({
        ...prev,
        restaurantId: value,
        restaurantName: selectedRestaurant?.name || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      const result = await createOffer(data);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create offer');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/offers');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Exclusive Offer</h1>
        <p className="text-slate-500 font-medium mt-1">Set up a new promotional deal.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Offer created successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Offer Type</label>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, offerType: 'combo' }))}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                        formData.offerType === 'combo' 
                        ? 'border-orange-500 bg-orange-50 text-orange-600' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                >
                    <Tag className="w-5 h-5" />
                    Combo / Item Offer
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, offerType: 'delivery' }))}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                        formData.offerType === 'delivery' 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                >
                    <Truck className="w-5 h-5" />
                    Free Delivery
                </button>
            </div>
            <input type="hidden" name="offerType" value={formData.offerType} />
          </div>

          {/* Restaurant Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Select Restaurant</label>
            <select
              name="restaurantId"
              required
              value={formData.restaurantId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white"
            >
              <option value="">-- Choose a Restaurant --</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Offer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                {formData.offerType === 'combo' ? 'Offer Title / Dish Name' : 'Promotion Title'}
              </label>
              <input
                type="text"
                name="dishName"
                required
                value={formData.dishName}
                onChange={handleChange}
                placeholder={formData.offerType === 'combo' ? "e.g. Chicken Biryani Combo" : "e.g. Free Delivery Weekend"}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {formData.offerType === 'combo' && (
                <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Type</label>
                <select
                    name="vegNonVeg"
                    value={formData.vegNonVeg}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white"
                >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                </select>
                </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the offer..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* Conditional Fields based on Type */}
          {formData.offerType === 'combo' ? (
              /* COMBO PRICING */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Original Price (₹)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="number"
                    name="originalPrice"
                    required
                    min="0"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                </div>
                </div>

                <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Offer Price (₹)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="number"
                    name="offerPrice"
                    required
                    min="0"
                    value={formData.offerPrice}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                </div>
                </div>

                <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Delivery Charge (₹)</label>
                <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="number"
                    name="deliveryCharge"
                    required
                    min="0"
                    value={formData.deliveryCharge}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                </div>
                </div>
              </div>
          ) : (
              /* DELIVERY OFFER FIELDS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Minimum Order Value (₹)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                        type="number"
                        name="minOrderValue"
                        required
                        min="0"
                        value={formData.minOrderValue}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Order amount above which delivery is free.</p>
                  </div>
              </div>
          )}

          {/* Validity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Terms & Conditions</label>
            <input
              type="text"
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Offer...
                </>
              ) : (
                <>
                  <Tag className="w-5 h-5" />
                  Create Offer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
