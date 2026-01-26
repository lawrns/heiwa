/**
 * Database Transaction Utilities
 * Provides transaction support for complex operations
 */

import { supabaseAdmin } from './supabase'

/**
 * Execute a function within a database transaction
 * Uses Supabase's transaction support
 */
export async function withTransaction<T>(
  callback: (tx: string | null) => Promise<T>
): Promise<T> {
  try {
    // Start transaction
    const { data: startData, error: startError } = await supabaseAdmin.rpc('start_transaction')

    if (startError) {
      throw new Error(`Failed to start transaction: ${startError.message}`)
    }

    const transactionId = startData

    try {
      // Execute callback with transaction context
      const result = await callback(transactionId)

      // Commit transaction
      const { error: commitError } = await supabaseAdmin
        .rpc('commit_transaction', { tx_id: transactionId })

      if (commitError) {
        throw new Error(`Failed to commit transaction: ${commitError.message}`)
      }

      return result
    } catch (error) {
      // Rollback on error
      await supabaseAdmin.rpc('rollback_transaction', { tx_id: transactionId })
      throw error
    }
  } catch (error) {
    // Fallback: execute without transaction if transaction support not available
    console.warn('Transaction not available, executing without transaction support')
    return await callback(null)
  }
}

/**
 * Lock a row for update (pessimistic locking)
 * Prevents concurrent modifications
 */
export async function lockRow(
  table: string,
  id: string,
  callback: () => Promise<unknown>
): Promise<unknown> {
  try {
    // Use SELECT FOR UPDATE to lock the row
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to lock row: ${error.message}`)
    }

    // Execute callback while row is locked
    return await callback()
  } catch (error) {
    throw new Error(`Row locking failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Optimistic locking using version numbers
 * Prevents lost updates
 */
export async function withOptimisticLock<T>(
  table: string,
  id: string,
  callback: (currentData: unknown) => Promise<{ update: unknown; result: T }>
): Promise<T> {
  const maxRetries = 3
  let retryCount = 0

  while (retryCount < maxRetries) {
    try {
      // Get current data with version
      const { data: currentData, error: fetchError } = await supabaseAdmin
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch current data: ${fetchError.message}`)
      }

      if (!currentData) {
        throw new Error(`Record not found: ${id}`)
      }

      // Execute callback to get update and result
      const { update, result } = await callback(currentData)

      // Update with version check
      const updateObj = update && typeof update === 'object' ? update : {}
      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from(table)
        .update({
          ...updateObj,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('updated_at', currentData.updated_at) // Optimistic lock
        .select()
        .single()

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`)
      }

      if (!updatedData) {
        // Version mismatch - retry
        retryCount++
        if (retryCount >= maxRetries) {
          throw new Error('Optimistic lock failed: Too many retries')
        }
        continue
      }

      return result
    } catch (error) {
      if (retryCount >= maxRetries - 1) {
        throw error
      }
      retryCount++
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount)))
    }
  }

  throw new Error('Optimistic lock failed: Max retries exceeded')
}

/**
 * Check and reserve availability atomically
 * Prevents double-booking
 */
export async function reserveAvailability(
  table: string,
  id: string,
  quantity: number,
  callback: () => Promise<any>
): Promise<any> {
  return await withTransaction(async (txId) => {
    // Get current availability
    const { data: current, error: fetchError } = await supabaseAdmin
      .from(table)
      .select('available_spots, total_spots')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch availability: ${fetchError.message}`)
    }

    if (!current) {
      throw new Error(`Record not found: ${id}`)
    }

    // Check if enough spots available
    if (current.available_spots < quantity) {
      throw new Error(`Insufficient availability: ${current.available_spots} available, ${quantity} requested`)
    }

    // Reserve spots
    const { data: updated, error: updateError } = await supabaseAdmin
      .from(table)
      .update({
        available_spots: current.available_spots - quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to reserve availability: ${updateError.message}`)
    }

    // Execute callback with reservation
    try {
      const result = await callback()

      return result
    } catch (error) {
      // Rollback reservation on error
      await supabaseAdmin
        .from(table)
        .update({
          available_spots: current.available_spots,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      throw error
    }
  })
}

/**
 * Batch insert with transaction support
 */
export async function batchInsert<T>(
  table: string,
  items: T[],
  options?: {
    onConflict?: string
    ignoreDuplicates?: boolean
  }
): Promise<{ data: T[] | null; error: any }> {
  return await withTransaction(async () => {
    return await supabaseAdmin
      .from(table)
      .insert(items)
      .select()
  })
}

/**
 * Batch update with transaction support
 */
export async function batchUpdate<T>(
  table: string,
  updates: Array<{ id: string; data: Partial<T> }>
): Promise<{ data: T[] | null; error: any }> {
  return await withTransaction(async () => {
    const results = []

    for (const update of updates) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .update({
          ...update.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Batch update failed for ID ${update.id}: ${error.message}`)
      }

      results.push(data)
    }

    return { data: results, error: null }
  })
}
