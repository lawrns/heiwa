'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SortingState, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

// Import our new components
import { ClientsToolbar } from '@/components/admin/clients/ClientsToolbar';
import { ClientsTable } from '@/components/admin/clients/ClientsTable';
import { BulkBar } from '@/components/admin/clients/BulkBar';
import { ClientDialog } from '@/components/admin/clients/ClientDialog';
import { NoClientsState, NoSearchResultsState, LoadingState } from '@/components/admin/EmptyState';

// Import types and utilities
import { Client, CreateClient, UpdateClient } from '@/lib/clients/schema';
import { exportToCSV, importClientsFromCSV, ImportResult } from '@/lib/clients/csv';

// Mock data - in production this would come from API
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    brand: 'Heiwa House',
    status: 'Active',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 7, nanoseconds: 0 },
    registrationDate: { seconds: Date.now() / 1000 - 86400 * 30, nanoseconds: 0 },
    notes: 'VIP client, prefers ocean view rooms. Allergic to shellfish.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 30, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 7, nanoseconds: 0 }
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus.r@surfmail.com',
    phone: '+1 (555) 987-6543',
    brand: 'Freedom Routes',
    status: 'Active',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 3, nanoseconds: 0 },
    registrationDate: { seconds: Date.now() / 1000 - 86400 * 90, nanoseconds: 0 },
    notes: 'Professional surfer, books extended stays. Requires early check-in.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 90, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 3, nanoseconds: 0 }
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily.chen.travel@gmail.com',
    phone: '+1 (555) 456-7890',
    brand: 'Heiwa House',
    status: 'Active',
    lastBookingDate: null,
    registrationDate: { seconds: Date.now() / 1000 - 86400 * 5, nanoseconds: 0 },
    notes: 'First-time visitor, interested in beginner surf lessons.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 5, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 5, nanoseconds: 0 }
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'dthompson@corporate.com',
    phone: '+1 (555) 234-5678',
    brand: 'Freedom Routes',
    status: 'Active',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 14, nanoseconds: 0 },
    registrationDate: { seconds: Date.now() / 1000 - 86400 * 180, nanoseconds: 0 },
    notes: 'Corporate bookings for team retreats. Needs group discounts and meeting facilities.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 180, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 14, nanoseconds: 0 }
  },
  {
    id: '5',
    name: 'Isabella Martinez',
    email: 'bella.martinez@hotmail.com',
    phone: '+1 (555) 345-6789',
    brand: 'Heiwa House',
    status: 'Active',
    lastBookingDate: { seconds: Date.now() / 1000 - 86400 * 1, nanoseconds: 0 },
    registrationDate: { seconds: Date.now() / 1000 - 86400 * 60, nanoseconds: 0 },
    notes: 'Yoga instructor, books monthly wellness retreats.',
    createdAt: { seconds: Date.now() / 1000 - 86400 * 60, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000 - 86400 * 1, nanoseconds: 0 }
  },
];

export default function AdminClientsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Core state
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state with URL persistence
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || 'All');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [sorting, setSorting] = useState<SortingState>([{
    id: searchParams.get('sort') || 'name',
    desc: searchParams.get('order') === 'desc'
  }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    name: true,
    email: true,
    phone: true,
    lastBookingDate: true,
    brand: true,
    status: true,
    registrationDate: false, // Hidden by default
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  // Operations state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Event handlers - moved up to avoid temporal dead zone issues
  const handleAddClient = useCallback(() => {
    setEditingClient(null);
    setDialogOpen(true);
  }, []);

  const handleExport = useCallback(async (selectedIds?: string[]) => {
    setIsExporting(true);
    try {
      const dataToExport = selectedIds
        ? clients.filter(c => selectedIds.includes(c.id))
        : filteredData;

      exportToCSV(dataToExport);
      toast.success('Export completed');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [clients, filteredData]);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  // Update URL when filters change
  const updateURL = useCallback((params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Update or remove params
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== 'name' && value !== 'asc') {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    // Update URL without triggering a page reload
    const newURL = `${window.location.pathname}?${newSearchParams.toString()}`;
    window.history.replaceState({}, '', newURL);
  }, [searchParams]);

  // Update URL when search/filter/sort changes
  useEffect(() => {
    updateURL({
      q: searchValue,
      brand: brandFilter,
      status: statusFilter,
      sort: sorting[0]?.id || 'name',
      order: sorting[0]?.desc ? 'desc' : 'asc',
    });
  }, [searchValue, brandFilter, statusFilter, sorting, updateURL]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case '/':
          event.preventDefault();
          // Focus search input
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;
        case 'a':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            handleAddClient();
          }
          break;
        case 'e':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            handleExport();
          }
          break;
        case 'i':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            // Trigger file input for import
            const fileInput = document.getElementById('csv-import') as HTMLInputElement;
            if (fileInput) {
              fileInput.click();
            }
          }
          break;
        case 'escape':
          if (dialogOpen) {
            setDialogOpen(false);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dialogOpen, handleAddClient]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/firebase-clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      setError('Failed to load clients. Please try again.');
      console.error('Load clients error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (searchValue.trim()) {
      const term = searchValue.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term)
      );
    }

    // Apply brand filter
    if (brandFilter !== 'All') {
      filtered = filtered.filter(client => client.brand === brandFilter);
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    return filtered;
  }, [clients, searchValue, brandFilter, statusFilter]);

  // Statistics
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

  // Event handlers
  const handleEditClient = useCallback((client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  }, []);

  const handleViewClient = useCallback((client: Client) => {
    toast.info(`Viewing details for ${client.name}`);
    // TODO: Implement view client details
  }, []);

  const handleArchiveClient = useCallback((client: Client) => {
    toast.info(`Archiving ${client.name}`);
    // TODO: Implement archive functionality
  }, []);

  const handleDeleteClient = useCallback((client: Client) => {
    toast.info(`Deleting ${client.name}`);
    // TODO: Implement delete functionality
  }, []);

  const handleSaveClient = useCallback(async (data: CreateClient | UpdateClient) => {
    setSaving(true);
    try {
      const method = editingClient ? 'PUT' : 'POST';
      const body = editingClient ? { id: editingClient.id, ...data } : data;

      const response = await fetch('/api/firebase-clients', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save client');
      }

      const result = await response.json();

      if (editingClient) {
        // Update existing client
        setClients(prev => prev.map(c =>
          c.id === editingClient.id ? result.client : c
        ));
        toast.success('Client updated successfully');
      } else {
        // Add new client
        setClients(prev => [...prev, result.client]);
        toast.success('Client added successfully');
      }

      setDialogOpen(false);
      setEditingClient(null);
    } catch (err) {
      toast.error('Failed to save client');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [editingClient]);

  const handleImport = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const result: ImportResult = await importClientsFromCSV(file);

      if (result.validRows > 0) {
        // Convert valid rows to clients and add them
        const newClients: Client[] = result.data.map((row, index) => ({
          id: `imported-${Date.now()}-${index}`,
          ...row,
          registrationDate: row.registrationDate
            ? { seconds: new Date(row.registrationDate).getTime() / 1000, nanoseconds: 0 }
            : { seconds: Date.now() / 1000, nanoseconds: 0 },
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
        }));

        setClients(prev => [...prev, ...newClients]);
        toast.success(`Imported ${result.validRows} clients successfully${result.invalidRows > 0 ? ` (${result.invalidRows} errors)` : ''}`);
      } else {
        toast.error('No valid rows found in the CSV file');
      }

      if (result.invalidRows > 0) {
        console.warn('Import validation errors:', result.errors);
      }
    } catch (err) {
      toast.error('Import failed');
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  }, []);

  const handleBulkArchive = useCallback(() => {
    const selectedIds = Object.keys(rowSelection);
    toast.info(`Archiving ${selectedIds.length} clients`);
    // TODO: Implement bulk archive
    setRowSelection({});
  }, [rowSelection]);

  const handleBulkDelete = useCallback(() => {
    const selectedIds = Object.keys(rowSelection);
    toast.info(`Deleting ${selectedIds.length} clients`);
    // TODO: Implement bulk delete
    setRowSelection({});
  }, [rowSelection]);

  const handleBulkExport = useCallback(() => {
    const selectedIds = Object.keys(rowSelection);
    handleExport(selectedIds);
  }, [rowSelection, handleExport]);

  const handleClearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // Determine which columns to show
  const visibleColumns = useMemo(() => {
    return Object.keys(columnVisibility).filter(key => columnVisibility[key]);
  }, [columnVisibility]);

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-6" role="main" aria-label="Clients management page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-40 bg-white pb-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {statistics.total}
            </span>
          </div>
          <p className="text-gray-600 mt-1">Manage your client records by searching, filtering, and sorting.</p>
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-medium">Keyboard shortcuts:</span> Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">/</kbd> to search, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">A</kbd> to add client, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">E</kbd> to export, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">I</kbd> to import, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to close dialogs
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between"
        >
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadClients}>
            Retry
          </Button>
        </motion.div>
      )}

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ClientsToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          brandFilter={brandFilter}
          onBrandFilterChange={setBrandFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={(columns) => {
            const newVisibility: VisibilityState = {};
            ['name', 'email', 'phone', 'lastBookingDate', 'brand', 'status', 'registrationDate'].forEach(col => {
              newVisibility[col] = columns.includes(col);
            });
            setColumnVisibility(newVisibility);
          }}
          sortBy={sorting[0]?.id || 'name'}
          sortDirection={sorting[0]?.desc ? 'desc' : 'asc'}
          onSortChange={(sortBy, direction) => {
            setSorting([{ id: sortBy, desc: direction === 'desc' }]);
          }}
          onAddClient={handleAddClient}
          onImport={handleImport}
          onExport={handleExport}
          totalCount={filteredData.length}
          selectedCount={selectedCount}
          isExporting={isExporting}
        />
      </motion.div>

      {/* Bulk Actions Bar */}
      <BulkBar
        selectedCount={selectedCount}
        onArchiveSelected={handleBulkArchive}
        onDeleteSelected={handleBulkDelete}
        onExportSelected={handleBulkExport}
        onClearSelection={handleClearSelection}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="rounded-lg shadow-sm border bg-white p-2 md:p-3">
          {loading ? (
            <LoadingState />
          ) : filteredData.length === 0 ? (
            searchValue ? (
              <NoSearchResultsState
                searchTerm={searchValue}
                onClearSearch={() => setSearchValue('')}
              />
            ) : (
              <NoClientsState onAddClient={handleAddClient} />
            )
          ) : (
            <ClientsTable
              data={filteredData}
              visibleColumns={visibleColumns}
              sorting={sorting}
              onSortingChange={setSorting}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onArchiveClient={handleArchiveClient}
              onDeleteClient={handleDeleteClient}
              isLoading={loading}
            />
          )}
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
            <p className="text-xs text-gray-500 mt-1">Registered clients</p>
          </CardContent>
        </Card>

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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.newThisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">New registrations</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Client Dialog */}
      <ClientDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        client={editingClient}
        onSave={handleSaveClient}
        isSaving={saving}
        mode={editingClient ? 'edit' : 'create'}
      />
    </div>
  );
}
