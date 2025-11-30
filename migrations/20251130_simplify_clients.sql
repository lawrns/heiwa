-- Migration: Simplify clients table
-- Date: 2024-11-30
-- Description: Remove status system, add VIP flag, use deleted_at for soft delete

-- Add vip column (boolean, defaults to false)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS vip BOOLEAN DEFAULT FALSE;

-- Add deleted_at column for soft delete (replaces archived_at + status='archived')
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Migrate existing archived clients to use deleted_at
UPDATE clients
SET deleted_at = archived_at
WHERE archived_at IS NOT NULL AND deleted_at IS NULL;

-- Add index for filtering non-deleted clients
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at) WHERE deleted_at IS NULL;

-- Add index for VIP clients
CREATE INDEX IF NOT EXISTS idx_clients_vip ON clients(vip) WHERE vip = TRUE;

-- Note: We're NOT dropping the status and archived_at columns yet to allow for rollback
-- In a future migration, after confirming everything works, we can drop:
-- - status column
-- - archived_at column
