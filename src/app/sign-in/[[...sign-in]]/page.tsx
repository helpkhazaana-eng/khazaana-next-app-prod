'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spotlight } from '@/components/ui/spotlight';
import { ChefHat, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';

function SignInPageInner() {
  const { signIn, isAuthenticated, loading: authLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle the sign-in process
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Sign in failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 antialiased bg-grid-white/[0.02] relative overflow-hidden p-4 md:p-8">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 opacity-50"
        fill="white"
      />
      
      <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
        {/* Brand Header */}
        <m.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8 space-y-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/20">
            <ChefHat className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="text-sm text-neutral-400 font-medium">
              Enter your credentials to continue
            </p>
          </div>
        </m.div>
        
        {/* Login Card */}
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full relative group"
        >
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative bg-neutral-900/90 border border-neutral-800 rounded-xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
                {/* Error Alert */}
                <AnimatePresence>
                  {error && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 mb-5"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-400 font-medium">{error}</p>
                    </m.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-neutral-300 text-[11px] font-semibold uppercase tracking-wider ml-0.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 rounded-lg px-4 transition-all duration-200 text-sm outline-none"
                        placeholder="admin@khazaana.co.in"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-neutral-300 text-[11px] font-semibold uppercase tracking-wider ml-0.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-11 bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 rounded-lg pl-4 pr-10 transition-all duration-200 text-sm outline-none"
                          placeholder="••••••••"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="h-11 w-full bg-white text-neutral-950 hover:bg-neutral-200 shadow-lg shadow-white/5 text-sm font-bold rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
            </div>
        </m.div>
        
        {/* Footer */}
        <m.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center space-y-4"
        >
            <p className="text-neutral-600 text-xs font-medium tracking-wide uppercase">
                Restricted Area
            </p>
            <a 
                href="/" 
                className="inline-flex items-center text-xs text-neutral-500 hover:text-white transition-colors duration-200"
            >
                <span className="mr-2">←</span> Back to Website
            </a>
        </m.div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <AdminAuthProvider>
      <SignInPageInner />
    </AdminAuthProvider>
  );
}
