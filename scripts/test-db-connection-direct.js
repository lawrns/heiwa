const { Client } = require('pg');
const dns = require('dns');

async function testConnection() {
  const connectionString = 'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres';

  console.log(`Testing connection to ${host}...`);

  // Try to resolve DNS first to see what we're dealing with
  dns.lookup(host, { all: true }, (err, addresses) => {
    if (err) {
      console.error('DNS Lookup failed:', err);
    } else {
      console.log('DNS Addresses:', addresses);
    }
  });

  const variations = [
    { port: 5432, ssl: { rejectUnauthorized: false } },
    { port: 6543, ssl: { rejectUnauthorized: false } },
    { port: 5432, ssl: false },
  ];

  for (const config of variations) {
    console.log(`\n--- Trying Port ${config.port}, SSL: ${JSON.stringify(config.ssl)} ---`);
    const client = new Client({
      host: host,
      port: config.port,
      user: user,
      password: password,
      database: database,
      ssl: config.ssl,
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log('SUCCESS!');
      const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 5");
      console.log('Tables found:', res.rows.map(r => r.table_name));
      await client.end();
      return; // Stop if successful
    } catch (err) {
      console.error('FAILED:', err.message);
    }
  }

  console.log('\nAll connection attempts failed. This might be a network restriction in this environment.');
}

testConnection();
