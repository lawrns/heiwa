const { Client } = require('pg');

// Database connection
const client = new Client({
  connectionString: 'postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function addSocialsColumn() {
  try {
    console.log('Connecting to database...');
    await client.connect();

    console.log('Adding socials column to clients table...');
    await client.query(`
      ALTER TABLE public.clients
      ADD COLUMN IF NOT EXISTS socials JSONB NOT NULL DEFAULT '{}'::jsonb;
    `);

    console.log('Adding comment...');
    await client.query(`
      COMMENT ON COLUMN public.clients.socials IS 'Social media profiles stored as JSONB object with keys like instagram, facebook, twitter';
    `);

    console.log('✅ Socials column added successfully!');
  } catch (error) {
    console.error('❌ Error adding socials column:', error.message);
  } finally {
    await client.end();
  }
}

addSocialsColumn();
