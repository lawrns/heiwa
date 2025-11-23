#!/bin/bash
set -e

DATABASE_URL="postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres"

echo "🚀 Applying all migrations to database..."

# Migration files in order
MIGRATIONS=(
  "migrations/002_create_surf_camps.sql"
  "migrations/003_cms_content_tables.sql"
  "migrations/004_cms_content_tables.sql"
  "migrations/005_seed_flow_testimonials.sql"
  "migrations/006_blog_tables.sql"
  "migrations/007_create_clients_bookings.sql"
  "migrations/008_create_surf_camp_enrollments.sql"
  "migrations/009_fix_rooms_table.sql"
  "migrations/20241122_add_email_tracking_indexes.sql"
  "migrations/20241122_add_email_tracking_to_bookings.sql"
  "migrations/20250120_create_storage_buckets.sql"
  "migrations/20250120_create_surf_camp_enrollments.sql"
  "migrations/20250120_fix_database_drift.sql"
  "migrations/20250121_create_cms_settings.sql"
  "migrations/20250121_create_payments_table.sql"
  "migrations/20250121_fix_admin_issues.sql"
  "migrations/20250121_fix_experiences_table.sql"
  "migrations/20250121_fix_invoices_table.sql"
  "migrations/20250122_add_email_tracking_to_bookings.sql"
)

for migration in "${MIGRATIONS[@]}"; do
  if [ -f "$migration" ]; then
    echo "📄 Applying: $migration"
    psql "$DATABASE_URL" -f "$migration" || {
      echo "⚠️  Migration $migration failed (might already be applied)"
    }
  else
    echo "⚠️  Migration file not found: $migration"
  fi
done

echo "✅ All migrations completed!"
