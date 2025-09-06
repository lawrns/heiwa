'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { authAPI } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect if already authenticated (only on client side)
  if (typeof window !== 'undefined' && user?.isAdmin && !authLoading) {
    router.push('/admin');
    return null;
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      await authAPI.signIn(email, password);
      toast.success('Login successful!');
      router.push('/admin');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';

      if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        if (retryCount < 2) {
          toast.error('Network error, retrying...');
          setRetryCount(prev => prev + 1);
          setTimeout(() => handleSignIn(email, password), 2000);
          return;
        }
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRetryCount(0);

    try {
      await handleSignIn(email, password);
    } catch (error: unknown) {
      // Error already handled in handleSignIn
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl" aria-label="Heiwa House Logo">H</span>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access the admin panel
            </p>
          </div>

          <Card role="main" aria-label="Login form">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your admin credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@heiwahouse.com"
                    className="w-full"
                    aria-describedby="email-help"
                    autoComplete="email"
                    disabled={loading}
                  />
                  <p id="email-help" className="sr-only">Enter your admin email address</p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full"
                    aria-describedby="password-help"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <p id="password-help" className="sr-only">Enter your admin password</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  aria-label={loading ? 'Signing in...' : 'Sign In'}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Only authorized admin users can access this dashboard.
                  <br />
                  Contact your administrator if you need access.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
