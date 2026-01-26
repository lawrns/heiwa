-- Create payments table if it doesn't exist
-- This ensures the payments API works correctly

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'EUR',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  transaction_id TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table exists
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS booking_id UUID,
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints
DO $$ 
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_booking_id_fkey'
  ) THEN
    ALTER TABLE payments 
    ADD CONSTRAINT payments_booking_id_fkey 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;

  -- Add check constraint for payment_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_payment_status_check'
  ) THEN
    ALTER TABLE payments 
    ADD CONSTRAINT payments_payment_status_check 
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'));
  END IF;

  -- Add check constraint for amount if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_amount_check'
  ) THEN
    ALTER TABLE payments 
    ADD CONSTRAINT payments_amount_check CHECK (amount >= 0);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to manage payments" ON payments;
DROP POLICY IF EXISTS "Allow service role full access to payments" ON payments;

-- Create policies
-- Service role (admin) has full access
CREATE POLICY "Allow service role full access to payments" ON payments
  FOR ALL USING (true);

-- Authenticated users can read their own payments via bookings
CREATE POLICY "Allow authenticated users to manage payments" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

SELECT 'payments table created successfully' as status;

