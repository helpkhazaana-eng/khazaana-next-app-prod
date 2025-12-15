'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Loader2, Download, Copy, Sparkles } from 'lucide-react';
import { restaurants } from '@/data/restaurants';
import { uploadMenuCSV } from '@/app/actions/upload-menu';

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


export default function UploadPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(LLM_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.csv')) {
        setStatus('error');
        setMessage('Please upload a valid .csv file');
        return;
      }
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedRestaurant) {
      setStatus('error');
      setMessage('Please select a restaurant and a file');
      return;
    }

    setStatus('uploading');
    setMessage('Processing menu items...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('restaurantId', selectedRestaurant);

    try {
      const result = await uploadMenuCSV(formData);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Menu updated successfully!');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setStatus('error');
        setMessage(result.message || 'Failed to update menu');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload Menu</h1>
        <p className="text-slate-500 font-medium mt-1">Update restaurant menus using CSV files</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Selection */}
          <div>
            <label htmlFor="restaurant" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Select Restaurant
            </label>
            <div className="relative">
                <select
                id="restaurant"
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-slate-50 text-base font-medium text-slate-900 appearance-none"
                required
                >
                <option value="">-- Choose a Restaurant --</option>
                {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                    {r.name}
                    </option>
                ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Menu CSV File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-200 border-dashed rounded-xl hover:border-orange-400 hover:bg-orange-50/30 transition-all bg-slate-50 group">
              <div className="space-y-2 text-center">
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                        <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-base text-slate-900 font-bold">{file.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="mt-3 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label
                        htmlFor="csv-upload"
                        className="relative cursor-pointer rounded-md font-bold text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                      >
                        <span>Upload a file</span>
                        <input 
                          id="csv-upload" 
                          name="csv-upload" 
                          type="file" 
                          className="sr-only" 
                          accept=".csv"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">CSV files only (max 5MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                CSV Format Requirements
            </h4>
            <ul className="list-disc list-inside text-xs text-blue-800 space-y-1 font-medium ml-1">
              <li>Headers: <strong>Item Name, Price (₹), Category, Veg/Non-Veg, Description</strong></li>
              <li>Price must be a number (no symbols)</li>
              <li>Veg/Non-Veg must be exactly &quot;Veg&quot; or &quot;Non-Veg&quot;</li>
            </ul>
            <a 
              href="/templates/menu-template.csv" 
              download="khazaana-menu-template.csv"
              className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3 h-3" />
              Download CSV Template
            </a>
          </div>

          {/* AI Menu Extraction Helper */}
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-5 rounded-xl border border-purple-100">
            <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Menu Extraction (ChatGPT / Claude)
            </h4>
            <p className="text-xs text-purple-700 mb-3">
              Have a menu PDF or image? Use this prompt with ChatGPT or Claude to extract menu data into Khazaana-compatible CSV format.
            </p>
            <div className="bg-white/70 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
              <pre className="text-[10px] text-purple-800 whitespace-pre-wrap font-mono leading-relaxed">{LLM_PROMPT}</pre>
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
                  <CheckCircle className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy Prompt
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {status !== 'idle' && (
            <div className={`p-4 rounded-xl flex items-center border ${
              status === 'success' ? 'bg-green-50 text-green-800 border-green-100' : 
              status === 'error' ? 'bg-red-50 text-red-800 border-red-100' : 
              'bg-slate-50 text-slate-800 border-slate-100'
            }`}>
              {status === 'success' && <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              {status === 'error' && <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              {status === 'uploading' && <Loader2 className="w-5 h-5 mr-3 animate-spin flex-shrink-0" />}
              <span className="text-sm font-bold">{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'uploading' || !file || !selectedRestaurant}
            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
              status === 'uploading' || !file || !selectedRestaurant
                ? 'bg-slate-300 cursor-not-allowed shadow-none transform-none'
                : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-orange-500/30'
            }`}
          >
            {status === 'uploading' ? 'Processing...' : 'Update Menu'}
          </button>
        </form>
      </div>
    </div>
  );
}
