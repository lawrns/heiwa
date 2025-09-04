'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
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
  const [firebaseUser, loading, error] = useAuthState(auth);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (firebaseUser) {
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
    document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await auth.signOut();
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
