# FULL SYSTEM VALIDATION PROMPT - Heiwa House

**You must run in FULL VALIDATION MODE.**

**Do not stop until EVERYTHING is verified fully functional.**

---

## Your Tasks:

### 1. Identify ALL Backend, Frontend, Supabase, RLS, or Context Inconsistencies

**Database Schema Validation:**
- Verify ALL tables exist in Supabase:
  - `rooms` (id, name, capacity, pricing, images, amenities, booking_type, is_active)
  - `bookings` (id, client_ids, items, total_amount, status, payment_status, guest_name, guest_email)
  - `clients` (id, name, email, phone, created_at)
  - `surf_camps` (id, name, start_date, end_date, capacity, price, is_active)
  - `room_assignments` (id, booking_id, room_id, check_in, check_out, guest_id)
  - `navigation_items` (id, name, path, order_index, active)
  - `experiences` (id, title, image_url, category, active)
  - `homepage_sections` (id, section_type, content, order_index, is_active)
  - `page_content` (id, page_slug, content, is_active)
  - `testimonials` (id, name, content, rating, is_featured, is_active)
  - `faq_items` (id, question, answer, category, is_active)
  - `media_library` (id, file_url, file_type, category, is_public)
  - `cta_buttons` (id, text, link, style, is_active)
  - `activity_log` (id, table_name, record_id, action, old_values, new_values)
  - `invoices` (id, booking_id, invoice_number, amount, status, due_date)
  - `payments` (id, invoice_id, amount, payment_method, status, transaction_id)
  - `blog_posts`, `blog_categories`, `blog_tags`, `blog_authors` (if blog is enabled)
  - `add_ons` (id, name, description, price, is_active)
  - `calendar_events` (id, title, start_date, end_date, type)

- Verify ALL RLS policies exist and are correct:
  - Public read access for: rooms (is_active=true), bookings (public), clients (public), surf_camps (is_active=true)
  - Admin write access for ALL tables (auth.role() = 'authenticated')
  - Verify no RLS policy conflicts or missing policies
  - Test RLS with both anonymous and authenticated queries

**Field Name Consistency:**
- Verify database uses consistent naming: `is_active` vs `isActive`, `booking_type` vs `bookingType`
- Check API responses map database fields correctly to frontend expectations
- Verify `featured_image` is derived from `images[0]` array correctly
- Check `pricing` JSONB structure matches frontend expectations (standard, offSeason, camp)

**Supabase Connection:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` points to correct project: `pguipwhrxdzzrndbluxb.supabase.co`
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set and valid
- Verify `DATABASE_URL` is set correctly for direct PostgreSQL connections
- Test both `supabase` (anon) and `supabaseAdmin` (service role) clients
- Verify no GoTrueClient warnings or multiple instance errors

---

### 2. Apply All Necessary Patches Across All Layers

**Backend Patches:**
- Fix any API endpoints returning wrong field names
- Ensure all API routes use `supabaseAdmin` for admin operations
- Fix any missing error handling or validation
- Ensure all POST/PUT/DELETE operations validate admin authentication
- Fix any CORS issues with API endpoints

**Frontend Patches:**
- Fix any components expecting wrong field names
- Ensure all admin pages check authentication before rendering
- Fix any image loading issues (missing fallbacks, broken URLs)
- Fix any form validation errors
- Ensure all API calls handle errors gracefully

**Database Patches:**
- Run all pending migrations
- Fix any missing indexes
- Fix any RLS policy issues
- Ensure all foreign key constraints are correct
- Verify all default values are set correctly

---

### 3. Restart Dev Server and Ensure Patches Executed

- Stop any running dev servers
- Clear `.next` cache if needed
- Run `npm install` to ensure dependencies are up to date
- Start dev server: `npm run dev`
- Verify server starts without errors
- Check for any TypeScript compilation errors
- Verify all environment variables are loaded correctly

---

### 4. Verify ALL Tables Exist, All RLS Policies Are Correct, and All Admin/Signed-In Queries Return Data

**Table Existence Verification:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**RLS Policy Verification:**
```sql
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

**Data Verification:**
- Query each table with `supabaseAdmin` client
- Verify all tables return data (or empty arrays, not errors)
- Test RLS policies by querying with anonymous client
- Verify admin queries bypass RLS correctly

---

### 5. Ensure All Booking, Room, Client, and CMS Context Builders Retrieve Correct Data

**Booking Context:**
- Verify `/api/bookings` returns all bookings with correct field mapping
- Verify `/api/bookings/[id]` returns single booking with all related data
- Verify booking creation includes client creation and room assignment
- Verify booking status updates work correctly
- Verify booking queries JOIN with clients table correctly

**Room Context:**
- Verify `/api/rooms` returns all active rooms with images
- Verify `/api/admin/rooms` returns ALL rooms (including inactive)
- Verify `/api/rooms/availability` correctly checks room availability
- Verify room images are valid Supabase storage URLs
- Verify room pricing structure is correct (pricing.standard, pricing.offSeason)

**Client Context:**
- Verify `/api/clients` returns all clients
- Verify `/api/clients/[id]` returns single client with bookings
- Verify client creation during booking works
- Verify client updates work correctly

**CMS Context:**
- Verify `/api/cms/homepage` returns homepage sections
- Verify `/api/cms/page-content` returns page content by slug
- Verify `/api/cms/testimonials` returns active testimonials
- Verify `/api/cms/faq` returns active FAQ items
- Verify `/api/cms/media` returns media library items
- Verify all CMS endpoints support CRUD operations

---

### 6. Validate That the Booking Pipeline NEVER Returns:

- "room not found" errors
- "client creation failed" errors
- "room assignment failed" errors
- "booking creation failed" errors
- 400 errors from invalid data
- RLS errors from permission issues
- null JOIN results (clients, rooms, assignments)
- undefined context fields (guest_name, guest_email, check_in, check_out)
- Missing image URLs or broken image references
- Invalid pricing calculations

**Test Booking Flow End-to-End:**
1. Create booking via `/api/bookings` POST
2. Verify client is created/retrieved
3. Verify room assignment is created
4. Verify booking appears in `/api/bookings` GET
5. Verify booking appears in admin dashboard
6. Verify room availability is updated correctly
7. Verify invoice is created (if applicable)
8. Verify email notification is sent (if configured)

---

### 7. For Every API Endpoint, Perform:

**Public Endpoints (No Auth Required):**
- `GET /api/rooms` - Should return active rooms
- `GET /api/rooms/availability?checkIn=...&checkOut=...` - Should return availability
- `GET /api/surf-camps` - Should return active surf camps
- `GET /api/add-ons` - Should return active add-ons
- `GET /api/cms/homepage` - Should return homepage sections
- `GET /api/cms/page-content?page_slug=...` - Should return page content
- `GET /api/cms/testimonials` - Should return active testimonials
- `GET /api/cms/faq` - Should return active FAQ items
- `POST /api/bookings` - Should create booking (with valid data)
- `POST /api/bookings` - Should reject invalid data (400 error)

**Admin Endpoints (Auth Required):**
- `GET /api/admin/rooms` - Should return ALL rooms (with admin cookie)
- `GET /api/admin/rooms` - Should return 401 without admin cookie
- `GET /api/admin/login` - Should return auth status
- `POST /api/admin/login` - Should authenticate with correct password
- `POST /api/admin/login` - Should reject incorrect password
- `GET /api/bookings` - Should return all bookings (with admin cookie)
- `GET /api/clients` - Should return all clients (with admin cookie)
- `GET /api/admin/analytics` - Should return analytics data
- `POST /api/admin/homepage` - Should create homepage section (with admin cookie)
- `PUT /api/admin/homepage/[id]` - Should update homepage section
- `DELETE /api/admin/homepage/[id]` - Should delete homepage section

**Test Each Endpoint With:**
- Valid data → Should return 200/201 with correct response structure
- Invalid data → Should return 400/422 with error message
- Missing auth → Should return 401 for protected endpoints
- Invalid auth → Should return 401 for protected endpoints
- Non-existent ID → Should return 404
- Verify response structure matches frontend expectations

---

### 8. Perform FULL Site-Wide Smoke Test:

**Public Pages:**
- Homepage loads (`/`)
- Rooms page loads (`/rooms`)
- Room detail page loads (`/rooms/[id]`)
- Surf weeks page loads (`/surf-weeks`)
- The Spot page loads (`/the-spot`)
- About page loads (`/about`)
- Terms page loads (`/terms`)
- Privacy page loads (`/privacy`)
- Blog pages load (`/blog`, `/blog/[slug]`)

**Booking Widget:**
- Booking widget displays on homepage
- Date picker works correctly
- Room selection works correctly
- Guest count selection works correctly
- Booking form submission works
- Booking confirmation displays correctly
- Error handling works for invalid dates/rooms

**Admin Pages (Require Auth):**
- Admin login page loads (`/admin/login`)
- Admin dashboard loads (`/admin`)
- Bookings page loads (`/admin/bookings`)
- Rooms management loads (`/admin/rooms`)
- Clients page loads (`/admin/clients`)
- Surf camps page loads (`/admin/surf-camps`)
- Calendar page loads (`/admin/calendar`)
- Analytics page loads (`/admin/analytics`)
- Assignments page loads (`/admin/assignments`)
- Invoices page loads (`/admin/invoices`)
- Payments page loads (`/admin/payments`)
- CMS pages load (`/admin/cms/*`)
- Blog admin pages load (`/admin/blog/*`)

**API Endpoints:**
- All GET endpoints return 200 with valid data structure
- All POST endpoints accept valid data and return 201/200
- All PUT endpoints update data correctly
- All DELETE endpoints remove data correctly
- All endpoints handle errors gracefully
- All endpoints return consistent error format

**Database Queries:**
- All admin queries return data (not empty arrays unless no data exists)
- All JOIN queries return complete data (no null foreign keys)
- All RLS policies allow correct access
- All admin queries bypass RLS correctly

---

### 9. Print ALL Terminal Logs During Each Validation Step

**Do not suppress logs or errors—capture ALL output:**

- Server startup logs
- API request logs (method, path, status, response time)
- Database query logs (table, operation, row count)
- Error logs (full stack traces, error messages)
- Supabase client logs (connection, queries, errors)
- Authentication logs (login attempts, cookie setting)
- Image loading logs (URLs, success/failure)
- Booking creation logs (step-by-step process)

**Log Format:**
```
[VALIDATION] Testing endpoint: GET /api/rooms
[VALIDATION] Request headers: {...}
[VALIDATION] Response status: 200
[VALIDATION] Response body: {...}
[VALIDATION] Response time: 45ms
[VALIDATION] ✅ PASSED
```

---

### 10. If ANY Error Occurs at Any Step:

**STOP IMMEDIATELY and:**
1. Identify the root cause:
   - Check terminal logs for error messages
   - Check browser console for client-side errors
   - Check Supabase logs for database errors
   - Check network tab for API errors
   - Verify environment variables are set
   - Verify database connection is working
   - Verify RLS policies are correct

2. Apply the exact code patch:
   - Fix the specific issue identified
   - Update related code if needed
   - Add error handling if missing
   - Add logging if needed for debugging

3. Re-run tests automatically:
   - Re-run the specific test that failed
   - Re-run all related tests
   - Re-run full smoke test
   - Verify fix resolves the issue

4. Document the fix:
   - Record what was broken
   - Record what was fixed
   - Record how to prevent recurrence

---

### 11. Continue Iterating Until ALL Tests Pass:

**No errors in terminal:**
- No TypeScript compilation errors
- No runtime errors
- No unhandled promise rejections
- No database connection errors
- No Supabase client errors

**No errors in browser console:**
- No JavaScript errors
- No React errors
- No API call errors
- No image loading errors
- No authentication errors

**All JOINs return valid data:**
- Bookings JOIN with clients → no null client data
- Bookings JOIN with rooms → no null room data
- Room assignments JOIN with bookings → no null booking data
- Invoices JOIN with bookings → no null booking data
- Payments JOIN with invoices → no null invoice data

**Manual fallback queries (admin client) return correct data:**
- Direct Supabase queries return same data as API
- Admin queries return all data (not filtered by RLS)
- All foreign key relationships resolve correctly

**All endpoints return 200 (or appropriate status):**
- GET endpoints return 200 with data
- POST endpoints return 201/200 with created data
- PUT endpoints return 200 with updated data
- DELETE endpoints return 200/204
- Error endpoints return appropriate error codes (400, 401, 404, 500)

**Booking system completes end-to-end:**
- Booking creation succeeds
- Client creation/retrieval succeeds
- Room assignment succeeds
- Booking appears in admin dashboard
- Room availability updates correctly
- Email notification sent (if configured)

**CMS system works correctly:**
- Homepage sections load and display
- Page content loads and displays
- Testimonials load and display
- FAQ items load and display
- Media library loads and displays
- Admin can create/edit/delete CMS content

**Image system works correctly:**
- Room images load from Supabase storage
- CMS images load correctly
- Image fallbacks work for missing images
- Image URLs are valid and accessible
- Image upload works (if implemented)

**Admin authentication works:**
- Login succeeds with correct password
- Login fails with incorrect password
- Admin cookie is set correctly
- Admin routes are protected
- Admin can access all admin pages
- Logout clears admin cookie

---

### 12. Only Stop When EVERYTHING is Green and You Can Prove It With:

**Terminal Logs:**
- All API requests logged with status codes
- All database queries logged with row counts
- All errors logged with full stack traces
- All validation steps logged with pass/fail status

**API Responses:**
- All endpoints return expected status codes
- All responses have correct data structure
- All error responses have error messages
- All success responses have data

**Debug Printouts:**
- Database query results printed
- API response bodies printed
- Error messages printed
- Validation results printed

**Successful curl Logs:**
- All GET requests return 200
- All POST requests return 201/200
- All PUT requests return 200
- All DELETE requests return 200/204
- All error cases return appropriate error codes

**Successful Browser Tests:**
- All pages load without errors
- All forms submit successfully
- All API calls succeed
- All images load correctly
- All admin features work

**Successful Database Tests:**
- All tables exist
- All RLS policies work
- All queries return data
- All JOINs work correctly
- All foreign keys resolve

**Successful Booking Flow:**
- Booking creation succeeds
- Client creation succeeds
- Room assignment succeeds
- Booking appears in admin
- Room availability updates

**Successful CMS Flow:**
- Content creation succeeds
- Content updates succeed
- Content deletion succeeds
- Content displays correctly
- Admin can manage content

---

## Validation Checklist:

- [ ] All database tables exist
- [ ] All RLS policies are correct
- [ ] All API endpoints work correctly
- [ ] All admin pages load correctly
- [ ] All public pages load correctly
- [ ] Booking system works end-to-end
- [ ] CMS system works correctly
- [ ] Image system works correctly
- [ ] Admin authentication works
- [ ] No errors in terminal
- [ ] No errors in browser console
- [ ] All JOINs return valid data
- [ ] All endpoints return correct status codes
- [ ] All forms submit successfully
- [ ] All data displays correctly

---

**You must not stop early or produce summaries until the entire system is verified working end-to-end.**

**Every validation step must be logged, every error must be fixed, and every test must pass before completion.**

