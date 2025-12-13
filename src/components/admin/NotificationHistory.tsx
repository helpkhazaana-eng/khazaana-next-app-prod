'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Bell, Users, Hash, CheckCircle, XCircle, Search, Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type { NotificationLog } from '@/lib/googleSheets';
import { cn } from '@/lib/utils';

export default function NotificationHistory({ initialData }: { initialData: NotificationLog[] }) {
  const [logs, setLogs] = useState<NotificationLog[]>(initialData);
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed'>('all');
  
  // Basic filtering (in a real app, this should be server-side pagination/filtering)
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">History</h2>
            <p className="text-sm text-slate-500">Recent notifications</p>
          </div>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')}
            className={cn(
              "px-4 py-1.5 text-sm font-bold rounded-lg transition-all",
              filter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('sent')}
            className={cn(
              "px-4 py-1.5 text-sm font-bold rounded-lg transition-all",
              filter === 'sent' ? "bg-white text-green-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Sent
          </button>
          <button 
            onClick={() => setFilter('failed')}
            className={cn(
              "px-4 py-1.5 text-sm font-bold rounded-lg transition-all",
              filter === 'failed' ? "bg-white text-red-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Failed
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Content</th>
              <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Target</th>
              <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Sent At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">
                  No notifications found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    {log.status === 'sent' ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Sent
                        {(log.successCount || 0) > 0 && <span className="opacity-70">({log.successCount})</span>}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                        <XCircle className="w-3.5 h-3.5" />
                        Failed
                        {(log.failureCount || 0) > 0 && <span className="opacity-70">({log.failureCount})</span>}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 max-w-md">
                    <p className="font-bold text-slate-900">{log.title}</p>
                    <p className="text-sm text-slate-500 line-clamp-1">{log.body}</p>
                    {log.error && <p className="text-xs text-red-500 mt-1 line-clamp-1">{log.error}</p>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {log.target === 'all' && <Users className="w-4 h-4 text-slate-400" />}
                      {log.target === 'user' && <Users className="w-4 h-4 text-slate-400" />}
                      {log.target === 'topic' && <Hash className="w-4 h-4 text-slate-400" />}
                      <span className="capitalize">{log.target} {log.targetId ? `(${log.targetId})` : ''}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right text-sm text-slate-500">
                    <div className="flex items-center justify-end gap-2">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      {format(new Date(log.sentAt), 'MMM d, h:mm a')}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
