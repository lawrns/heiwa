'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SortingState, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase/client';

// Import our new components
import { ClientsToolbar } from '@/components/admin/clients/ClientsToolbar';
import { ClientsTable } from '@/components/admin/clients/ClientsTable';
import { BulkBar } from '@/components/admin/clients/BulkBar';
import { ClientDialog } from '@/components/admin/clients/ClientDialog';
import { NoClientsState, NoSearchResultsState, LoadingState } from '@/components/admin/EmptyState';

// Import types and utilities
import { Client, CreateClient, UpdateClient } from '@/lib/clients/schema';
import { exportToCSV, importClientsFromCSV, ImportResult } from '@/lib/clients/csv';

// Database client type (matches the actual database structure)
interface DatabaseClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  last_booking_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

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
        socials: true, // Temporarily enabled until DB schema is fixed
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



    return filtered;
  }, [clients, searchValue, brandFilter]);

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

  // Define loadClients function first
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert database format to Client format
      const formattedClients = data?.map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        brand: 'Heiwa House', // Default brand, could be stored in database
        socials: client.socials || {},
        lastBookingDate: client.last_booking_date
          ? { seconds: new Date(client.last_booking_date).getTime() / 1000, nanoseconds: 0 }
          : null,
        registrationDate: { seconds: new Date(client.created_at).getTime() / 1000, nanoseconds: 0 },
        notes: client.notes || '',
        createdAt: { seconds: new Date(client.created_at).getTime() / 1000, nanoseconds: 0 },
        updatedAt: { seconds: new Date(client.updated_at).getTime() / 1000, nanoseconds: 0 }
      })) as Client[];

      setClients(formattedClients || []);
    } catch (err: any) {
      setError('Failed to load clients. Please try again.');
      console.error('Load clients error:', err);
      toast.error(`Failed to load clients: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load clients on mount and set up real-time subscriptions
  useEffect(() => {
    loadClients();

    // Set up real-time subscription for clients
    const clientsSubscription = supabase
      .channel('clients_changes_admin')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload) => {
          console.log('Clients change detected in admin:', payload);
          loadClients(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      clientsSubscription.unsubscribe();
    };
  }, [loadClients]);

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
      sort: sorting[0]?.id || 'name',
      order: sorting[0]?.desc ? 'desc' : 'asc',
    });
  }, [searchValue, brandFilter, sorting, updateURL]);

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

  const handleArchiveClient = useCallback(async (client: Client) => {
    try {
      // For now, we'll update the status to 'Inactive' since there's no status field in DB
      // In a real implementation, you might add a status field or use a separate archived table
      toast.info(`Archive functionality not yet implemented for ${client.name}`);
    } catch (err: any) {
      toast.error(`Failed to archive client: ${err.message}`);
    }
  }, []);

  const handleDeleteClient = useCallback(async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      toast.success(`${client.name} deleted successfully`);
      loadClients(); // Refresh the list
    } catch (err: any) {
      toast.error(`Failed to delete client: ${err.message}`);
    }
  }, [loadClients]);

  const handleSaveClient = useCallback(async (data: CreateClient | UpdateClient) => {
    setSaving(true);

    // Optimistic UI update for new client creation
    let optimisticClient: Client | null = null;
    if (!editingClient) {
      optimisticClient = {
        id: `temp-${Date.now()}`, // Temporary ID
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        brand: (data as any).brand || 'Heiwa House',
        socials: (data as any).socials || { instagram: '', facebook: '', twitter: '' },
        notes: data.notes || '',
        lastBookingDate: null,
        registrationDate: null, // Simplified - let backend handle
        createdAt: null, // Simplified - let backend handle
        updatedAt: null, // Simplified - let backend handle
      };

      // Add optimistic client to the list immediately
      setClients(prev => [optimisticClient!, ...prev]);
      toast.success('Client added successfully');
      setDialogOpen(false);
      setEditingClient(null);
    }

    try {
      if (editingClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            name: data.name,
            email: data.email,
            phone: data.phone,
            brand: (data as any).brand || 'Heiwa House',
            socials: (data as any).socials || {},
            notes: data.notes || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', editingClient.id);

        if (error) throw error;
        toast.success('Client updated successfully');
        setDialogOpen(false);
        setEditingClient(null);
      } else {
        // Create new client (temporarily excluding socials field)
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert({
            name: data.name,
            email: data.email,
            phone: data.phone,
            brand: (data as any).brand || 'Heiwa House',
            // socials: (data as any).socials || {}, // Temporarily commented out due to DB schema issue
            notes: data.notes || '',
            // created_at: new Date().toISOString(), // Let DB handle this
            // updated_at: new Date().toISOString() // Let DB handle this
          })
          .select()
          .single();

        if (error) throw error;

        // Replace optimistic client with real client data
        if (optimisticClient && newClient) {
          setClients(prev => prev.map(client =>
            client.id === optimisticClient!.id ? newClient : client
          ));
        }
      }

      // Refresh the clients list to ensure consistency
      loadClients();
    } catch (err: any) {
      // Revert optimistic update on error
      if (optimisticClient) {
        setClients(prev => prev.filter(client => client.id !== optimisticClient!.id));
        setDialogOpen(true); // Reopen dialog for retry
      }
      toast.error(`Failed to save client: ${err.message}`);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [editingClient, loadClients]);

  const handleImport = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const result: ImportResult = await importClientsFromCSV(file);

      if (result.validRows > 0) {
        // Convert valid rows to clients and add them
        const newClients: Client[] = result.data.map((row, index) => ({
          id: `imported-${Date.now()}-${index}`,
          name: row.name,
          email: row.email,
          phone: row.phone || '',
          brand: row.brand || 'Heiwa House',
          socials: {
            instagram: (row as any).instagram || '',
            facebook: (row as any).facebook || '',
            twitter: (row as any).twitter || '',
          },
          lastBookingDate: row.lastBookingDate
            ? { seconds: new Date(row.lastBookingDate).getTime() / 1000, nanoseconds: 0 }
            : null,
          registrationDate: row.registrationDate
            ? { seconds: new Date(row.registrationDate).getTime() / 1000, nanoseconds: 0 }
            : { seconds: Date.now() / 1000, nanoseconds: 0 },
          notes: row.notes || '',
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

  const handleBulkArchive = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    try {
      toast.info(`Bulk archive functionality not yet implemented for ${selectedIds.length} clients`);
      setRowSelection({});
    } catch (err: any) {
      toast.error(`Failed to archive clients: ${err.message}`);
    }
  }, [rowSelection]);

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} clients? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      toast.success(`${selectedIds.length} clients deleted successfully`);
      setRowSelection({});
      loadClients(); // Refresh the list
    } catch (err: any) {
      toast.error(`Failed to delete clients: ${err.message}`);
    }
  }, [rowSelection, loadClients]);

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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-heiwaOrange-100 text-heiwaOrange-800">
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
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={(columns) => {
            const newVisibility: VisibilityState = {};
            ['name', 'email', 'phone', 'lastBookingDate', 'brand', 'socials', 'registrationDate'].forEach(col => {
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
            <Users className="h-4 w-4 text-heiwaOrange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-heiwaOrange-600">{statistics.total}</div>
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
