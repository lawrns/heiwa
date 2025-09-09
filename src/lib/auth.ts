// Supabase Authentication utilities
import { supabase } from './supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  uid?: string; // For backward compatibility
}

// Admin email list (update this with your admin emails)
const ADMIN_EMAILS = [
  'julianmjavierm@gmail.com',
  'julian@fyves.com',
  'admin@heiwa.house',
  'manager@heiwa.house',
  'laurence@fyves.com'
];

// Convert Supabase User to AuthUser
export function supabaseUserToAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
    isAdmin: user.email ? ADMIN_EMAILS.includes(user.email) : false,
  };
}

// Backward compatibility
export const firebaseUserToAuthUser = supabaseUserToAuthUser;

// Authentication API
export const authAPI = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user returned from authentication');
      }

      const authUser = supabaseUserToAuthUser(data.user);

      if (!authUser.isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      return authUser;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  // Create user account (for admin setup)
  async createUser(email: string, password: string): Promise<AuthUser> {
    try {
      // Check if email is in admin list before creating
      if (!ADMIN_EMAILS.includes(email)) {
        throw new Error('Access denied. Admin privileges required.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user returned from registration');
      }

      const authUser = supabaseUserToAuthUser(data.user);
      return authUser;
    } catch (error: any) {
      console.error('Create user error:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  },

  // Handle session expiry
  async handleSessionExpiry(): Promise<void> {
    try {
      await supabase.auth.signOut();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Session expiry handling error:', error);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Get current user error:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Check if user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email);
  },

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Get current session error:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }
};

// Middleware helper for API routes
export async function requireAdminSession(request: Request): Promise<AuthUser> {
  try {
    // Get token from cookie or Authorization header
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No authentication token provided');
    }

    // Get current user session
    const user = await authAPI.getCurrentUser();
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    const authUser = supabaseUserToAuthUser(user);
    if (!authUser.isAdmin) {
      throw new Error('Admin privileges required');
    }

    return authUser;
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}
