-- Create stripe_webhook_events table for idempotency tracking
-- This table ensures we don't process the same Stripe webhook event twice

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups by stripe_event_id
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id 
  ON stripe_webhook_events(stripe_event_id);

-- Create index for status queries (e.g., finding failed events to retry)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_status 
  ON stripe_webhook_events(status);

-- Create index for event type queries
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type 
  ON stripe_webhook_events(event_type);

-- Enable RLS
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access this table (no public access)
CREATE POLICY "Service role only access" ON stripe_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add stripe_customer_id to payments table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;

-- Add refund_amount to payments table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'refund_amount'
  ) THEN
    ALTER TABLE payments ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

COMMENT ON TABLE stripe_webhook_events IS 'Stores processed Stripe webhook events for idempotency';
COMMENT ON COLUMN stripe_webhook_events.stripe_event_id IS 'Unique event ID from Stripe';
COMMENT ON COLUMN stripe_webhook_events.event_type IS 'Type of Stripe event (e.g., payment_intent.succeeded)';
COMMENT ON COLUMN stripe_webhook_events.status IS 'Processing status: received, processed, or failed';
COMMENT ON COLUMN stripe_webhook_events.payload IS 'Full event payload from Stripe';
