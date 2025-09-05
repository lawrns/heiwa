// Firebase Authentication utilities
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
}

// Admin email list (update this with your admin emails)
const ADMIN_EMAILS = [
  'julianmjavierm@gmail.com',
  'julian@fyves.com',
  // Add your admin emails here
];

// Convert Firebase User to AuthUser
export function firebaseUserToAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isAdmin: user.email ? ADMIN_EMAILS.includes(user.email) : false,
  };
}

// Authentication API
export const authAPI = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = firebaseUserToAuthUser(userCredential.user);
      
      if (!authUser.isAdmin) {
        await signOut(auth);
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
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  // Create user account (for admin setup)
  async createUser(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = firebaseUserToAuthUser(userCredential.user);
      
      if (!authUser.isAdmin) {
        // Delete the user if they're not an admin
        await userCredential.user.delete();
        throw new Error('Access denied. Admin privileges required.');
      }
      
      return authUser;
    } catch (error: any) {
      console.error('Create user error:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  },

  // Handle session expiry
  async handleSessionExpiry(): Promise<void> {
    try {
      await signOut(auth);
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Session expiry handling error:', error);
    }
  },

  // Get current user
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Check if user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email);
  }
};

// Middleware helper for API routes
export async function requireAdminSession(request: Request): Promise<AuthUser> {
  try {
    // Get token from cookie or Authorization header
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/firebase-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No authentication token provided');
    }

    // In a real implementation, you would verify the token with Firebase Admin SDK
    // For this standalone version, we'll use a simplified approach
    const user = await authAPI.getCurrentUser();
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    const authUser = firebaseUserToAuthUser(user);
    if (!authUser.isAdmin) {
      throw new Error('Admin privileges required');
    }

    return authUser;
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}
