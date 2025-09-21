-- pgTAP tests for database schema validation
-- Tests table existence, column definitions, constraints, and relationships

-- Test table existence
SELECT plan(50);

-- Core entity tables
SELECT has_table('brand');
SELECT has_table('property');
SELECT has_table('camp_week');
SELECT has_table('room');
SELECT has_table('bed');
SELECT has_table('addon');
SELECT has_table('customer');
SELECT has_table('bookings');
SELECT has_table('booking_bed');
SELECT has_table('booking_addon');
SELECT has_table('payments');
SELECT has_table('promo_code');
SELECT has_table('owner');
SELECT has_table('admin');
SELECT has_table('webhook_event');

-- Junction tables
SELECT has_table('room_assignments'); -- Legacy table
SELECT has_table('invoices'); -- Legacy table

-- System tables
SELECT has_table('clients'); -- Legacy table
SELECT has_table('surf_camps'); -- Legacy table
SELECT has_table('add_ons'); -- Legacy table
SELECT has_table('automations');
SELECT has_table('external_calendar_events');
SELECT has_table('feature_flags');

-- Test brand table structure
SELECT has_column('brand', 'id');
SELECT has_column('brand', 'name');
SELECT has_column('brand', 'slug');
SELECT has_column('brand', 'theme_config');
SELECT has_column('brand', 'api_config');
SELECT has_column('brand', 'is_active');
SELECT has_column('brand', 'created_at');
SELECT has_column('brand', 'updated_at');

SELECT col_type_is('brand', 'id', 'uuid');
SELECT col_type_is('brand', 'name', 'text');
SELECT col_type_is('brand', 'slug', 'text');
SELECT col_type_is('brand', 'theme_config', 'jsonb');
SELECT col_type_is('brand', 'api_config', 'jsonb');
SELECT col_type_is('brand', 'is_active', 'boolean');
SELECT col_type_is('brand', 'created_at', 'timestamp with time zone');
SELECT col_type_is('brand', 'updated_at', 'timestamp with time zone');

-- Test brand constraints
SELECT col_is_unique('brand', 'slug');
SELECT col_not_null('brand', 'name');
SELECT col_not_null('brand', 'slug');
SELECT col_not_null('brand', 'theme_config');
SELECT col_not_null('brand', 'api_config');

-- Test property table structure
SELECT has_column('property', 'id');
SELECT has_column('property', 'brand_id');
SELECT has_column('property', 'name');
SELECT has_column('property', 'description');
SELECT has_column('property', 'location');
SELECT has_column('property', 'contact_info');
SELECT has_column('property', 'owner_id');
SELECT has_column('property', 'is_active');
SELECT has_column('property', 'created_at');
SELECT has_column('property', 'updated_at');

SELECT col_type_is('property', 'brand_id', 'uuid');
SELECT col_type_is('property', 'location', 'jsonb');
SELECT col_type_is('property', 'contact_info', 'jsonb');

-- Test foreign key relationships
SELECT fk_ok('property', 'brand_id', 'brand', 'id');
SELECT fk_ok('camp_week', 'property_id', 'property', 'id');
SELECT fk_ok('room', 'property_id', 'property', 'id');
SELECT fk_ok('addon', 'property_id', 'property', 'id');
SELECT fk_ok('bed', 'room_id', 'room', 'id');
SELECT fk_ok('booking_bed', 'booking_id', 'bookings', 'id');
SELECT fk_ok('booking_bed', 'bed_id', 'bed', 'id');
SELECT fk_ok('booking_addon', 'booking_id', 'bookings', 'id');
SELECT fk_ok('booking_addon', 'addon_id', 'addon', 'id');

-- Test primary keys
SELECT has_pk('brand');
SELECT has_pk('property');
SELECT has_pk('camp_week');
SELECT has_pk('room');
SELECT has_pk('bed');
SELECT has_pk('addon');
SELECT has_pk('customer');
SELECT has_pk('bookings');
SELECT has_pk('payments');
SELECT has_pk('promo_code');
SELECT has_pk('owner');
SELECT has_pk('admin');
SELECT has_pk('webhook_event');

-- Test indexes exist
SELECT has_index('brand', 'idx_brand_slug');
SELECT has_index('property', 'idx_property_brand_id');
SELECT has_index('camp_week', 'idx_camp_week_property_id');
SELECT has_index('room', 'idx_room_property_id');
SELECT has_index('bed', 'idx_bed_room_id');
SELECT has_index('customer', 'idx_customer_email');
SELECT has_index('bookings', 'idx_bookings_customer_id');
SELECT has_index('payments', 'idx_payments_booking_id');

-- Test RLS is enabled on all tables
SELECT row_eq(
    'SELECT COUNT(*) FROM pg_class c JOIN pg_policy p ON c.oid = p.polrelid WHERE c.relname = ''brand'' AND c.relrowsecurity = true',
    ROW(1::bigint),
    'RLS is enabled on brand table'
);

-- Test required functions exist
SELECT has_function('get_available_beds');
SELECT has_function('calculate_booking_price');
SELECT has_function('validate_promo_code');
SELECT has_function('get_property_availability');
SELECT has_function('user_can_manage_property');
SELECT has_function('user_owns_booking');
SELECT has_function('is_duplicate_webhook_event');
SELECT has_function('update_webhook_processing');

-- Test function signatures
SELECT function_returns('get_available_beds', ARRAY['uuid', 'date', 'date'], 'TABLE(bed_id uuid, room_id uuid, room_name text, bed_name text, bed_type text, price_modifier numeric, is_available boolean)');
SELECT function_returns('calculate_booking_price', ARRAY['uuid', 'uuid', 'uuid[]', 'jsonb', 'text', 'date', 'date'], 'jsonb');
SELECT function_returns('validate_promo_code', ARRAY['text', 'uuid', 'numeric'], 'jsonb');

-- Test triggers exist
SELECT has_trigger('brand', 'update_brand_updated_at');
SELECT has_trigger('property', 'update_property_updated_at');
SELECT has_trigger('camp_week', 'update_camp_week_updated_at');
SELECT has_trigger('room', 'update_room_updated_at');
SELECT has_trigger('bed', 'update_bed_updated_at');
SELECT has_trigger('customer', 'update_customer_updated_at');
SELECT has_trigger('bookings', 'update_bookings_updated_at');
SELECT has_trigger('payments', 'update_payments_updated_at');

-- Test seed data exists
SELECT results_eq(
    'SELECT COUNT(*) FROM brand WHERE is_active = true',
    ARRAY[2::bigint],
    'Seed data: 2 active brands'
);

SELECT results_eq(
    'SELECT COUNT(*) FROM property WHERE is_active = true',
    ARRAY[2::bigint],
    'Seed data: 2 active properties'
);

SELECT results_gt(
    'SELECT COUNT(*) FROM camp_week WHERE is_active = true',
    ARRAY[0::bigint],
    'Seed data: camp weeks exist'
);

-- Finish tests
SELECT * FROM finish();
