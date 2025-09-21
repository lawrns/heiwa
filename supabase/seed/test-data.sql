-- Seed data for testing all system functionality
-- Includes brands, properties, camp weeks, rooms, beds, addons, and sample bookings

-- Brands are already seeded in migration T005

-- Properties are already seeded in migration T006

-- Camp weeks are already seeded in migration T007

-- Rooms and beds are already seeded in migration T008

-- Addons are already seeded in migration T009

-- Promo codes are already seeded in migration T008

-- Create test customers
INSERT INTO customer (email, first_name, last_name, phone, date_of_birth, preferences) VALUES
('john.doe@example.com', 'John', 'Doe', '+1-555-0123', '1990-05-15', '{"language": "en", "notifications": true}'),
('jane.smith@example.com', 'Jane', 'Smith', '+1-555-0124', '1985-08-22', '{"language": "es", "notifications": true}'),
('mike.johnson@example.com', 'Mike', 'Johnson', '+1-555-0125', '1992-03-10', '{"language": "en", "notifications": false}'),
('sarah.wilson@example.com', 'Sarah', 'Wilson', '+1-555-0126', '1988-11-30', '{"language": "es", "notifications": true}');

-- Create test bookings
INSERT INTO bookings (customer_id, camp_week_id, status, total_amount, currency, check_in_date, check_out_date, special_requests) VALUES
((SELECT id FROM customer WHERE email = 'john.doe@example.com'), (SELECT id FROM camp_week WHERE name = 'Summer Surf Week 1'), 'confirmed', 1200.00, 'USD', '2025-07-07', '2025-07-14', 'Vegetarian meals please'),
((SELECT id FROM customer WHERE email = 'jane.smith@example.com'), (SELECT id FROM camp_week WHERE name = 'Beginner Surf Week 1'), 'paid', 950.00, 'USD', '2025-07-07', '2025-07-14', NULL);

-- Assign beds to bookings
INSERT INTO booking_bed (booking_id, bed_id) VALUES
((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'john.doe@example.com')), (SELECT id FROM bed WHERE name = 'Top Bunk A1')),
((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'jane.smith@example.com')), (SELECT id FROM bed WHERE name = 'Bunk 1 Top'));

-- Add addons to bookings
INSERT INTO booking_addon (booking_id, addon_id, quantity, unit_price, total_price) VALUES
((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'john.doe@example.com')), (SELECT id FROM addon WHERE name = 'Surfboard Rental'), 1, 150.00, 150.00),
((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'john.doe@example.com')), (SELECT id FROM addon WHERE name = 'Private Surf Lesson'), 2, 80.00, 160.00);

-- Create payments for bookings
INSERT INTO payments (booking_id, amount, currency, payment_method, payment_status, transaction_id, payment_date) VALUES
((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'john.doe@example.com')), 1510.00, 'USD', 'stripe', 'completed', 'pi_test_1234567890', '2025-06-01 10:00:00+00'),
((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'jane.smith@example.com')), 950.00, 'USD', 'stripe', 'completed', 'pi_test_0987654321', '2025-06-02 14:30:00+00');

-- Create test webhook events
INSERT INTO webhook_event (stripe_event_id, event_type, event_data, processed) VALUES
('evt_test_payment_succeeded_123', 'payment_intent.succeeded', '{
  "object": {
    "id": "pi_test_1234567890",
    "amount": 151000,
    "currency": "usd",
    "status": "succeeded",
    "metadata": {
      "booking_id": "' || (SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'john.doe@example.com')) || '"
    }
  }
}', true),
('evt_test_payment_succeeded_456', 'payment_intent.succeeded', '{
  "object": {
    "id": "pi_test_0987654321",
    "amount": 95000,
    "currency": "usd",
    "status": "succeeded",
    "metadata": {
      "booking_id": "' || (SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'jane.smith@example.com')) || '"
    }
  }
}', true);

-- Create test admin and owner accounts
-- (Already created in T013 migration)

-- Update camp week booked counts based on test bookings
UPDATE camp_week SET booked_count = (
    SELECT COUNT(*) FROM bookings
    WHERE camp_week_id = camp_week.id
    AND status IN ('paid', 'confirmed')
);

-- Create some sample invoices
INSERT INTO invoices (booking_id, invoice_number, amount, currency, status, due_date, sent_date) VALUES
((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'john.doe@example.com')), 'INV-2025-001', 1510.00, 'USD', 'paid', '2025-07-01', '2025-06-01'),
((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM customer WHERE email = 'jane.smith@example.com')), 'INV-2025-002', 950.00, 'USD', 'paid', '2025-07-01', '2025-06-02');

-- Create sample external calendar events
INSERT INTO external_calendar_events (calendar_source, external_event_id, title, start_date, end_date, description) VALUES
('google', 'event_123', 'Surf Camp Orientation', '2025-07-06 18:00:00+00', '2025-07-06 20:00:00+00', 'Welcome session for new campers'),
('outlook', 'event_456', 'Beach Cleanup', '2025-07-10 09:00:00+00', '2025-07-10 12:00:00+00', 'Community service activity');

-- Enable a feature flag for testing
INSERT INTO feature_flags (flag_name, is_enabled, description) VALUES
('enable_promo_codes', true, 'Allow promotional codes in checkout'),
('enable_multi_brand', true, 'Support multiple surf camp brands'),
('enable_real_time_availability', true, 'Show live availability updates');

-- Create sample automation rules
INSERT INTO automations (name, trigger_type, trigger_conditions, actions, is_active) VALUES
('Welcome Email', 'booking_created', '{"status": "confirmed"}', '[{"type": "send_email", "template": "welcome"}]', true),
('Payment Reminder', 'booking_due', '{"days_overdue": 7}', '[{"type": "send_email", "template": "payment_reminder"}]', true);

-- Mark this as test data
COMMENT ON DATABASE postgres IS 'Contains test seed data for Heiwa Booking Suite development and testing';
