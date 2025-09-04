'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth as getFirebaseAuth } from 'firebase/auth';
import { getAuth } from '@/lib/firebase';
import { AuthUser, firebaseUserToAuthUser, authAPI } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | undefined;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Only initialize Firebase auth on the client side
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize Firebase auth only on client side
  useEffect(() => {
    setIsClient(true);
    try {
      const authInstance = getFirebaseAuth();
      setFirebaseAuth(authInstance);
    } catch (error) {
      console.warn('Failed to initialize Firebase auth:', error);
    }
  }, []);

  // During SSR, provide a basic context with loading state
  if (!isClient) {
    const ssrValue: AuthContextType = {
      user: null,
      loading: true,
      error: undefined,
      signOut: async () => {},
    };
    return (
      <AuthContext.Provider value={ssrValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Now we're on client, but auth might not be initialized yet
  const [firebaseUser, loading, error] = useAuthState(firebaseAuth || undefined);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (firebaseUser && firebaseAuth) {
      setUser(firebaseUserToAuthUser(firebaseUser));

      // Set authentication cookie for middleware
      const setAuthCookie = async () => {
        try {
          const token = await firebaseUser.getIdToken();
          if (token) {
            // Set cookie that middleware can read
            document.cookie = `firebase-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
          }
        } catch (error) {
          console.error('Failed to set auth cookie:', error);
        }
      };

      setAuthCookie();

      // Set up token refresh to handle session expiry
      const checkTokenExpiry = async () => {
        try {
          const token = await firebaseUser.getIdToken(true); // Force refresh
          if (token) {
            // Update cookie with new token
            document.cookie = `firebase-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
          } else {
            await authAPI.handleSessionExpiry();
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          await authAPI.handleSessionExpiry();
        }
      };

      // Check token every 30 minutes
      const interval = setInterval(checkTokenExpiry, 30 * 60 * 1000);

      return () => clearInterval(interval);
    } else {
      setUser(null);
      // Clear auth cookie when user logs out
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, [firebaseUser]);

  const signOut = async () => {
    // Clear auth cookie before signing out
    if (typeof document !== 'undefined') {
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    if (firebaseAuth) {
      await firebaseAuth.signOut();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking if user is admin
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.isAdmin || false;
}

// Hook for requiring authentication
export function useRequireAuth(): AuthUser {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
  }, [user, loading]);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

// Hook for requiring admin access
export function useRequireAdmin(): AuthUser {
  const user = useRequireAuth();
  
  useEffect(() => {
    if (user && !user.isAdmin) {
      // Redirect to login if not admin
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
  }, [user]);

  if (!user.isAdmin) {
    throw new Error('Admin access required');
  }

  return user;
}
