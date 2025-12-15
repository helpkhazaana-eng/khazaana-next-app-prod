'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus, AlertCircle, CheckCircle2, Download, Copy, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { createRestaurant } from '@/app/actions/create-restaurant';

const LLM_PROMPT = `You are a menu data extraction assistant. I will provide you with a restaurant menu (image, PDF, or text). Extract all menu items and convert them into a CSV format with these exact headers:

Item Name,Price (₹),Category,Veg/Non-Veg,Description

Rules:
1. "Item Name" - The name of the dish exactly as shown
2. "Price (₹)" - Just the number, no currency symbols (e.g., 250 not ₹250)
3. "Category" - Group items logically (e.g., Starters, Main Course, Beverages, Desserts, etc.)
4. "Veg/Non-Veg" - Must be exactly "Veg" or "Non-Veg" based on ingredients
5. "Description" - Brief description if available, otherwise leave empty

Output ONLY the CSV data, starting with the header row. No explanations or markdown formatting.

Example output:
Item Name,Price (₹),Category,Veg/Non-Veg,Description
Butter Chicken,280,Main Course,Non-Veg,Creamy tomato curry with tender chicken
Paneer Tikka,220,Starters,Veg,Grilled cottage cheese with spices
Masala Dosa,80,South Indian,Veg,Crispy crepe with potato filling

Now extract the menu from the following:`;

export default function NewRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    variant: 'success' | 'error';
    title: string;
    message: string;
  }>({ isOpen: false, variant: 'success', title: '', message: '' });

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(LLM_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    category: 'Restaurant',
    cuisine: '', // Comma separated
    priceRange: '₹₹',
    costForTwo: 300,
    menuFile: null as File | null,
    priority: '' as string | number // Initialize priority
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, menuFile: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('address', formData.address);
      data.append('phone', formData.phone);
      data.append('category', formData.category);
      data.append('cuisine', formData.cuisine);
      data.append('priceRange', formData.priceRange);
      data.append('costForTwo', formData.costForTwo.toString());
      
      if (formData.menuFile) {
        data.append('menuFile', formData.menuFile);
      } else {
        throw new Error('Please upload a menu CSV file');
      }

      // Call server action
      const result = await createRestaurant(data);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create restaurant');
      }

      setModal({
        isOpen: true,
        variant: 'success',
        title: 'Restaurant Created!',
        message: 'The restaurant has been created successfully. Go to Dashboard to review and publish it.',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Add New Restaurant</h1>
        <p className="text-slate-500 font-medium mt-1">Onboard a new partner and upload their menu.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Restaurant Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Spice Garden"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Address</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Full street address"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Cafe">Cafe</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Bakery">Bakery</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Price Range</label>
              <select
                name="priceRange"
                value={formData.priceRange}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white"
              >
                <option value="₹">₹ (Affordable)</option>
                <option value="₹₹">₹₹ (Moderate)</option>
                <option value="₹₹₹">₹₹₹ (Premium)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cost for Two (₹)</label>
              <input
                type="number"
                name="costForTwo"
                required
                min="0"
                value={formData.costForTwo}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Priority (Optional)</label>
              <input
                type="number"
                name="priority"
                min="1"
                placeholder="1 = Highest"
                value={formData.priority || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Cuisines (Comma separated)</label>
            <input
              type="text"
              name="cuisine"
              required
              value={formData.cuisine}
              onChange={handleChange}
              placeholder="e.g. North Indian, Chinese, Mughlai"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-700">Upload Menu (CSV)</label>
            
            {/* CSV Format Info */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-800 font-medium mb-2">
                <strong>Required CSV Headers:</strong> Item Name, Price (₹), Category, Veg/Non-Veg, Description
              </p>
              <a 
                href="/templates/menu-template.csv" 
                download="khazaana-menu-template.csv"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download className="w-3 h-3" />
                Download CSV Template
              </a>
            </div>

            {/* AI Menu Extraction Helper */}
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-xl border border-purple-100">
              <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Menu Extraction
              </h4>
              <p className="text-xs text-purple-700 mb-3">
                Have a menu PDF or image? Copy this prompt and use it with ChatGPT or Claude to extract menu data.
              </p>
              <div className="bg-white/70 rounded-lg p-3 mb-3 max-h-24 overflow-y-auto">
                <pre className="text-[10px] text-purple-800 whitespace-pre-wrap font-mono leading-relaxed">{LLM_PROMPT.substring(0, 300)}...</pre>
              </div>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Full Prompt
                  </>
                )}
              </button>
            </div>

            {/* File Drop Zone */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {formData.menuFile ? formData.menuFile.name : 'Click to browse or drag file here'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Support CSV files only</p>
                </div>
              </div>
            </div>
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Restaurant
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          setModal(prev => ({ ...prev, isOpen: false }));
          router.push('/admin');
          router.refresh();
        }}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText="Go to Dashboard"
      />
    </div>
  );
}
