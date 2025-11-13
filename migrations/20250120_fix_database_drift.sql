-- Migration: Fix Database Drift
-- Date: 2025-01-20
-- Purpose: Align database schema with application expectations

-- ============================================
-- 1. Fix payments table - Add missing columns
-- ============================================

-- Add refund_amount column
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2) DEFAULT 0 CHECK (refund_amount >= 0);

-- Add refund_reason column
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- Add notes column
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update payment_status check constraint to include 'partially_refunded'
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_status_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_payment_status_check 
CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded'));

-- Update payment_method check constraint to include 'paypal'
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_method_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_payment_method_check 
CHECK (payment_method IN ('stripe', 'cash', 'transfer', 'paypal', 'other'));

-- Fix currency default to EUR (was USD)
ALTER TABLE payments 
ALTER COLUMN currency SET DEFAULT 'EUR';

-- ============================================
-- 2. Fix surf_camp_enrollments table - Add missing columns
-- ============================================

-- Add skill_level column
ALTER TABLE surf_camp_enrollments 
ADD COLUMN IF NOT EXISTS skill_level TEXT;

-- Add dietary_restrictions column
ALTER TABLE surf_camp_enrollments 
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;

-- Add emergency_contact column
ALTER TABLE surf_camp_enrollments 
ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}';

-- Add notes column
ALTER TABLE surf_camp_enrollments 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add enrolled_at column
ALTER TABLE surf_camp_enrollments 
ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update status constraint to match migration
ALTER TABLE surf_camp_enrollments 
DROP CONSTRAINT IF EXISTS surf_camp_enrollments_status_check;

ALTER TABLE surf_camp_enrollments 
ADD CONSTRAINT surf_camp_enrollments_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'enrolled'));

-- Update status default to 'pending' (was 'enrolled')
ALTER TABLE surf_camp_enrollments 
ALTER COLUMN status SET DEFAULT 'pending';

-- Make surf_camp_id and client_id NOT NULL (they should be required)
ALTER TABLE surf_camp_enrollments 
ALTER COLUMN surf_camp_id SET NOT NULL;

ALTER TABLE surf_camp_enrollments 
ALTER COLUMN client_id SET NOT NULL;

-- Update unique constraint to match migration (surf_camp_id, client_id only)
ALTER TABLE surf_camp_enrollments 
DROP CONSTRAINT IF EXISTS surf_camp_enrollments_surf_camp_id_client_id_booking_id_key;

ALTER TABLE surf_camp_enrollments 
ADD CONSTRAINT surf_camp_enrollments_surf_camp_client_unique 
UNIQUE (surf_camp_id, client_id);

-- ============================================
-- 3. Add missing indexes
-- ============================================

-- Index for payments refund queries
CREATE INDEX IF NOT EXISTS idx_payments_refund_amount ON payments(refund_amount) WHERE refund_amount > 0;

-- Index for payments status queries
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON payments(payment_status);

-- Index for payments payment_method queries
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- Index for enrollments status queries
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON surf_camp_enrollments(status);

-- Index for enrollments enrolled_at queries
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON surf_camp_enrollments(enrolled_at DESC);

-- ============================================
-- 4. Add comments for documentation
-- ============================================

COMMENT ON COLUMN payments.refund_amount IS 'Amount refunded from this payment';
COMMENT ON COLUMN payments.refund_reason IS 'Reason for refund';
COMMENT ON COLUMN payments.notes IS 'Additional notes about the payment';

COMMENT ON COLUMN surf_camp_enrollments.skill_level IS 'Surf skill level of the enrolled participant';
COMMENT ON COLUMN surf_camp_enrollments.dietary_restrictions IS 'Dietary restrictions or preferences';
COMMENT ON COLUMN surf_camp_enrollments.emergency_contact IS 'Emergency contact information (JSON)';
COMMENT ON COLUMN surf_camp_enrollments.enrolled_at IS 'Timestamp when enrollment was confirmed';


