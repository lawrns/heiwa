-- pgTAP tests for Row Level Security policy validation
-- Tests that RLS policies correctly enforce data access controls

-- Test RLS policy functionality
SELECT plan(30);

-- Note: These tests require specific user contexts to validate properly
-- In a real test environment, you would set up test users with different roles

-- Test brand RLS policies
SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polrelid = ''brand''::regclass AND polname = ''Admin can manage brands''',
    ARRAY[1::bigint],
    'Brand admin policy exists'
);

SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polrelid = ''brand''::regclass AND polname = ''Public can view active brands''',
    ARRAY[1::bigint],
    'Brand public read policy exists'
);

-- Test property RLS policies
SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polrelid = ''property''::regclass AND polname LIKE ''%property%''',
    ARRAY[2::bigint],
    'Property policies exist'
);

-- Test customer privacy policies
SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polrelid = ''customer''::regclass AND polname LIKE ''%customer%''',
    ARRAY[2::bigint],
    'Customer privacy policies exist'
);

-- Test booking privacy policies
SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polrelid = ''bookings''::regclass',
    ARRAY[3::bigint],
    'Booking privacy policies exist'
);

-- Test payment security policies
SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polrelid = ''payments''::regclass',
    ARRAY[3::bigint],
    'Payment security policies exist'
);

-- Test helper functions exist
SELECT has_function('user_owns_booking');
SELECT has_function('user_can_manage_property');
SELECT has_function('user_can_access_booking');
SELECT has_function('user_owns_property');

-- Test RLS is enabled on sensitive tables
SELECT results_eq(
    'SELECT COUNT(*) FROM pg_class WHERE relname IN (''customer'', ''bookings'', ''payments'', ''webhook_event'') AND relrowsecurity = true',
    ARRAY[4::bigint],
    'RLS enabled on all sensitive tables'
);

-- Test public access is restricted appropriately
-- Note: These would require actual user context testing in integration tests

-- Test policy logic through function calls
SELECT results_eq(
    'SELECT user_owns_property(''550e8400-e29b-41d4-a716-446655440000''::uuid)',
    ARRAY[false],
    'user_owns_property returns false for non-existent property'
);

-- Test brand admin relationship table
SELECT has_table('brand_admins');
SELECT has_column('brand_admins', 'brand_id');
SELECT has_column('brand_admins', 'admin_id');
SELECT has_column('brand_admins', 'role');
SELECT fk_ok('brand_admins', 'brand_id', 'brand', 'id');
SELECT fk_ok('brand_admins', 'admin_id', 'admin', 'id');

-- Test ownership hierarchy view exists
SELECT has_view('property_ownership_hierarchy');

-- Test audit tables exist
SELECT has_table('privacy_audit_log');
SELECT has_table('payment_audit');

-- Test audit table policies
SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polrelid = ''privacy_audit_log''::regclass',
    ARRAY[1::bigint],
    'Privacy audit log has restricted access policy'
);

SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polrelid = ''payment_audit''::regclass',
    ARRAY[1::bigint],
    'Payment audit has restricted access policy'
);

-- Test data masking views exist
SELECT has_view('customer_payment_summary');

-- Test view policies
SELECT results_eq(
    'SELECT COUNT(*) FROM pg_policy WHERE polname LIKE ''%customer_payment_summary%''',
    ARRAY[1::bigint],
    'Customer payment summary view has access policy'
);

-- Test security monitoring views
SELECT has_view('payment_security_monitor');
SELECT has_view('booking_privacy_audit');

-- Test function security
SELECT function_is_definer('user_owns_booking');
SELECT function_is_definer('user_can_manage_property');
SELECT function_is_definer('user_can_access_payment');

-- Test that sensitive functions require authentication
-- Note: This would require actual session testing

-- Finish tests
SELECT * FROM finish();
