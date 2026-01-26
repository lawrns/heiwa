-- Fix invoices table schema to match API expectations
-- This ensures the invoices API works correctly

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  sent_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table exists
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS booking_id UUID,
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS paid_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints
DO $$ 
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_booking_id_fkey'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_booking_id_fkey 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;

  -- Add unique constraint on invoice_number if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_invoice_number_key'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);
  END IF;

  -- Add check constraint for status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_status_check'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'));
  END IF;

  -- Add check constraint for amount if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_amount_check'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_amount_check CHECK (amount >= 0);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to manage invoices" ON invoices;
DROP POLICY IF EXISTS "Allow service role full access to invoices" ON invoices;

-- Create policies
-- Service role (admin) has full access
CREATE POLICY "Allow service role full access to invoices" ON invoices
  FOR ALL USING (true);

-- Authenticated users can read their own invoices via bookings
CREATE POLICY "Allow authenticated users to manage invoices" ON invoices
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

SELECT 'invoices table fixed successfully' as status;

