'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Upload, FileText, LogOut, Store, ChefHat, BarChart, StickyNote, Loader2, HelpCircle } from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';

function AdminLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut, isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [canRedirect, setCanRedirect] = useState(false);

  // Wait 2 seconds before allowing redirects to give Firebase time to check persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[AdminLayout] Redirect lock released after 2s');
      setCanRedirect(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  console.log('[AdminLayout] Auth state:', { loading, isAuthenticated, canRedirect, user: user?.email });

  useEffect(() => {
    // Only redirect if:
    // 1. Redirect lock is released (waited 2 seconds)
    // 2. Not still loading
    // 3. Not authenticated
    // 4. Not already redirecting
    if (canRedirect && !loading && !isAuthenticated && !redirecting) {
      console.log('[AdminLayout] Not authenticated after wait, redirecting to sign-in');
      setRedirecting(true);
      window.location.href = '/sign-in';
    }
  }, [loading, isAuthenticated, redirecting, canRedirect]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Show loading state while checking auth or redirecting
  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-slate-600 font-medium">{redirecting ? 'Redirecting...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const userName = user?.email || 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex-shrink-0 hidden md:flex flex-col shadow-2xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/30">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Khazaana</h1>
              <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-sm truncate max-w-[160px]">{userName}</p>
              <p className="text-[11px] text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2">Navigation</p>
          <Link 
            href="/admin" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link 
            href="/admin/orders" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Orders</span>
          </Link>

          <Link 
            href="/admin/analytics" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <BarChart className="w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors" />
            <span className="font-medium">Analytics</span>
          </Link>

          <Link 
            href="/admin/notifications" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="font-medium">Notifications</span>
          </Link>

          <Link 
            href="/admin/restaurants" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <Store className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span className="font-medium">Restaurants</span>
          </Link>
          
          <Link 
            href="/admin/restaurants/new" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-lg leading-none text-slate-400 group-hover:text-emerald-400 transition-colors">+</span>
            </div>
            <span className="font-medium">Add Restaurant</span>
          </Link>
          
          <Link 
            href="/admin/upload" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Upload Menus</span>
          </Link>

          <Link 
            href="/admin/offers" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <FileText className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="font-medium">Manage Offers</span>
          </Link>

          <Link 
            href="/admin/notes" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <StickyNote className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
            <span className="font-medium">Notes</span>
          </Link>

          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6">Support</p>
          <Link 
            href="/admin/help" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white duration-200 group"
          >
            <HelpCircle className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="font-medium">How to?</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
          <Link 
            href="/" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-all duration-200"
          >
            <span className="font-medium text-sm">← Back to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-sm">Khazaana Admin</span>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{userName}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-xs font-bold text-white bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </header>

        {/* Mobile Navigation */}
        <nav className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex gap-2 overflow-x-auto sticky top-[60px] z-20 shadow-sm">
          <Link href="/admin" className="flex-shrink-0 px-4 py-2 bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 rounded-lg text-sm font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/restaurants/new" className="flex-shrink-0 px-4 py-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-lg text-sm font-medium transition-colors">
            Add Restaurant
          </Link>
          <Link href="/admin/upload" className="flex-shrink-0 px-4 py-2 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors">
            Upload Menu
          </Link>
        </nav>

        <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-10 relative">
           {/* Decorative Elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
           <div className="relative z-10 max-w-6xl mx-auto">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
