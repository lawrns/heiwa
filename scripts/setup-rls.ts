import { Client } from 'pg'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const databaseUrl = process.env.SUPABASE_DATABASE_URL!

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupRLS() {
  console.log('🔒 Setting up Row Level Security...')
  
  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Enable RLS on all tables
    const tables = [
      'clients', 'rooms', 'surf_camps', 'add_ons', 'bookings', 
      'camp_weeks', 'room_assignments', 'payments', 'invoices', 
      'automations', 'external_calendar_events', 'feature_flags'
    ]

    console.log('📝 Enabling RLS on all tables...')
    for (const table of tables) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`)
    }
    console.log('✅ RLS enabled on all tables')

    // Create admin check function
    console.log('👤 Creating admin check function...')
    await client.query(`
      CREATE OR REPLACE FUNCTION is_admin_user()
      RETURNS BOOLEAN AS $$
      BEGIN
        -- Check if the user's email is in the admin list
        RETURN auth.jwt() ->> 'email' IN (
          'julian@fyves.com',
          'julianmjavierm@gmail.com',
          'admin@heiwa.house',
          'manager@heiwa.house',
          'laurence@fyves.com'
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)
    console.log('✅ Admin check function created')

    // Create policies for each table
    console.log('🛡️ Creating RLS policies...')
    for (const table of tables) {
      const tableName = table.replace('_', ' ')
      
      await client.query(`
        CREATE POLICY "Admin can view all ${table}" ON ${table} FOR SELECT USING (is_admin_user());
      `)
      await client.query(`
        CREATE POLICY "Admin can insert ${table}" ON ${table} FOR INSERT WITH CHECK (is_admin_user());
      `)
      await client.query(`
        CREATE POLICY "Admin can update ${table}" ON ${table} FOR UPDATE USING (is_admin_user());
      `)
      await client.query(`
        CREATE POLICY "Admin can delete ${table}" ON ${table} FOR DELETE USING (is_admin_user());
      `)
    }
    console.log('✅ RLS policies created for all tables')

    console.log('🎉 RLS setup completed successfully!')
    
  } catch (error) {
    console.error('❌ RLS setup failed:', error)
  } finally {
    await client.end()
  }
}

// Run RLS setup
if (require.main === module) {
  setupRLS()
}
