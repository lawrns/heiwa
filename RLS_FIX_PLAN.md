# Row-Level Security (RLS) Fix Plan

## Problem
Getting error: "new row violates row-level security policy for table 'surf_camps'"

## Root Cause
RLS policies are too restrictive or missing for the operations the application needs to perform.

## Solution Strategy

### 1. Identify All Tables with RLS Enabled
- surf_camps
- rooms
- bookings
- clients
- surf_camp_enrollments
- payments
- room_assignments
- (and any other tables)

### 2. Create Comprehensive RLS Policies

For each table, we need policies that allow:

#### A. Service Role Access (Backend API)
- Full CRUD access for service_role
- This is what supabaseAdmin uses

#### B. Public Read Access (Where Appropriate)
- SELECT for active/public records
- For surf_camps: only active camps
- For rooms: only active rooms

#### C. Authenticated User Access (If Needed)
- For user-specific operations
- Bookings, enrollments, etc.

### 3. Policy Types Needed

1. **Service Role Policy** - Full access for backend
   ```sql
   CREATE POLICY "service_role_full_access" ON table_name
     FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
   ```

2. **Public Read Policy** - Read-only for public
   ```sql
   CREATE POLICY "public_read_active" ON table_name
     FOR SELECT USING (is_active = true);
   ```

3. **Authenticated Insert Policy** - For user submissions
   ```sql
   CREATE POLICY "authenticated_insert" ON table_name
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

### 4. Implementation Steps

1. Check current policies
2. Drop overly restrictive policies
3. Create new comprehensive policies
4. Test each operation (SELECT, INSERT, UPDATE, DELETE)
5. Verify service_role can perform all operations
6. Verify public can read where appropriate

### 5. Tables to Fix

- [x] surf_camps
- [ ] rooms
- [ ] bookings
- [ ] clients
- [ ] surf_camp_enrollments
- [ ] payments
- [ ] room_assignments
- [ ] Any other tables with RLS enabled

### 6. Testing Checklist

- [ ] Service role can INSERT into surf_camps
- [ ] Service role can UPDATE surf_camps
- [ ] Service role can DELETE surf_camps
- [ ] Service role can SELECT from surf_camps
- [ ] Public can SELECT active surf_camps
- [ ] Public cannot INSERT/UPDATE/DELETE surf_camps
- [ ] Repeat for all tables

### 7. Prevention

- Document RLS policies in migration files
- Always include service_role policy when enabling RLS
- Test RLS policies after creating them
- Use consistent policy naming convention

