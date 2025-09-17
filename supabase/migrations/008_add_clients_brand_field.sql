-- 008_add_clients_brand_field.sql
-- Adds brand and registration_date columns to clients table
-- Backwards compatible: brand defaults to 'Heiwa House', registration_date defaults to created_at

BEGIN;

-- Add brand column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'clients' 
      AND column_name = 'brand'
  ) THEN
    ALTER TABLE public.clients 
      ADD COLUMN brand TEXT NOT NULL DEFAULT 'Heiwa House';
    COMMENT ON COLUMN public.clients.brand IS 'Brand association (Heiwa House or Freedom Routes)';
  END IF;
END$$;

-- Add registration_date column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'clients' 
      AND column_name = 'registration_date'
  ) THEN
    ALTER TABLE public.clients 
      ADD COLUMN registration_date TIMESTAMPTZ DEFAULT NOW();
    COMMENT ON COLUMN public.clients.registration_date IS 'Date when client first registered';
    
    -- Update existing rows to use created_at as registration_date
    UPDATE public.clients 
    SET registration_date = created_at 
    WHERE registration_date IS NULL;
  END IF;
END$$;

-- Add constraint to ensure brand is valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_schema = 'public' 
      AND table_name = 'clients' 
      AND constraint_name = 'clients_brand_check'
  ) THEN
    ALTER TABLE public.clients 
      ADD CONSTRAINT clients_brand_check 
      CHECK (brand IN ('Heiwa House', 'Freedom Routes'));
  END IF;
END$$;

COMMIT;
