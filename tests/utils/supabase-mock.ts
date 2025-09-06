import { readFileSync } from 'fs';
import { join } from 'path';

// Load fixture data
const loadFixture = (filename: string) => {
  const filePath = join(__dirname, '..', 'fixtures', filename);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
};

const clients = loadFixture('clients.json');
const rooms = loadFixture('rooms.json');
const surfCamps = loadFixture('surf-camps.json');
const bookings = loadFixture('bookings.json');
const payments = loadFixture('payments.json');

// Mock data store
const mockData = {
  clients,
  rooms,
  surf_camps: surfCamps,
  bookings,
  payments,
  room_assignments: [],
  camp_weeks: [],
  add_ons: [],
  invoices: [],
  automations: [],
  external_calendar_events: [],
  feature_flags: []
};

// Mock query builder
class MockQueryBuilder {
  private table: string;
  private selectFields: string = '*';
  private whereConditions: any[] = [];
  private orderByField: string | null = null;
  private orderDirection: 'asc' | 'desc' = 'asc';
  private limitCount: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'neq', value });
    return this;
  }

  in(column: string, values: any[]) {
    this.whereConditions.push({ column, operator: 'in', values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderByField = column;
    this.orderDirection = options?.ascending === false ? 'desc' : 'asc';
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async then(resolve: (result: any) => void) {
    try {
      let data = mockData[this.table as keyof typeof mockData] || [];
      
      // Apply where conditions
      data = data.filter((item: any) => {
        return this.whereConditions.every(condition => {
          const value = item[condition.column];
          switch (condition.operator) {
            case 'eq':
              return value === condition.value;
            case 'neq':
              return value !== condition.value;
            case 'in':
              return condition.values.includes(value);
            default:
              return true;
          }
        });
      });

      // Apply ordering
      if (this.orderByField) {
        data.sort((a: any, b: any) => {
          const aVal = a[this.orderByField!];
          const bVal = b[this.orderByField!];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return this.orderDirection === 'desc' ? -comparison : comparison;
        });
      }

      // Apply limit
      if (this.limitCount) {
        data = data.slice(0, this.limitCount);
      }

      resolve({ data, error: null });
    } catch (error) {
      resolve({ data: null, error });
    }
  }
}

// Mock insert builder
class MockInsertBuilder {
  private table: string;
  private insertData: any;

  constructor(table: string) {
    this.table = table;
  }

  values(data: any) {
    this.insertData = data;
    return this;
  }

  async then(resolve: (result: any) => void) {
    try {
      const newItem = {
        ...this.insertData,
        id: this.insertData.id || `${this.table}_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const tableData = mockData[this.table as keyof typeof mockData] as any[];
      tableData.push(newItem);

      resolve({ data: [newItem], error: null });
    } catch (error) {
      resolve({ data: null, error });
    }
  }
}

// Mock update builder
class MockUpdateBuilder {
  private table: string;
  private updateData: any;
  private whereConditions: any[] = [];

  constructor(table: string) {
    this.table = table;
  }

  set(data: any) {
    this.updateData = data;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'eq', value });
    return this;
  }

  async then(resolve: (result: any) => void) {
    try {
      const tableData = mockData[this.table as keyof typeof mockData] as any[];
      const updatedItems: any[] = [];

      for (let i = 0; i < tableData.length; i++) {
        const item = tableData[i];
        const matches = this.whereConditions.every(condition => {
          return item[condition.column] === condition.value;
        });

        if (matches) {
          const updatedItem = {
            ...item,
            ...this.updateData,
            updated_at: new Date().toISOString()
          };
          tableData[i] = updatedItem;
          updatedItems.push(updatedItem);
        }
      }

      resolve({ data: updatedItems, error: null });
    } catch (error) {
      resolve({ data: null, error });
    }
  }
}

// Mock delete builder
class MockDeleteBuilder {
  private table: string;
  private whereConditions: any[] = [];

  constructor(table: string) {
    this.table = table;
  }

  eq(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'eq', value });
    return this;
  }

  async then(resolve: (result: any) => void) {
    try {
      const tableData = mockData[this.table as keyof typeof mockData] as any[];
      const deletedItems: any[] = [];

      for (let i = tableData.length - 1; i >= 0; i--) {
        const item = tableData[i];
        const matches = this.whereConditions.every(condition => {
          return item[condition.column] === condition.value;
        });

        if (matches) {
          deletedItems.push(tableData.splice(i, 1)[0]);
        }
      }

      resolve({ data: deletedItems, error: null });
    } catch (error) {
      resolve({ data: null, error });
    }
  }
}

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockClient = {
    from: (table: string) => ({
      select: (fields?: string) => new MockQueryBuilder(table).select(fields),
      insert: (data: any) => new MockInsertBuilder(table).values(data),
      update: (data: any) => new MockUpdateBuilder(table).set(data),
      delete: () => new MockDeleteBuilder(table),
    }),

    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Mock admin emails
        const adminEmails = [
          'julianmjavierm@gmail.com',
          'julian@fyves.com',
          'admin@heiwa.house',
          'manager@heiwa.house',
          'laurence@fyves.com'
        ];

        if (adminEmails.includes(email) && password === 'test123') {
          return {
            data: {
              user: {
                id: 'user_123',
                email,
                user_metadata: { display_name: email.split('@')[0] }
              },
              session: {
                access_token: 'mock_token_123',
                refresh_token: 'mock_refresh_123'
              }
            },
            error: null
          };
        }

        return {
          data: null,
          error: { message: 'Invalid credentials' }
        };
      },

      signOut: async () => {
        return { error: null };
      },

      getSession: async () => {
        return {
          data: { session: null },
          error: null
        };
      },

      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      }
    },

    // Mock real-time subscriptions
    channel: (channelName: string) => ({
      on: (event: string, filter: any, callback: (payload: any) => void) => {
        // Simulate real-time events
        setTimeout(() => {
          callback({
            eventType: 'INSERT',
            new: mockData.bookings[0],
            old: null,
            schema: 'public',
            table: 'bookings'
          });
        }, 1000);
        return {
          subscribe: () => {}
        };
      },
      subscribe: () => {}
    })
  };

  return mockClient;
};

export default createMockSupabaseClient;
