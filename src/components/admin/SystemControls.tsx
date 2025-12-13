'use client';

import { useState } from 'react';
import { Smartphone, Power, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updateSystemPhone, updateGlobalStatus } from '@/app/actions/system-config';
import type { SystemConfig } from '@/lib/system-config';

interface SystemControlsProps {
  initialConfig: SystemConfig;
}

export default function SystemControls({ initialConfig }: SystemControlsProps) {
  const [phone, setPhone] = useState(initialConfig.whatsappOrderNumber);
  const [status, setStatus] = useState(initialConfig.globalOverride);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePhoneUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPhone(true);
    setMessage(null);

    try {
      const result = await updateSystemPhone(phone);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update phone number' });
    } finally {
      setLoadingPhone(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'open' | 'closed' | 'auto') => {
    if (newStatus === status) return;
    setLoadingStatus(true);
    setMessage(null);

    try {
      const result = await updateGlobalStatus(newStatus);
      if (result.success) {
        setStatus(newStatus);
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
          <Power className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Controls</h2>
          <p className="text-sm text-slate-500 font-medium">Global settings for the application</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* WhatsApp Number Control */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
            WhatsApp Order Number
          </label>
          <form onSubmit={handlePhoneUpdate} className="flex gap-2">
            <div className="relative flex-1">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium text-slate-900"
                placeholder="91XXXXXXXXXX"
              />
            </div>
            <button
              type="submit"
              disabled={loadingPhone}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 rounded-xl font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingPhone ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
          </form>
          <p className="text-xs text-slate-500 font-medium">
            This number receives all WhatsApp order messages. Format: Country code + Number (no + symbol).
          </p>
        </div>

        {/* Global Status Control */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
            Global Restaurant Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStatusUpdate('auto')}
              disabled={loadingStatus}
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border ${
                status === 'auto'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              Auto (Timer)
            </button>
            <button
              onClick={() => handleStatusUpdate('open')}
              disabled={loadingStatus}
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border ${
                status === 'open'
                  ? 'bg-green-50 text-green-700 border-green-200 ring-2 ring-green-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              Force OPEN
            </button>
            <button
              onClick={() => handleStatusUpdate('closed')}
              disabled={loadingStatus}
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border ${
                status === 'closed'
                  ? 'bg-red-50 text-red-700 border-red-200 ring-2 ring-red-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              Force CLOSED
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            <span className="font-bold">Auto:</span> Follows opening/closing times. <span className="font-bold">Force:</span> Overrides all timers immediately (Emergency).
          </p>
        </div>
      </div>
    </div>
  );
}
