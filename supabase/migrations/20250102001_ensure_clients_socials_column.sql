-- 20250102001_ensure_clients_socials_column.sql
-- Ensure the socials column exists in clients table

BEGIN;

-- Add socials column if it doesn't exist
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS socials JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.clients.socials IS 'Social media profiles stored as JSONB object with keys like instagram, facebook, twitter';

COMMIT;
