
const { createClient } = require('@supabase/supabase-js');

async function auditDatabaseContent() {
  const supabaseUrl = 'https://pguipwhrxdzzrndbluxb.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('--- DATABASE CONTENT AUDIT ---');

  // 1. Homepage Sections
  const { data: homepage, error: hError } = await supabase.from('homepage_content').select('*');
  console.log('\n[Homepage Sections]');
  if (hError) console.error(hError.message);
  else homepage.forEach(s => console.log(`- ${s.section_type || s.section}: ${s.title}`));

  // 2. Rooms
  const { data: rooms, error: rError } = await supabase.from('rooms').select('*');
  console.log('\n[Rooms]');
  if (rError) console.error(rError.message);
  else rooms.forEach(r => console.log(`- ${r.name}: €${r.price_per_night || r.base_price || 0}`));

  // 3. Surf Camps
  const { data: camps, error: cError } = await supabase.from('surf_camps').select('id, name, price, start_date');
  console.log('\n[Surf Camps]');
  if (cError) console.error(cError.message);
  else camps.forEach(c => console.log(`- ${c.name}: €${c.price} (Starts: ${c.start_date})`));

  // 4. Testimonials
  const { data: testimonials, error: tError } = await supabase.from('testimonials').select('id, author_name, rating, text').limit(5);
  console.log('\n[Testimonials (Sample)]');
  if (tError) console.error(tError.message);
  else testimonials.forEach(t => console.log(`- ${t.author_name} (${t.rating}/5): "${(t.text || '').substring(0, 50)}..."`));

  // 5. Recent Bookings
  const { data: bookings, error: bError } = await supabase.from('bookings').select('id, status, total_amount, created_at').order('created_at', { ascending: false }).limit(5);
  console.log('\n[Recent Bookings]');
  if (bError) console.error(bError.message);
  else bookings.forEach(b => console.log(`- ${b.id}: ${b.status} (€${b.total_amount}) [${b.created_at}]`));

  console.log('\n--- AUDIT COMPLETE ---');
}

auditDatabaseContent();
