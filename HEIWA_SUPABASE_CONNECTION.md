# Heiwa House - Supabase Connection Setup

## ✅ Connection Status: ACTIVE

Your Heiwa House dashboard is now successfully connected to the **Heiwa** Supabase project.

## 📊 Project Details

- **Project Name**: heiwa
- **Project ID**: zejrhceuuujzgyukdwnb
- **Region**: us-east-1
- **Status**: ACTIVE_HEALTHY
- **Database Version**: PostgreSQL 17.4.1.075
- **URL**: https://zejrhceuuujzgyukdwnb.supabase.co

## 🔧 Configuration

### Environment Variables (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DATABASE_URL=postgresql://postgres:Yyacoy123..@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres
NODE_ENV=development
```

## 🗄️ Database Schema

### Tables Created ✅
- `clients` (7 records)
- `rooms` (4 records) 
- `surf_camps` (3 records)
- `add_ons`
- `bookings` (1 record)
- `camp_weeks`
- `room_assignments`
- `payments`
- `invoices`
- `automations`
- `external_calendar_events`
- `feature_flags`

### Sample Data ✅
- **Clients**: John Doe, Jane Smith, Mike Johnson, etc.
- **Rooms**: Ocean View Suite, Garden Villa, Shared Dorm
- **Surf Camps**: Beginner Surf Week, Intermediate Adventure, Pro Intensive

## 🗂️ Storage Buckets

### Buckets Created ✅
- `rooms` (public) - for room images
- `surf-camps` (public) - for surf camp images  
- `add-ons` (public) - for add-on images
- `temp` (private) - for temporary uploads

## 🔒 Security Setup

### Row Level Security (RLS) ✅
- **Enabled** on all tables
- **Admin-only access** policies configured
- **Admin function** `is_admin_user()` created

### Admin Emails Configured
- julian@fyves.com
- julianmjavierm@gmail.com
- admin@heiwa.house
- manager@heiwa.house
- laurence@fyves.com

### Authentication ✅
- **Email authentication** enabled
- **Site URL**: http://localhost:3000
- **JWT expiry**: 3600 seconds
- **Refresh token rotation** enabled

## 🚀 Application Status

### Development Server ✅
- **Running on**: http://localhost:3005
- **Status**: Ready
- **Build**: Successful

### Connection Test ✅
All database operations working:
- ✅ Client management
- ✅ Room management  
- ✅ Surf camp management
- ✅ Storage operations
- ✅ Authentication flow

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Test database connection
npx tsx scripts/test-connection.ts

# Run migrations (if needed)
npx tsx scripts/run-migrations.ts

# Setup RLS policies (if needed)
npx tsx scripts/setup-rls.ts

# Seed database with sample data
npx tsx scripts/seed-supabase.ts

# Setup storage buckets (if needed)
npx tsx scripts/setup-storage.ts
```

## 📝 Next Steps

1. **Access the dashboard**: http://localhost:3005
2. **Login with admin email** to access full functionality
3. **Test booking flows** and admin features
4. **Upload images** to test storage integration
5. **Configure payment processing** if needed

## 🔍 Troubleshooting

### If you see empty data:
- RLS policies require admin authentication
- Use service role key for backend operations
- Check admin email configuration

### If connection fails:
- Verify environment variables in `.env.local`
- Check Supabase project status
- Ensure network connectivity

---

**🎉 Your Heiwa House dashboard is now fully connected to Supabase and ready for use!**
