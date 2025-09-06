'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  UserIcon, 
  CreditCardIcon,
  WavesIcon,
  LogOutIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon
} from 'lucide-react';
import BookingsList from '@/components/client/BookingsList';
import ProfileForm from '@/components/client/ProfileForm';
import Payments from '@/components/client/Payments';

export default function ClientPortal() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookings');

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/client/auth');
    }
  }, [user, loading, router]);

  // Don't render if user is not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/client/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <WavesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Heiwa House</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.displayName || user.email}!
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-6 text-white mb-8"
        >
          <div className="flex items-center space-x-3">
            <WavesIcon className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Welcome to Your Portal</h1>
              <p className="text-blue-100">Manage your bookings, profile, and payments</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger 
                  value="bookings" 
                  className="flex items-center space-x-2"
                  data-testid="bookings-tab"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">My Bookings</span>
                  <span className="sm:hidden">Bookings</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center space-x-2"
                  data-testid="profile-tab"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                  <span className="sm:hidden">Profile</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="flex items-center space-x-2"
                  data-testid="payments-tab"
                >
                  <CreditCardIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Payments</span>
                  <span className="sm:hidden">Payments</span>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="bookings" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
                        <p className="text-gray-600">View and manage your surf camp reservations</p>
                      </div>
                      <BookingsList />
                    </div>
                  </TabsContent>

                  <TabsContent value="profile" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                        <p className="text-gray-600">Update your personal information and preferences</p>
                      </div>
                      <ProfileForm />
                    </div>
                  </TabsContent>

                  <TabsContent value="payments" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                        <p className="text-gray-600">View payment history and manage pending payments</p>
                      </div>
                      <Payments />
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450</div>
              <p className="text-xs text-muted-foreground">
                Across all bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Surf Level</CardTitle>
              <WavesIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Intermediate</div>
              <p className="text-xs text-muted-foreground">
                Keep progressing!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => setActiveTab('bookings')}
                >
                  <CalendarIcon className="w-6 h-6" />
                  <span>View Bookings</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => setActiveTab('profile')}
                >
                  <UserIcon className="w-6 h-6" />
                  <span>Edit Profile</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => setActiveTab('payments')}
                >
                  <CreditCardIcon className="w-6 h-6" />
                  <span>View Payments</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
