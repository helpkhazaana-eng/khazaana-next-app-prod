'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Send, Users, Bell, Loader2, CheckCircle2, AlertTriangle, Hash } from 'lucide-react';
import { sendPushNotification, type SendNotificationState } from '@/app/actions/send-notification';
import { cn } from '@/lib/utils';

const initialState: SendNotificationState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          Send Notification
        </>
      )}
    </button>
  );
}

export default function NotificationSender() {
  const [target, setTarget] = useState<'all' | 'user' | 'topic'>('all');
  const [state, formAction] = useActionState(sendPushNotification, initialState);
  const [key, setKey] = useState(0); // To reset form on success

  useEffect(() => {
    if (state.success) {
      setKey(prev => prev + 1); // Reset form
      // Reset target to default
      setTarget('all');
    }
  }, [state.success]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Send Notification</h2>
          <p className="text-sm text-slate-500">Push updates to users</p>
        </div>
      </div>

      <form action={formAction} key={key} className="space-y-5">
        {/* Target Selection */}
        <div className="grid grid-cols-3 gap-3">
          <label className={cn(
            "cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all",
            target === 'all' ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          )}>
            <input 
              type="radio" 
              name="target" 
              value="all" 
              className="hidden" 
              checked={target === 'all'}
              onChange={() => setTarget('all')}
            />
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold">All Users</span>
          </label>

          <label className={cn(
            "cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all",
            target === 'topic' ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          )}>
            <input 
              type="radio" 
              name="target" 
              value="topic" 
              className="hidden" 
              checked={target === 'topic'}
              onChange={() => setTarget('topic')}
            />
            <Hash className="w-5 h-5" />
            <span className="text-xs font-bold">Topic</span>
          </label>

          <label className={cn(
            "cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all",
            target === 'user' ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          )}>
            <input 
              type="radio" 
              name="target" 
              value="user" 
              className="hidden" 
              checked={target === 'user'}
              onChange={() => setTarget('user')}
            />
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold">Specific User</span>
          </label>
        </div>

        {/* Dynamic Inputs based on Target */}
        {target === 'topic' && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Topic Name</label>
            <input 
              type="text" 
              name="targetId"
              placeholder="e.g. news, promos"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        )}

        {target === 'user' && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User ID (Phone)</label>
            <input 
              type="text" 
              name="targetId"
              placeholder="e.g. USR-9876543210"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        )}

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
          <input 
            type="text" 
            name="title"
            placeholder="Notification Title"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Body</label>
          <textarea 
            name="body"
            placeholder="Notification message..."
            required
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Link (Optional)</label>
          <input 
            type="text" 
            name="link"
            placeholder="e.g. /offers"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Status Message */}
        {state.message && (
          <div className={cn(
            "p-4 rounded-xl flex items-start gap-3",
            state.success ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          )}>
            {state.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <div className="text-sm font-medium">
              <p>{state.message}</p>
              {state.errors && (
                <ul className="list-disc list-inside mt-1 text-xs opacity-80">
                  {state.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
