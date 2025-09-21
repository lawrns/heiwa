-- pgTAP tests for RPC function validation
-- Tests that RPC functions return correct data and handle edge cases

-- Test RPC function behavior
SELECT plan(25);

-- Test get_available_beds function exists and has correct signature
SELECT has_function('get_available_beds');
SELECT function_returns('get_available_beds', ARRAY['uuid', 'date', 'date'], 'TABLE(bed_id uuid, room_id uuid, room_name text, bed_name text, bed_type text, price_modifier numeric, is_available boolean)');

-- Test calculate_booking_price function
SELECT has_function('calculate_booking_price');
SELECT function_returns('calculate_booking_price', ARRAY['uuid', 'uuid', 'uuid[]', 'jsonb', 'text', 'date', 'date'], 'jsonb');

-- Test validate_promo_code function
SELECT has_function('validate_promo_code');
SELECT function_returns('validate_promo_code', ARRAY['text', 'uuid', 'numeric'], 'jsonb');

-- Test get_property_availability function
SELECT has_function('get_property_availability');
SELECT function_returns('get_property_availability', ARRAY['uuid', 'date', 'date'], 'TABLE(camp_week_id uuid, camp_week_name text, start_date date, end_date date, base_price numeric, capacity integer, booked_count integer, available_beds integer, available_capacity integer, is_available boolean)');

-- Test function behavior with invalid inputs
SELECT throws_ok(
    'SELECT * FROM get_available_beds(''00000000-0000-0000-0000-000000000000''::uuid)',
    'Camp week not found or inactive',
    'get_available_beds handles invalid camp week ID'
);

-- Test promo code validation
SELECT results_eq(
    'SELECT (validate_promo_code(''INVALID'', ''550e8400-e29b-41d4-a716-446655440000''::uuid))->>''valid''',
    ARRAY['false'::text],
    'validate_promo_code returns false for invalid code'
);

-- Test calculate_booking_price with empty bed array
SELECT throws_ok(
    'SELECT calculate_booking_price(''550e8400-e29b-41d4-a716-446655440000''::uuid, ''550e8400-e29b-41d4-a716-446655440002''::uuid, ARRAY[]::uuid[])',
    'No valid beds selected',
    'calculate_booking_price handles empty bed selection'
);

-- Test property availability with invalid property
SELECT throws_ok(
    'SELECT * FROM get_property_availability(''00000000-0000-0000-0000-000000000000''::uuid)',
    'Property not found or inactive',
    'get_property_availability handles invalid property ID'
);

-- Test promo code with valid data (requires seed data)
SELECT lives_ok(
    'SELECT validate_promo_code(''SUMMER25'', (SELECT id FROM brand WHERE slug = ''heiwa-house''), 1200.00)',
    'validate_promo_code handles valid promo code without error'
);

-- Test booking price calculation with valid data
SELECT lives_ok(
    'SELECT calculate_booking_price(
        (SELECT id FROM brand WHERE slug = ''heiwa-house''),
        (SELECT id FROM camp_week LIMIT 1),
        ARRAY[(SELECT id FROM bed LIMIT 1)],
        ''{}''::jsonb,
        NULL,
        NULL,
        NULL
    )',
    'calculate_booking_price handles valid inputs without error'
);

-- Test JSON structure of calculate_booking_price response
SELECT results_eq(
    'SELECT jsonb_typeof(calculate_booking_price(
        (SELECT id FROM brand WHERE slug = ''heiwa-house''),
        (SELECT id FROM camp_week LIMIT 1),
        ARRAY[(SELECT id FROM bed LIMIT 1)],
        ''{}''::jsonb
    ))',
    ARRAY['object'::text],
    'calculate_booking_price returns valid JSON object'
);

-- Test required fields in calculate_booking_price response
SELECT ok(
    'SELECT calculate_booking_price(
        (SELECT id FROM brand WHERE slug = ''heiwa-house''),
        (SELECT id FROM camp_week LIMIT 1),
        ARRAY[(SELECT id FROM bed LIMIT 1)],
        ''{}''::jsonb
    ) ? ''pricing''',
    'calculate_booking_price response includes pricing object'
);

SELECT ok(
    'SELECT calculate_booking_price(
        (SELECT id FROM brand WHERE slug = ''heiwa-house''),
        (SELECT id FROM camp_week LIMIT 1),
        ARRAY[(SELECT id FROM bed LIMIT 1)],
        ''{}''::jsonb
    ) ? ''grand_total''',
    'calculate_booking_price response includes grand_total'
);

-- Test property availability returns expected columns
SELECT results_eq(
    'SELECT COUNT(*) FROM information_schema.columns
     WHERE table_name = ''get_property_availability''
     AND column_name IN (''camp_week_id'', ''camp_week_name'', ''start_date'', ''end_date'', ''is_available'')',
    ARRAY[5::bigint],
    'get_property_availability returns expected columns'
);

-- Test date range validation in get_available_beds
SELECT throws_ok(
    'SELECT * FROM get_available_beds(
        (SELECT id FROM camp_week LIMIT 1),
        ''2025-07-22''::date,
        ''2025-07-15''::date
    )',
    'Requested dates must be within camp week range',
    'get_available_beds validates date range order'
);

-- Test promo code minimum amount validation
SELECT results_eq(
    'SELECT (validate_promo_code(''SUMMER25'', (SELECT id FROM brand WHERE slug = ''heiwa-house''), 500.00))->>''valid''',
    ARRAY['false'::text],
    'validate_promo_code enforces minimum amount'
);

-- Test function idempotency and error handling
SELECT lives_ok(
    'SELECT is_duplicate_webhook_event(''test_event_123'')',
    'is_duplicate_webhook_event function works'
);

-- Test update_webhook_processing function
SELECT lives_ok(
    'SELECT update_webhook_processing(''test_event_123'', true)',
    'update_webhook_processing function works'
);

-- Test that functions handle NULL inputs appropriately
SELECT lives_ok(
    'SELECT * FROM get_available_beds((SELECT id FROM camp_week LIMIT 1), NULL, NULL)',
    'get_available_beds handles NULL date parameters'
);

-- Finish tests
SELECT * FROM finish();
