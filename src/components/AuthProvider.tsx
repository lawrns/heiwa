"use client";

import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase/client";
import { AuthUser, supabaseUserToAuthUser } from '@/lib/auth';

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
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Get session error:', error);
          setUser(null);
          setError(new Error('Failed to get session'));
          setLoading(false);
          return;
        }

        if (session?.user) {
          const authUser = supabaseUserToAuthUser(session.user);
          setUser(authUser);

          // Set the Supabase session token as a cookie for server-side verification
          if (authUser.isAdmin) {
            const token = session.access_token;
            const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
            document.cookie = `sb-${projectRef}-auth-token=${token}; path=/; max-age=3600; samesite=strict`;
          }
        } else {
          setUser(null);
          // Clear the auth token cookie
          const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
          document.cookie = `sb-${projectRef}-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        setError(undefined);
        setLoading(false);
      } catch (err) {
        console.error('Session check error:', err);
        setError(err instanceof Error ? err : new Error('Authentication error'));
        setUser(null);
        setLoading(false);
      }
    };

    // Check session immediately
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const authUser = supabaseUserToAuthUser(session.user);
            setUser(authUser);

            // Set the Supabase session token as a cookie for server-side verification
            if (authUser.isAdmin) {
              const token = session.access_token;
              const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
              document.cookie = `sb-${projectRef}-auth-token=${token}; path=/; max-age=3600; samesite=strict`;
            }
          } else {
            setUser(null);
            // Clear the auth token cookie
            const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
            document.cookie = `sb-${projectRef}-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
          setError(undefined);
        } catch (err) {
          console.error('Auth state change error:', err);
          setError(err instanceof Error ? err : new Error('Authentication error'));
          setUser(null);
        }
        // Don't set loading to false here since it's already handled by checkSession
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(undefined);
      // Clear the auth token cookie
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
      document.cookie = `sb-${projectRef}-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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
