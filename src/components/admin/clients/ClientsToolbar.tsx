'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Download,
  Upload,
  Settings,
  ArrowUpDown,
  FileText,
  X,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { downloadCSVTemplate } from '@/lib/clients/csv';

export interface ClientsToolbarProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Filters
  brandFilter: string;
  onBrandFilterChange: (value: string) => void;

  // Column visibility
  visibleColumns: string[];
  onColumnVisibilityChange: (columns: string[]) => void;

  // Sort
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void;

  // Actions
  onAddClient: () => void;
  onImport: (file: File) => void;
  onExport: (selectedIds?: string[]) => void;

  // State
  totalCount: number;
  selectedCount?: number;

  // Loading states
  isSearching?: boolean;
  isExporting?: boolean;
}

const BRAND_OPTIONS = [
  { value: 'All', label: 'All Brands' },
  { value: 'Heiwa House', label: 'Heiwa House' },
  { value: 'Freedom Routes', label: 'Freedom Routes' },
];



const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'lastBookingDate', label: 'Last Booking' },
  { value: 'registrationDate', label: 'Registration Date' },
  { value: 'brand', label: 'Brand' },
];

const COLUMN_OPTIONS = [
  { id: 'name', label: 'Name', required: true },
  { id: 'email', label: 'Email', required: true },
  { id: 'phone', label: 'Phone', required: false },
  { id: 'lastBookingDate', label: 'Last Booking', required: false },
  { id: 'brand', label: 'Brand', required: false },
  { id: 'socials', label: 'Socials', required: false },
  { id: 'registrationDate', label: 'Registration Date', required: false },
];

export function ClientsToolbar({
  searchValue,
  onSearchChange,
  brandFilter,
  onBrandFilterChange,
  visibleColumns,
  onColumnVisibilityChange,
  sortBy,
  sortDirection,
  onSortChange,
  onAddClient,
  onImport,
  onExport,
  totalCount,
  selectedCount = 0,
  isSearching = false,
  isExporting = false,
}: ClientsToolbarProps) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const debouncedSearchValue = useDebounce(localSearchValue, 300);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Debounced search effect
  useEffect(() => {
    if (debouncedSearchValue !== searchValue) {
      onSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearchChange, searchValue]);

  // Handle column visibility toggle
  const handleColumnToggle = useCallback((columnId: string, checked: boolean) => {
    const column = COLUMN_OPTIONS.find(col => col.id === columnId);
    if (column?.required && !checked) return; // Don't allow hiding required columns

    const newVisibleColumns = checked
      ? [...visibleColumns, columnId]
      : visibleColumns.filter(id => id !== columnId);

    onColumnVisibilityChange(newVisibleColumns);
  }, [visibleColumns, onColumnVisibilityChange]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const [newSortBy, newDirection] = value.split(':');
    onSortChange(newSortBy, newDirection as 'asc' | 'desc');
  }, [onSortChange]);

  // Handle export
  const handleExport = useCallback(() => {
    if (selectedCount > 0) {
      onExport(); // Export selected only
    } else {
      onExport(); // Export all filtered
    }
  }, [selectedCount, onExport]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearchValue('');
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border-b border-gray-200">
      {/* Header with title and count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
          <span className="text-sm text-gray-500">
            ({selectedCount > 0 ? `${selectedCount} selected` : `${totalCount} total`})
          </span>
        </div>
        <Button
          onClick={onAddClient}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          aria-label="Add new client"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Main toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={localSearchValue}
            onChange={(e) => setLocalSearchValue(e.target.value)}
            className={cn(
              "pl-10 pr-10",
              isSearching && "opacity-70"
            )}
            aria-label="Search clients"
          />
          {localSearchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Brand filter */}
        <Select value={brandFilter} onValueChange={onBrandFilterChange}>
          <SelectTrigger className="w-40" aria-label="Filter by brand">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            {BRAND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>



        {/* Sort dropdown */}
        <Select
          value={`${sortBy}:${sortDirection}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-48" aria-label="Sort clients">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <React.Fragment key={option.value}>
                <SelectItem value={`${option.value}:asc`}>
                  {option.label} ↑
                </SelectItem>
                <SelectItem value={`${option.value}:desc`}>
                  {option.label} ↓
                </SelectItem>
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>

        {/* Column visibility dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Toggle column visibility">
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COLUMN_OPTIONS.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visibleColumns.includes(column.id)}
                onCheckedChange={(checked) => handleColumnToggle(column.id, checked)}
                disabled={column.required}
              >
                {column.label}
                {column.required && <span className="text-xs text-gray-500 ml-1">(required)</span>}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import/Export group */}
        <div className="flex items-center gap-2">
          <label htmlFor="csv-import" className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              asChild
              aria-label="Import clients from CSV"
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <input
            id="csv-import"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImport(file);
                // Reset the input
                e.target.value = '';
              }
            }}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            aria-label={selectedCount > 0 ? "Export selected clients" : "Export all clients"}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="More options">
                <FileText className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>CSV Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <button
                onClick={() => downloadCSVTemplate()}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm"
              >
                Download Template
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
