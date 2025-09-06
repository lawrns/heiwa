import { useEffect } from 'react';
import { useAuth as useAuthContext } from '@/components/AuthProvider';
import { AuthUser } from '@/lib/auth';

// Hook for requiring authentication (separated to prevent re-render loops)
export function useRequireAuth(): AuthUser {
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated (only once when conditions are met)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [user, loading]); // Include both dependencies

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

// Hook for requiring admin access (separated to prevent re-render loops)
export function useRequireAdmin(): AuthUser {
  const user = useRequireAuth();

  useEffect(() => {
    if (user && !user.isAdmin) {
      // Redirect to login if not admin (only once when conditions are met)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [user]); // Include user dependency

  if (!user.isAdmin) {
    throw new Error('Admin access required');
  }

  return user;
}
