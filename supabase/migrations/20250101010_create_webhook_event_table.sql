-- Create webhook_event table for Stripe webhook tracking
CREATE TABLE webhook_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processing_attempts INTEGER DEFAULT 0 CHECK (processing_attempts >= 0),
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT webhook_event_stripe_id_not_empty CHECK (length(trim(stripe_event_id)) > 0),
    CONSTRAINT webhook_event_type_not_empty CHECK (length(trim(event_type)) > 0),
    CONSTRAINT webhook_event_attempts_valid CHECK (processing_attempts >= 0)
);

-- Add updated_at trigger
CREATE TRIGGER update_webhook_event_updated_at
    BEFORE UPDATE ON webhook_event
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_webhook_event_stripe_id ON webhook_event(stripe_event_id);
CREATE INDEX idx_webhook_event_type ON webhook_event(event_type);
CREATE INDEX idx_webhook_event_processed ON webhook_event(processed);
CREATE INDEX idx_webhook_event_created_at ON webhook_event(created_at DESC);
CREATE INDEX idx_webhook_event_processing_status ON webhook_event(processed, processing_attempts, created_at);

-- Add RLS policies
ALTER TABLE webhook_event ENABLE ROW LEVEL SECURITY;

-- Admin can view all webhook events (for monitoring and reconciliation)
CREATE POLICY "Admin can view all webhook events" ON webhook_event
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- System can insert webhook events (via service role)
CREATE POLICY "Allow webhook event creation" ON webhook_event
    FOR INSERT WITH CHECK (true);

-- System can update webhook events (for processing status)
CREATE POLICY "Allow webhook event updates" ON webhook_event
    FOR UPDATE USING (true);

-- No public read access - webhook data is sensitive
-- Only admin access for monitoring purposes

-- Create function to check for duplicate events (idempotency)
CREATE OR REPLACE FUNCTION is_duplicate_webhook_event(event_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM webhook_event WHERE stripe_event_id = event_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update webhook processing status
CREATE OR REPLACE FUNCTION update_webhook_processing(
    event_id TEXT,
    success BOOLEAN,
    error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE webhook_event
    SET
        processed = success,
        processing_attempts = processing_attempts + 1,
        last_attempt_at = NOW(),
        error_message = CASE WHEN success THEN NULL ELSE error_msg END,
        updated_at = NOW()
    WHERE stripe_event_id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
