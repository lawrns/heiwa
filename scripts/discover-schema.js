
const { createClient } = require('@supabase/supabase-js');

async function discoverSchema() {
  const supabaseUrl = 'https://pguipwhrxdzzrndbluxb.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  const tables = ['homepage_content', 'rooms', 'surf_camps', 'testimonials', 'bookings', 'clients'];

  console.log('--- SCHEMA DISCOVERY ---');

  for (const table of tables) {
    console.log(`\n[Table: ${table}]`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
      continue;
    }
    
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]).join(', '));
      console.log('Sample Data:', data[0]);
    } else {
      console.log('Table is empty.');
    }
  }

  console.log('\n--- DISCOVERY COMPLETE ---');
}

discoverSchema();
