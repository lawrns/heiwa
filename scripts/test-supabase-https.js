
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  const supabaseUrl = 'https://pguipwhrxdzzrndbluxb.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Testing Supabase connection via HTTPS...');

  try {
    // List tables using a raw SQL query via rpc if available, or just try to fetch from a known table
    // Let's try to fetch from 'homepage_content' or similar tables we saw in memories
    const { data: tables, error: tablesError } = await supabase
      .from('homepage_content')
      .select('*')
      .limit(1);

    if (tablesError) {
      console.log('Error fetching homepage_content:', tablesError.message);
    } else {
      console.log('Successfully fetched from homepage_content. Connection works!');
    }

    // Try to get all table names if possible
    // Note: Supabase doesn't have a direct "list tables" in the client, but we can try to query the schema
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_tables'); // Custom RPC might not exist

    if (schemaError) {
      console.log('RPC get_tables failed (expected if not defined):', schemaError.message);
    } else {
      console.log('Tables:', schemaData);
    }

    // Try a direct query to information_schema if allowed (usually restricted for anon/service role)
    // But let's try common tables
    const commonTables = ['bookings', 'rooms', 'clients', 'homepage_content', 'surf_camps', 'testimonials'];
    for (const table of commonTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`Table '${table}': NOT FOUND or ERROR (${error.message})`);
      } else {
        console.log(`Table '${table}': FOUND (${count} records)`);
      }
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSupabaseConnection();
