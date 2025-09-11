import Papa from 'papaparse';
import { Client, ImportRow, validateImportRow } from './schema';

// CSV export configuration
export interface ExportConfig {
  filename: string;
  columns: (keyof Client)[];
  includeHeaders: boolean;
}

// Validation result for import rows
export interface ImportValidationResult {
  row: ImportRow;
  errors: string[];
  isValid: boolean;
  rowIndex: number;
}

// Import result summary
export interface ImportResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ImportValidationResult[];
  data: ImportRow[];
}

// Web Worker wrapper for CSV parsing (to avoid blocking UI)
class CSVWorker {
  private worker: Worker | null = null;

  async parseCSV(file: File): Promise<Papa.ParseResult<ImportRow>> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        // Server-side fallback
        return Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject,
        });
      }

      // Create inline worker for CSV parsing
      const workerCode = `
        importScripts('https://unpkg.com/papaparse@5/papaparse.min.js');

        self.onmessage = function(e) {
          const { file } = e.data;

          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
              self.postMessage({ type: 'complete', data: results });
            },
            error: function(error) {
              self.postMessage({ type: 'error', error: error.message });
            }
          });
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (e) => {
        const { type, data, error } = e.data;
        if (type === 'complete') {
          resolve(data);
        } else if (type === 'error') {
          reject(new Error(error));
        }
        this.worker?.terminate();
      };

      this.worker.postMessage({ file });
    });
  }
}

// Export functions
export const exportToCSV = (
  clients: Client[],
  config: ExportConfig = {
    filename: `clients_${new Date().toISOString().split('T')[0]}.csv`,
    columns: ['name', 'email', 'phone', 'brand', 'lastBookingDate', 'registrationDate', 'notes'],
    includeHeaders: true,
  }
): void => {
  try {
    // Transform data for export
    const exportData = clients.map(client => {
      const row: Record<string, any> = {};

      config.columns.forEach(column => {
        let value: any = client[column];

        // Format timestamps
        if (column === 'lastBookingDate' || column === 'registrationDate') {
          if (value && typeof value === 'object' && 'seconds' in value) {
            value = new Date((value as { seconds: number }).seconds * 1000).toISOString();
          } else if (!value) {
            value = '';
          }
        }

        // Format other fields
        if (column === 'createdAt' || column === 'updatedAt') {
          if (value && typeof value === 'object' && 'seconds' in value) {
            value = new Date((value as { seconds: number }).seconds * 1000).toISOString();
          }
        }

        row[column] = value || '';
      });

      return row;
    });

    // Generate CSV
    const csv = Papa.unparse(exportData, {
      header: config.includeHeaders,
    });

    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', config.filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('CSV export error:', error);
    throw new Error('Failed to export CSV');
  }
};

// Import functions
export const parseCSVFile = async (file: File): Promise<Papa.ParseResult<ImportRow>> => {
  const worker = new CSVWorker();
  return worker.parseCSV(file);
};

export const validateImportData = (parsedData: Papa.ParseResult<ImportRow>): ImportResult => {
  const errors: ImportValidationResult[] = [];
  const validData: ImportRow[] = [];

  parsedData.data.forEach((row, index) => {
    try {
      const validatedRow = validateImportRow(row);
      validData.push(validatedRow);
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const rowErrors = (error as any).errors.map((err: any) => {
          const field = err.path.join('.');
          return `${field}: ${err.message}`;
        });

        errors.push({
          row,
          errors: rowErrors,
          isValid: false,
          rowIndex: index + 1, // 1-based indexing for user display
        });
      }
    }
  });

  return {
    totalRows: parsedData.data.length,
    validRows: validData.length,
    invalidRows: errors.length,
    errors,
    data: validData,
  };
};

// Utility to convert ImportRow to CreateClient format
export const importRowToCreateClient = (row: ImportRow): Partial<Client> => {
  const client: Partial<Client> = {
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    brand: row.brand || 'Heiwa House',
    socials: {
      instagram: (row as any).instagram || '',
      facebook: (row as any).facebook || '',
      twitter: (row as any).twitter || '',
    },
    notes: row.notes || '',
  };

  // Handle date fields
  if (row.lastBookingDate) {
    try {
      const date = new Date(row.lastBookingDate);
      client.lastBookingDate = {
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
      };
    } catch {
      client.lastBookingDate = null;
    }
  } else {
    client.lastBookingDate = null;
  }

  if (row.registrationDate) {
    try {
      const date = new Date(row.registrationDate);
      client.registrationDate = {
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
      };
    } catch {
      // Default to current date if invalid
      const now = new Date();
      client.registrationDate = {
        seconds: Math.floor(now.getTime() / 1000),
        nanoseconds: 0,
      };
    }
  } else {
    // Default to current date
    const now = new Date();
    client.registrationDate = {
      seconds: Math.floor(now.getTime() / 1000),
      nanoseconds: 0,
    };
  }

  return client;
};

// Complete import flow
export const importClientsFromCSV = async (
  file: File
): Promise<ImportResult> => {
  try {
    // Parse CSV with progress callback
    const parsedData = await parseCSVFile(file);

    // Validate data
    const result = validateImportData(parsedData);

    return result;
  } catch (error) {
    console.error('CSV import error:', error);
    throw new Error('Failed to import CSV');
  }
};

// Generate CSV template
export const generateCSVTemplate = (): string => {
  const sampleData = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      brand: 'Heiwa House',
      instagram: '@johndoe',
      facebook: 'https://facebook.com/johndoe',
      twitter: '@doeX',
      lastBookingDate: '2024-01-15',
      registrationDate: '2023-12-01',
      notes: 'VIP client, prefers ocean view',
    }
  ];

  return Papa.unparse(sampleData, { header: true });
};

// Download CSV template
export const downloadCSVTemplate = (filename: string = 'clients_template.csv'): void => {
  const csv = generateCSVTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
