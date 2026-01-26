/**
 * Base Repository - Generic database access layer
 *
 * Provides type-safe CRUD operations with consistent error handling.
 * Extend this class for entity-specific repositories.
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type TableName = keyof Database['public']['Tables'];

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderAsc?: boolean;
}

export interface QueryResult<T> {
  data: T[];
  count: number;
  error: string | null;
}

export interface SingleResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Base repository class with generic CRUD operations
 */
export class BaseRepository<
  TTable extends TableName,
  TRow = Database['public']['Tables'][TTable]['Row'],
  TInsert = Database['public']['Tables'][TTable]['Insert'],
  TUpdate = Database['public']['Tables'][TTable]['Update']
> {
  protected tableName: TTable;

  constructor(tableName: TTable) {
    this.tableName = tableName;
  }

  /**
   * Get all records with optional pagination and sorting
   */
  async findAll(options: QueryOptions = {}): Promise<QueryResult<TRow>> {
    const { limit, offset = 0, orderBy = 'created_at', orderAsc = false } = options;

    let query = supabaseAdmin
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending: orderAsc });

    if (limit !== undefined) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      return { data: [], count: 0, error: error.message };
    }

    return {
      data: (data || []) as TRow[],
      count: count || 0,
      error: null,
    };
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string): Promise<SingleResult<TRow>> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null }; // Not found is not an error
      }
      console.error(`Error fetching ${this.tableName} by id:`, error);
      return { data: null, error: error.message };
    }

    return { data: data as TRow, error: null };
  }

  /**
   * Find records by a specific field value
   */
  async findBy(field: string, value: unknown): Promise<QueryResult<TRow>> {
    const { data, error, count } = await supabaseAdmin
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq(field, value);

    if (error) {
      console.error(`Error fetching ${this.tableName} by ${field}:`, error);
      return { data: [], count: 0, error: error.message };
    }

    return {
      data: (data || []) as TRow[],
      count: count || 0,
      error: null,
    };
  }

  /**
   * Find a single record by field value
   */
  async findOneBy(field: string, value: unknown): Promise<SingleResult<TRow>> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('*')
      .eq(field, value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      console.error(`Error fetching ${this.tableName} by ${field}:`, error);
      return { data: null, error: error.message };
    }

    return { data: data as TRow, error: null };
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<SingleResult<TRow>> {
    const { data: created, error } = await supabaseAdmin
      .from(this.tableName)
      .insert(data as Database['public']['Tables'][TTable]['Insert'])
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      return { data: null, error: error.message };
    }

    return { data: created as TRow, error: null };
  }

  /**
   * Create multiple records
   */
  async createMany(items: TInsert[]): Promise<QueryResult<TRow>> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert(items as Database['public']['Tables'][TTable]['Insert'][])
      .select();

    if (error) {
      console.error(`Error creating multiple ${this.tableName}:`, error);
      return { data: [], count: 0, error: error.message };
    }

    return {
      data: (data || []) as TRow[],
      count: data?.length || 0,
      error: null,
    };
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: TUpdate): Promise<SingleResult<TRow>> {
    const { data: updated, error } = await supabaseAdmin
      .from(this.tableName)
      .update(data as Database['public']['Tables'][TTable]['Update'])
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return { data: null, error: error.message };
    }

    return { data: updated as TRow, error: null };
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabaseAdmin
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  }

  /**
   * Check if a record exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const { count } = await supabaseAdmin
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('id', id);

    return (count || 0) > 0;
  }

  /**
   * Count records matching a condition
   */
  async count(field?: string, value?: unknown): Promise<number> {
    let query = supabaseAdmin
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (field && value !== undefined) {
      query = query.eq(field, value);
    }

    const { count } = await query;
    return count || 0;
  }
}
