'use client'

import { useState, useEffect, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This page uses Firebase and should not be prerendered
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, CheckCircle, Clock, XCircle, Filter, Calendar, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { Booking, Client } from '@/lib/schemas';
import { COLLECTIONS } from '@/lib/schemas';

function BookingsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [campTypeFilter, setCampTypeFilter] = useState<'all' | 'FR' | 'HH'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Always call hooks at the top level
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch clients for filter dropdown - moved to top level
  const [clientsSnapshot, loadingClients] = useCollection(
    db ? collection(db, COLLECTIONS.CLIENTS) : null
  );

  // Create bookings query for filtering
  const bookingsQuery = useMemo(() => {
    if (!db) return null;

    try {
      const constraints = [];

      // Add status filter
      if (statusFilter !== 'all') {
        constraints.push(where('paymentStatus', '==', statusFilter));
      }

      // Add camp type filter
      if (campTypeFilter !== 'all') {
        constraints.push(where('campType', '==', campTypeFilter));
      }

      // Add client filter
      if (clientFilter !== 'all') {
        constraints.push(where('clientIds', 'array-contains', clientFilter));
      }

      // Add date range filter
      if (dateRangeFilter !== 'all') {
        const now = new Date();
        let startDate;

        switch (dateRangeFilter) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'quarter':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0); // All time
        }

        constraints.push(where('createdAt', '>=', startDate));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      // Create query with error handling
      try {
        return query(collection(db, 'bookings'), ...constraints);
      } catch (error) {
        console.warn('Query creation failed:', error);
        return null;
      }
    } catch (error) {
      console.warn('Bookings query setup failed:', error);
      return null;
    }
  }, [db, statusFilter, campTypeFilter, dateRangeFilter, clientFilter]);

  // Use Firestore collection hook for real-time data
  const [bookingsSnapshot, loading, firestoreError] = useCollection(bookingsQuery || null);

  // Prevent SSR rendering to avoid Firebase prerendering errors
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  const clients = useMemo(() => {
    if (!clientsSnapshot) return [];
    return clientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Client & { id: string })[];
  }, [clientsSnapshot]);

  // All Firebase logic moved to top level

  const filteredBookings = bookings.filter(booking => {
    try {
      const searchLower = searchTerm.toLowerCase();
      const idMatch = booking.id?.toLowerCase().includes(searchLower) || false;
      const notesMatch = booking.notes?.toLowerCase().includes(searchLower) || false;
      return idMatch || notesMatch;
    } catch (error) {
      console.warn('Error filtering booking:', error, booking);
      return false;
    }
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Update payment status with Firestore transaction
  const updatePaymentStatus = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    if (!db) {
      toast.error('Database not available');
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, 'bookings', bookingId);
        transaction.update(bookingRef, { paymentStatus: newStatus });
      });
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  // Occupancy bar component
  const OccupancyBar = ({ occupancy, capacity }: { occupancy: number; capacity: number }) => {
    const percentage = (occupancy / capacity) * 100;
    return (
      <div className="flex items-center space-x-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs text-gray-600">{occupancy}/{capacity}</span>
      </div>
    );
  };

  // Group bookings by week
  const groupedBookings = useMemo(() => {
    const groups: { [key: string]: (Booking & { id: string })[] } = {};

    filteredBookings.forEach(booking => {
      try {
        // Safely access createdAt timestamp
        if (!booking.createdAt || !booking.createdAt.seconds) {
          console.warn('Invalid booking createdAt:', booking);
          return;
        }

        // Group by week starting from Monday
        const date = new Date(booking.createdAt.seconds * 1000);
        if (isNaN(date.getTime())) {
          console.warn('Invalid booking date:', booking);
          return;
        }

        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        const weekKey = monday.toISOString().split('T')[0];

        if (!groups[weekKey]) {
          groups[weekKey] = [];
        }
        groups[weekKey].push(booking);
      } catch (error) {
        console.warn('Error grouping booking:', error, booking);
      }
    });

    return groups;
  }, [filteredBookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  try {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage all bookings and reservations</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button>Create New Booking</Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>
            View and manage all bookings
          </CardDescription>
          <div className="flex flex-col space-y-4">
            {/* Basic Filters Row */}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                aria-label="Search bookings"
              />
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Filter className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Advanced Filters Row */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <Select value={campTypeFilter} onValueChange={(value: any) => setCampTypeFilter(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Camp Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="FR">Frenchman's</SelectItem>
                    <SelectItem value="HH">Honolua Bay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedBookings).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No bookings found matching your search.' : 'No bookings found.'}
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(groupedBookings).map(([weekKey, weekBookings]) => (
                <AccordionItem key={weekKey} value={weekKey}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">
                          Week of {new Date(weekKey).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-sm text-gray-500">
                          {weekBookings.length} booking{weekBookings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-600">
                          {weekBookings.filter(b => b.paymentStatus === 'confirmed').length} confirmed
                        </span>
                        <span className="text-yellow-600">
                          {weekBookings.filter(b => b.paymentStatus === 'pending').length} pending
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-4">
                      {weekBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {booking.paymentStatus === 'confirmed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {booking.paymentStatus === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                                {booking.paymentStatus === 'cancelled' && <XCircle className="w-4 h-4 text-red-500" />}
                                <span className="font-medium">{booking.id.slice(0, 8)}...</span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {booking.clientIds?.length || 0} client{(booking.clientIds?.length || 0) !== 1 ? 's' : ''}
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                ${(booking.totalAmount || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <OccupancyBar occupancy={booking.items?.length || 0} capacity={10} />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => updatePaymentStatus(booking.id, 'pending')}
                                    disabled={booking.paymentStatus === 'pending'}
                                  >
                                    Mark as Pending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updatePaymentStatus(booking.id, 'confirmed')}
                                    disabled={booking.paymentStatus === 'confirmed'}
                                  >
                                    Mark as Confirmed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updatePaymentStatus(booking.id, 'cancelled')}
                                    disabled={booking.paymentStatus === 'cancelled'}
                                  >
                                    Mark as Cancelled
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {booking.notes && (
                            <p className="text-sm text-gray-600 mt-2">{booking.notes}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {formatDate(booking.createdAt)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{bookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.paymentStatus === 'confirmed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {bookings.filter(b => b.paymentStatus === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ${bookings.filter(b => b.paymentStatus === 'confirmed').reduce((sum, b) => sum + (b.totalAmount || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      </motion.div>
    </motion.div>
    );
  } catch (error) {
    console.error('Error rendering bookings page:', error);
    setRenderError(error instanceof Error ? error.message : 'An unexpected error occurred');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600">Manage all bookings and reservations</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <h3 className="font-medium">Error Loading Bookings</h3>
          <p className="text-sm mt-1">{renderError || 'An unexpected error occurred while loading the bookings page.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
