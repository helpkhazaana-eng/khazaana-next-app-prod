'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Auth } from 'firebase/auth';

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Cached auth instance - shared across all AdminAuthProvider instances
let cachedAuth: Auth | null = null;
let authInitPromise: Promise<Auth> | null = null;

// Check localStorage for auth hint (survives page reloads)
const AUTH_HINT_KEY = 'khazaana_admin_auth_hint';

function setAuthHint(hasUser: boolean) {
  if (typeof window !== 'undefined') {
    if (hasUser) {
      localStorage.setItem(AUTH_HINT_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_HINT_KEY);
    }
  }
}

export function getAuthHint(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_HINT_KEY) === 'true';
  }
  return false;
}

// Get or create Firebase Auth instance (singleton pattern)
async function getAuth(): Promise<Auth> {
  if (cachedAuth) return cachedAuth;
  
  // If initialization is in progress, wait for it
  if (authInitPromise) return authInitPromise;
  
  // Start initialization
  authInitPromise = (async () => {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth: firebaseGetAuth, browserLocalPersistence, setPersistence } = await import('firebase/auth');
    
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = firebaseGetAuth(app);
    
    // Ensure persistence is set to LOCAL (survives page refreshes)
    await setPersistence(auth, browserLocalPersistence);
    
    cachedAuth = auth;
    return auth;
  })();
  
  return authInitPromise;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // If we have an auth hint in localStorage, start with loading=true to wait for Firebase
  // Otherwise, we know there's no user and can set loading=false after auth check
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    let unsubscribe: (() => void) | undefined;
    let mounted = true;
    
    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const auth = await getAuth();
        
        console.log('[AdminAuth] Waiting for auth state to be ready...');
        await auth.authStateReady();
        
        console.log('[AdminAuth] Auth ready, currentUser:', auth.currentUser?.email || 'null');
        
        // Update localStorage hint based on actual auth state
        setAuthHint(!!auth.currentUser);
        
        if (mounted) {
          setUser(auth.currentUser);
          setLoading(false);
        }
        
        // Subscribe to future changes
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (!mounted) return;
          console.log('[AdminAuth] onAuthStateChanged:', firebaseUser?.email || 'null');
          setAuthHint(!!firebaseUser);
          setUser(firebaseUser);
        });
      } catch (error) {
        console.error('[AdminAuth] Firebase Auth init error:', error);
        if (mounted) {
          setAuthHint(false);
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[AdminAuth] Starting sign in for:', email);
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      console.log('[AdminAuth] Firebase auth module imported');
      const auth = await getAuth();
      console.log('[AdminAuth] Got auth instance:', auth?.app?.options?.projectId);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[AdminAuth] Sign in successful:', userCredential.user?.email);
      
      // IMPORTANT: Set auth hint in localStorage so redirect doesn't cause loop
      setAuthHint(true);
      setUser(userCredential.user);
      
      return { success: true };
    } catch (error: any) {
      console.error('[AdminAuth] Sign in error:', error.code, error.message);
      
      // Map Firebase error codes to user-friendly messages
      let errorMessage = 'Sign in failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      const { signOut: firebaseSignOut } = await import('firebase/auth');
      const auth = await getAuth();
      await firebaseSignOut(auth);
      
      // Clear auth hint in localStorage
      setAuthHint(false);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!user
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
