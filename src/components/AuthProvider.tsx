"use client";

import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { getAuth } from "@/lib/firebase";
import { AuthUser, firebaseUserToAuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | undefined;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // Get auth instance safely (will be null during SSR)
    const auth = getAuth();

    if (!auth) {
      // During SSR or if Firebase isn't ready, show loading
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        try {
          if (firebaseUser) {
            const authUser = await firebaseUserToAuthUser(firebaseUser);
            setUser(authUser);
          } else {
            setUser(null);
          }
          setError(undefined);
        } catch (err) {
          console.error('Auth state change error:', err);
          setError(err instanceof Error ? err : new Error('Authentication error'));
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Auth state listener error:', err);
        setError(err instanceof Error ? err : new Error('Authentication listener error'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const auth = getAuth();
      if (auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setError(undefined);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err : new Error('Sign out error'));
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
