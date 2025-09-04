'use client'

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Eye, Users, UserCheck, UserPlus, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript interfaces
interface Timestamp {
  seconds: number;
  nanoseconds?: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastBookingDate: Timestamp | null;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Mock data for demonstration
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 7 }, // 1 week ago
    notes: 'VIP client, prefers ocean view rooms. Allergic to shellfish.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 30 }, // 1 month ago
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 7 }
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus.r@surfmail.com',
    phone: '+1 (555) 987-6543',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 3 }, // 3 days ago
    notes: 'Professional surfer, books extended stays. Requires early check-in.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 90 }, // 3 months ago
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 3 }
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily.chen.travel@gmail.com',
    phone: '+1 (555) 456-7890',
    lastBookingDate: null,
    notes: 'First-time visitor, interested in beginner surf lessons.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 5 }, // 5 days ago
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 5 }
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'dthompson@corporate.com',
    phone: '+1 (555) 234-5678',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 14 }, // 2 weeks ago
    notes: 'Corporate bookings for team retreats. Needs group discounts and meeting facilities.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 180 }, // 6 months ago
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 14 }
  },
  {
    id: '5',
    name: 'Isabella Martinez',
    email: 'bella.martinez@hotmail.com',
    phone: '+1 (555) 345-6789',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 1 }, // 1 day ago
    notes: 'Yoga instructor, books monthly wellness retreats.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 60 }, // 2 months ago
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 1 }
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'jwilson.photographer@outlook.com',
    phone: '+1 (555) 567-8901',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 21 }, // 3 weeks ago
    notes: 'Professional photographer, needs equipment storage and early sunrise access.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 120 }, // 4 months ago
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 21 }
  },
  {
    id: '7',
    name: 'Aisha Patel',
    email: 'aisha.patel.md@medical.org',
    phone: '+1 (555) 678-9012',
    lastBookingDate: null,
    notes: 'Medical professional, interested in stress-relief packages.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 2 }, // 2 days ago
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 2 }
  },
  {
    id: '8',
    name: 'Robert Kim',
    email: 'robert.kim.tech@startup.io',
    phone: '+1 (555) 789-0123',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 45 }, // 1.5 months ago
    notes: 'Tech entrepreneur, books last-minute. Prefers digital check-in.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 200 }, // ~7 months ago
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 45 }
  }
];

// Loading skeleton component
const ClientRowSkeleton = () => (
  <TableRow>
    {[...Array(6)].map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </TableCell>
    ))}
  </TableRow>
);

// Main component
export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Simulate API loading
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // In production, this would be: const response = await fetch('/api/clients');
      setClients(MOCK_CLIENTS);
    } catch (error: any) {
      setError('Failed to load clients. Please try again.');
      console.error('Load clients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  // Memoized filtered clients with debounced search
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    const term = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.replace(/\D/g, '').includes(term.replace(/\D/g, ''))
    );
  }, [clients, searchTerm]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return {
      total: clients.length,
      withBookings: clients.filter(c => c.lastBookingDate).length,
      newThisMonth: clients.filter(c => {
        const created = new Date(c.createdAt.seconds * 1000);
        return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
      }).length
    };
  }, [clients]);

  // Date formatting utility
  const formatDate = (timestamp: Timestamp | null): string => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Truncate notes utility
  const truncateNotes = (notes: string, maxLength: number = 50): string => {
    if (!notes) return 'No notes';
    return notes.length > maxLength ? `${notes.substring(0, maxLength)}...` : notes;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage client information and booking history</p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add New Client
        </Button>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2"
          >
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadClients} className="ml-auto">
              Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Client Directory
          </CardTitle>
          <CardDescription>
            View and manage all registered clients
          </CardDescription>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            /* Loading State */
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading clients...</span>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Last Booking</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => <ClientRowSkeleton key={i} />)}
                </TableBody>
              </Table>
            </div>
          ) : filteredClients.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? `No clients match "${searchTerm}". Try adjusting your search.`
                  : 'Get started by adding your first client.'
                }
              </p>
              {!searchTerm && (
                <Button className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Add First Client
                </Button>
              )}
            </div>
          ) : (
            /* Data Table */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Last Booking</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredClients.map((client, index) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="text-gray-600">{client.email}</TableCell>
                        <TableCell className="text-gray-600">{client.phone}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            client.lastBookingDate
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {formatDate(client.lastBookingDate)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span
                            title={client.notes || 'No notes'}
                            className="text-gray-600 cursor-help"
                          >
                            {truncateNotes(client.notes)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 hover:bg-green-50 hover:border-green-300"
                            >
                              <Eye className="h-3 w-3" />
                              View Bookings
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.total > 0 ? 'Registered clients' : 'No clients yet'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">With Bookings</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.withBookings}</div>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.total > 0
                  ? `${Math.round((statistics.withBookings / statistics.total) * 100)}% of clients`
                  : 'No bookings yet'
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">New This Month</CardTitle>
              <UserPlus className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{statistics.newThisMonth}</div>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.newThisMonth > 0 ? 'New registrations' : 'No new clients'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
