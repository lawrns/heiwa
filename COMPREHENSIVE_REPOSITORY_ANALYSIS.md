# Comprehensive Repository Analysis: Heiwa House

## Executive Summary

This is a Next.js 15 full-stack application for a surf retreat center (Heiwa House) in Portugal. It features a complex booking system with multiple user flows, admin dashboard, payment processing via Stripe, email notifications, and CMS functionality.

**Tech Stack:**
- Frontend: React 19 RC, Next.js 15, TypeScript, Tailwind CSS, Radix UI
- Backend: Next.js API Routes, Node.js
- Database: Supabase (PostgreSQL)
- Payments: Stripe
- Email: Resend
- Storage: Supabase Storage
- Testing: Jest, Playwright, Property-based testing (fast-check)

---

## 1. USER-FACING FLOWS

### 1.1 Room Booking Flow
**Path:** `/booking` → Booking Widget (modal)
**Steps:**
1. Experience Type Selection (Room vs Surf Week)
2. Date Selection (Check-in/Check-out)
3. Room Selection (Browse available rooms)
4. Guest Details (Name, email, phone for each guest)
5. Add-ons Selection (Optional extras)
6. Review & Payment (Stripe card or bank transfer)
7. Confirmation (Success page with booking reference)

**Key Components:**
- `components/BookingWidget/BookingWidget.tsx` - Main widget container
- `components/BookingWidget/steps/ExperienceSelection.tsx` - Type selection
- `components/BookingWidget/steps/OptionSelection.tsx` - Room/Surf week selection
- `components/BookingWidget/steps/GuestDetails.tsx` - Guest information form
- `components/BookingWidget/steps/ReviewAndPay.tsx` - Payment processing
- `components/BookingWidget/hooks/useBookingFlow.ts` - State management (useReducer)

**State Machine:**
```
Initial → ExperienceType → Dates → RoomSelection → GuestDetails → AddOns → ReviewAndPay → Success
```

**Payment Methods:**
- Stripe Card (immediate processing)
- Bank Transfer (manual verification required)

---

### 1.2 Surf Week Enrollment Flow
**Path:** `/surf-weeks` → Booking Widget
**Steps:**
1. Surf Week Selection (Browse available camps)
2. Participant Details (Name, email, skill level)
3. Room Assignment (Assign participants to rooms)
4. Add-ons Selection
5. Review & Payment
6. Confirmation

**Key Components:**
- `components/surf-weeks/SurfWeeksTable.tsx` - Surf week listing
- `components/BookingWidget/steps/SurfWeekRoomSelection.tsx` - Room assignment
- `app/api/surf-camps/route.ts` - Surf camp data API

---

### 1.3 Contact Form Submission
**Path:** `/contact`
**Flow:**
1. User fills contact form (name, email, subject, message)
2. Form submitted to `/api/contact`
3. Data stored in `contact_submissions` table
4. Email sent to admin (if Resend configured)
5. Confirmation message shown to user

**Key Files:**
- `app/contact/page.tsx` - Contact page
- `app/api/contact/route.ts` - Contact submission handler

---

### 1.4 Blog Viewing
**Path:** `/blog` → `/blog/[slug]`
**Features:**
- Blog post listing with categories and tags
- Individual post view with rich content
- Related posts suggestions
- RSS feed at `/blog/rss.xml`

**Database Tables:**
- `blog_posts` - Post metadata
- `blog_post_translations` - Localized content
- `blog_categories` - Post categories
- `blog_tags` - Post tags
- `blog_post_tags` - Many-to-many relationship

---

### 1.5 Gallery Viewing
**Path:** `/gallery`
**Features:**
- Image gallery with masonry layout
- Lightbox view
- Image optimization with blur placeholders

**Key Components:**
- `components/ui/image-gallery.tsx`
- `components/ui/lightbox.tsx`

---

### 1.6 Room Browsing & Details
**Path:** `/rooms` → `/rooms/[id]`
**Features:**
- Room listing with filters
- Room detail view with images, amenities, pricing
- Availability calendar
- Direct booking from room detail

**Key Components:**
- `app/rooms/page.tsx` - Room listing
- `app/rooms/[id]/page.tsx` - Room detail
- `components/ui/booking-calendar.tsx` - Availability calendar

---

### 1.7 Admin Authentication & Dashboard
**Path:** `/admin/login` → `/admin`
**Authentication:**
- Password-based (stored in environment variable)
- Cookie-based session (`admin_auth` cookie)
- Rate limiting on login attempts (5 attempts per 15 minutes)
- Middleware protection on all `/admin/*` routes

**Admin Dashboard Features:**
- Booking management (CRUD)
- Room management (CRUD)
- Surf camp management (CRUD)
- Client management
- Payment tracking
- Invoice management
- Analytics & reporting
- CMS content editing
- Gallery management
- Blog management

**Key Files:**
- `middleware.ts` - Route protection
- `lib/admin-auth.ts` - Authentication logic
- `app/api/admin/login/route.ts` - Login endpoint
- `app/admin/page.tsx` - Dashboard

---

## 2. BACKEND STATE MACHINES

### 2.1 Booking States
```
pending → confirmed → completed
       ↘ cancelled
```

**Fields:**
- `status`: pending | confirmed | completed | cancelled
- `payment_status`: pending | paid | failed | refunded | partially_refunded | disputed
- `room_type`: private | shared | dorm
- `guests`: number
- `total_amount`: EUR
- `check_in`, `check_out`: ISO dates

**Transitions:**
- Admin can manually update status
- Payment webhook updates `payment_status`
- Booking auto-completes after check-out date

---

### 2.2 Payment States
```
pending → completed
       ↘ failed
       ↘ refunded (from completed)
       ↘ partially_refunded (from completed)
       ↘ disputed (from completed)
```

**Payment Methods:**
- `stripe` - Immediate processing
- `bank_wire` - Manual verification

**Webhook Events Handled:**
- `payment_intent.succeeded` - Mark booking as paid
- `payment_intent.payment_failed` - Mark booking as failed
- `charge.refunded` - Update refund status
- `charge.dispute.created` - Mark as disputed

---

### 2.3 Surf Camp Enrollment States
```
pending → confirmed → completed
       ↘ cancelled
```

**Fields:**
- `status`: pending | confirmed | completed | cancelled
- `participants`: array of participant objects
- `room_assignments`: array of room assignments
- `pricing`: pricing breakdown

---

### 2.4 Admin Session States
```
unauthenticated → authenticated → session_expired
```

**Mechanism:**
- Cookie-based: `admin_auth` cookie contains password hash
- Middleware checks cookie on every `/admin/*` request
- No session expiration (persistent until cookie deleted)
- Rate limiting on login attempts

---

## 3. ASYNC JOBS, WEBHOOKS, QUEUES

### 3.1 Stripe Webhooks
**Endpoint:** `POST /api/stripe/webhook`
**Secret:** `STRIPE_WEBHOOK_SECRET`

**Events Handled:**
1. `payment_intent.succeeded`
   - Create payment record in `payments` table
   - Update booking `payment_status` to 'paid'
   - Send payment confirmation email

2. `payment_intent.payment_failed`
   - Create failed payment record
   - Update booking `payment_status` to 'failed'
   - Send failure notification

3. `charge.refunded`
   - Update payment record with refund amount
   - Update booking `payment_status` to 'refunded' or 'partially_refunded'
   - Send refund notification email

4. `charge.dispute.created`
   - Update payment record with dispute info
   - Update booking `payment_status` to 'disputed'
   - Alert admin

**Idempotency:** Events stored in `stripe_webhook_events` table to prevent duplicate processing

---

### 3.2 Email Sending Jobs
**Service:** `lib/email-service.ts`
**Provider:** Resend

**Email Types:**
1. **Booking Confirmation** - Sent immediately after booking
   - Guest receives confirmation with booking details
   - Admin receives notification

2. **Payment Confirmation** - Sent after successful payment
   - Guest receives payment receipt
   - Includes transaction ID and amount

3. **Invoice** - Sent when invoice is generated
   - Itemized breakdown
   - Due date and payment instructions

4. **Enrollment Confirmation** - Sent for surf week enrollments
   - Participant details
   - Camp dates and location

5. **Refund Notification** - Sent when refund is processed
   - Refund amount and reason
   - Timeline for processing

6. **Pre-trip Email** - Sent 7 days before check-in
   - Packing list
   - Travel tips
   - Affiliate links
   - Weather forecast

7. **Post-trip Feedback** - Sent 1 day after check-out
   - Feedback form link
   - Review links (Google, TripAdvisor)
   - Return offer (10% discount for 90 days)

---

### 3.3 Scheduled Email Service
**Endpoint:** `GET/POST /api/cron/send-scheduled-emails?secret=CRON_SECRET`
**Frequency:** Daily (via external cron service or Vercel Cron)

**Jobs:**
1. **Pre-trip Emails** (7 days before check-in)
   - Query bookings with `check_in` = today + 7 days
   - Filter: `status = 'confirmed'` AND `pre_trip_email_sent_at IS NULL`
   - Send email and mark `pre_trip_email_sent_at`

2. **Post-trip Feedback** (1 day after check-out)
   - Query bookings with `check_out` = today - 1 day
   - Filter: `status IN ('completed', 'confirmed')` AND `post_trip_email_sent_at IS NULL`
   - Send feedback request and mark `post_trip_email_sent_at`

**Implementation:** `lib/scheduled-email-service.ts`

---

### 3.4 Cron Jobs
**Potential Cron Jobs (Not all implemented):**
1. Daily health check: `GET /api/health`
2. Scheduled emails: `GET /api/cron/send-scheduled-emails`
3. Cache revalidation: `POST /api/revalidate`

---

## 4. ADMIN FLOWS

### 4.1 Booking Management
**CRUD Operations:**
- **Create:** `/admin/bookings/new` - Manual booking creation
- **Read:** `/admin/bookings` - List with filters (status, payment_status, date range)
- **Update:** `/admin/bookings/[id]` - Edit booking details, status, payment status
- **Delete:** Soft delete (mark as cancelled)

**Filters:**
- Status (pending, confirmed, completed, cancelled)
- Payment status (pending, paid, failed, refunded)
- Date range (check-in, check-out)
- Guest name search
- Room type

**API:** `GET/POST /api/bookings`, `GET/PUT/DELETE /api/bookings/[id]`

---

### 4.2 Room Management
**CRUD Operations:**
- **Create:** `/admin/rooms/new` - Add new room
- **Read:** `/admin/rooms` - List all rooms
- **Update:** `/admin/rooms/[id]` - Edit room details, pricing, images
- **Delete:** Soft delete (mark as inactive)

**Fields:**
- Name, description, capacity
- Booking type (entire_room, per_bed)
- Pricing (standard, off-season, surf-camp)
- Images (array of URLs)
- Amenities
- Availability status

**API:** `GET/POST /api/admin/rooms`, `GET/PUT/DELETE /api/admin/rooms/[id]`

---

### 4.3 Surf Camp Management
**CRUD Operations:**
- **Create:** `/admin/surf-camps/new`
- **Read:** `/admin/surf-camps` - List with filters
- **Update:** `/admin/surf-camps/[id]`
- **Delete:** Soft delete

**Fields:**
- Name, description, location
- Dates (start_date, end_date)
- Skill level (beginner, intermediate, advanced, all)
- Max participants, total spots
- Pricing (per-bed, occupancy-based)
- Images, includes (what's included)
- Room assignments

**API:** `GET/POST /api/surf-camps`, `GET/PUT/DELETE /api/surf-camps/[id]`

---

### 4.4 Client Management
**CRUD Operations:**
- **Create:** Manual client creation
- **Read:** `/admin/clients` - List with search
- **Update:** Edit client details, VIP status, notes
- **Delete:** Soft delete (mark as deleted_at)

**Fields:**
- Name, email, phone
- VIP status
- Last booking date
- Notes
- Registration date
- Social links

**API:** `GET/POST /api/clients`, `GET/PUT/DELETE /api/clients/[id]`

---

### 4.5 Invoice Management
**Operations:**
- **Create:** Auto-generated when booking is confirmed
- **Read:** `/admin/invoices` - List with filters
- **Update:** Edit invoice details, status
- **Send:** Email invoice to client

**Fields:**
- Invoice number (format: HW-INV-YYYY-XXXX)
- Booking ID
- Amount, currency
- Status (draft, sent, paid, overdue)
- Due date, sent date, paid date

**API:** `GET/POST /api/invoices`, `GET/PUT/DELETE /api/invoices/[id]`

---

### 4.6 Payment Tracking
**Features:**
- `/admin/payments` - List all payments
- Filter by status, method, date range
- View payment details (transaction ID, amount, method)
- Manual payment recording
- Refund processing

**API:** `GET/POST /api/payments`, `GET/PUT/DELETE /api/payments/[id]`

---

### 4.7 CMS Content Editing
**Sections:**
- **Homepage Content:** Hero, sections, testimonials, facilities
- **Pages:** About, Terms, Privacy, etc.
- **FAQ:** By page and category
- **Testimonials:** With ratings and featured status
- **Navigation:** Menu items and order

**API:** `GET/POST /api/admin/cms/*`

---

### 4.8 Gallery Management
**Operations:**
- **Upload:** `/admin/gallery/upload` - Upload images
- **List:** `/admin/gallery` - View all images
- **Edit:** Update alt text, tags, category
- **Delete:** Remove from storage

**Storage:** Supabase Storage bucket `room-images`, `surf-camp-images`, `page-images`

**API:** `GET/POST /api/gallery`, `GET/PUT/DELETE /api/gallery/[id]`

---

### 4.9 Blog Management
**CRUD Operations:**
- **Create:** `/admin/blog/posts/new` - New blog post
- **Read:** `/admin/blog/posts` - List posts
- **Update:** `/admin/blog/posts/[id]` - Edit post
- **Delete:** Soft delete (mark as draft)

**Features:**
- Rich text editor (TipTap)
- Categories and tags
- Author assignment
- Featured posts
- Scheduled publishing
- Translations (multi-language support)

**API:** `GET/POST /api/admin/blog/*`

---

### 4.10 Analytics & Dashboard
**Metrics:**
- Total bookings (this month, last month)
- Revenue (this month, last month)
- Active guests
- Occupancy rate
- Payment status breakdown
- Recent bookings
- Client statistics

**API:** `GET /api/admin/analytics`, `GET /api/admin/stats`

---

## 5. THIRD-PARTY INTEGRATIONS

### 5.1 Stripe (Payments)
**Configuration:**
- `STRIPE_SECRET_KEY` - Server-side secret
- `STRIPE_PUBLISHABLE_KEY` - Client-side public key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

**Integration Points:**
1. **Payment Intent Creation:** `POST /api/create-payment-intent`
   - Creates Stripe PaymentIntent
   - Supports both card and bank transfer methods
   - Stores booking ID in metadata

2. **Webhook Handler:** `POST /api/stripe/webhook`
   - Verifies webhook signature
   - Processes payment events
   - Updates booking and payment records

3. **Frontend Integration:** `components/BookingWidget/steps/ReviewAndPay.tsx`
   - Stripe Elements for card input
   - Bank transfer instructions display

**Payment Methods:**
- Card (Visa, Mastercard, Amex, etc.)
- Bank transfer (SEPA, international)

---

### 5.2 Supabase (Database & Auth)
**Configuration:**
- `SUPABASE_URL` - Project URL
- `SUPABASE_ANON_KEY` - Client-side key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key

**Usage:**
1. **Database:** PostgreSQL via Supabase
   - All tables defined in `lib/database.types.ts`
   - Row-level security (RLS) policies for data protection

2. **Storage:** Supabase Storage buckets
   - `room-images` - Room photos
   - `surf-camp-images` - Surf camp photos
   - `page-images` - CMS page images
   - `blog-images` - Blog post images
   - `media-library` - General media

3. **Authentication:** Not used for user auth (admin uses password)
   - Could be extended for user accounts

**Client Initialization:**
- `lib/supabase.ts` - Supabase client setup
- `lib/supabase-context.tsx` - React context provider

---

### 5.3 Resend (Email Service)
**Configuration:**
- `RESEND_API_KEY` - API key for sending emails
- `FROM_EMAIL` - Sender email address
- `ADMIN_EMAIL` - Admin notification recipient
- `REPLY_TO_EMAIL` - Reply-to address

**Email Templates:**
- Booking confirmation
- Payment confirmation
- Invoice
- Enrollment confirmation
- Refund notification
- Pre-trip planning
- Post-trip feedback request

**Implementation:** `lib/email-service.ts`

---

### 5.4 Netlify (Deployment)
**Configuration:**
- `netlify.toml` - Build and deployment config
- Post-deploy hook: `netlify-post-deploy.sh`
- Health check: `npm run health-check`

**Features:**
- Automatic deployments from Git
- Environment variables management
- Scheduled functions (for cron jobs)
- Edge functions (if needed)

---

## 6. ENVIRONMENT-DEPENDENT BEHAVIOR

### 6.1 Required Environment Variables
```
# Database
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL

# Payments
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

# Email
RESEND_API_KEY
FROM_EMAIL
ADMIN_EMAIL
REPLY_TO_EMAIL

# Admin
ADMIN_PASSWORD
NEXT_PUBLIC_ADMIN_PASSWORD

# Cron
CRON_SECRET

# Optional
GOOGLE_PLACES_API_KEY
GOOGLE_MAPS_API_KEY
```

### 6.2 Development vs Production
**Development:**
- Resend emails logged to console (not sent)
- Admin password defaults to 'heiwa_admin_2024'
- Stripe uses test keys
- Supabase uses development project
- Verbose logging enabled

**Production:**
- All emails sent via Resend
- Admin password from environment variable
- Stripe uses live keys
- Supabase uses production project
- Error tracking enabled (TODO: Sentry integration)
- Cache headers optimized

### 6.3 Feature Flags
**Potential Feature Flags (Not implemented):**
- Email notifications on/off
- Stripe payments on/off
- Bank transfer payments on/off
- Pre-trip emails on/off
- Post-trip emails on/off

---

## 7. PARTIAL/BROKEN/DEAD CODE

### 7.1 TODOs in Code
1. **Error Tracking (lib/monitoring.ts, lib/logger.ts)**
   - TODO: Send to external error tracking service (Sentry, LogRocket, etc.)
   - Currently only logs to console

2. **Admin Email Notifications (app/api/contact/route.ts)**
   - TODO: Send email notification to admin when contact form submitted
   - Currently only stores in database

3. **Database Connection Check (app/api/health/route.ts)**
   - TODO: Add actual DB connection check
   - Currently returns hardcoded 'connected'

### 7.2 Commented Out Code
1. **Agent Logging (components/BookingWidget/hooks/useBookingFlow.ts)**
   - Debug logging to external service (commented out)
   - Sends booking state updates to monitoring endpoint

2. **Booking Persistence (lib/utils/booking-persistence.ts)**
   - Agent logging for debugging booking state

### 7.3 Unused Routes
1. `/api/debug` - Debug endpoint for testing deployment
2. `/api/errors` - Client-side error logging (not fully integrated)
3. `/api/check-schema` - Empty directory

### 7.4 Dead Code Patterns
1. **Yoga Dome Images Bug**
   - Code filters out yoga dome images from room images
   - Indicates past data quality issue
   - See: `lib/booking-utils.ts` - `processRoomImages()`

2. **Supabase Bucket URL Mismatch**
   - Code fixes old `/rooms/` bucket URLs to `/room-images/`
   - Indicates database migration issue
   - See: `lib/booking-utils.ts` - `fixSupabaseBucketUrl()`

3. **NaN Value Checks**
   - Multiple tests check for NaN values in pricing
   - Indicates past calculation bugs
   - See: `e2e/production-comprehensive-test.spec.ts`

### 7.5 Incomplete Features
1. **Multi-language Support**
   - Blog posts have translation table
   - Not fully implemented in UI

2. **Activity Management**
   - Activities/experiences table exists
   - Not fully integrated into booking flow

3. **Tax Categories**
   - Tax category management in admin
   - Not used in pricing calculations

4. **Assignments**
   - Assignment management endpoints exist
   - Purpose unclear

---

## 8. API ROUTES SUMMARY

### Public Routes (No Auth Required)
- `GET /api/rooms` - List rooms
- `GET /api/rooms/[id]` - Room details
- `GET /api/rooms/availability` - Room availability
- `GET /api/surf-camps` - List surf camps
- `GET /api/surf-camps/[id]` - Surf camp details
- `GET /api/blog/posts` - Blog posts
- `GET /api/gallery` - Gallery images
- `GET /api/activities` - Activities/experiences
- `POST /api/bookings` - Create booking
- `POST /api/contact` - Contact form submission
- `POST /api/create-payment-intent` - Stripe payment intent
- `POST /api/stripe/webhook` - Stripe webhook
- `GET /api/health` - Health check
- `GET /api/debug` - Debug info

### Admin Routes (Auth Required)
- `GET /api/admin/login` - Check auth status
- `POST /api/admin/login` - Login
- `GET /api/admin/logout` - Logout
- `GET /api/bookings` - List bookings (admin)
- `GET /api/bookings/[id]` - Booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Delete booking
- `GET /api/admin/rooms` - List rooms (admin)
- `POST /api/admin/rooms` - Create room
- `PUT /api/admin/rooms/[id]` - Update room
- `DELETE /api/admin/rooms/[id]` - Delete room
- `GET /api/admin/surf-camps` - List surf camps (admin)
- `POST /api/admin/surf-camps` - Create surf camp
- `PUT /api/admin/surf-camps/[id]` - Update surf camp
- `DELETE /api/admin/surf-camps/[id]` - Delete surf camp
- `GET /api/admin/clients` - List clients
- `POST /api/admin/clients` - Create client
- `PUT /api/admin/clients/[id]` - Update client
- `DELETE /api/admin/clients/[id]` - Delete client
- `GET /api/admin/payments` - List payments
- `GET /api/admin/invoices` - List invoices
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/cms/*` - CMS content management
- `GET /api/admin/blog/*` - Blog management
- `POST /api/upload` - Upload images
- `DELETE /api/upload` - Delete images
- `GET /api/media` - Media library
- `POST /api/media` - Upload media
- `DELETE /api/media/[id]` - Delete media

### Cron Routes
- `GET /api/cron/send-scheduled-emails` - Send scheduled emails
- `POST /api/cron/send-scheduled-emails` - Send scheduled emails (POST)

---

## 9. DATABASE SCHEMA OVERVIEW

### Core Tables
- `bookings` - Booking records
- `clients` - Guest/client information
- `rooms` - Room inventory
- `surf_camps` - Surf camp offerings
- `payments` - Payment records
- `invoices` - Invoice records
- `add_ons` - Optional add-ons for bookings

### CMS Tables
- `homepage_content` - Homepage sections
- `homepage_sections` - Homepage section definitions
- `page_content` - Page content
- `faq_items` - FAQ items
- `testimonials` - Guest testimonials
- `cta_buttons` - Call-to-action buttons

### Blog Tables
- `blog_posts` - Blog post metadata
- `blog_post_translations` - Localized blog content
- `blog_categories` - Blog categories
- `blog_tags` - Blog tags
- `blog_post_tags` - Post-tag relationships
- `blog_authors` - Blog authors

### System Tables
- `activity_categories` - Activity categories
- `experiences` - Activities/experiences
- `calendar_events` - Calendar events
- `contact_submissions` - Contact form submissions
- `email_logs` - Email sending logs
- `activity_log` - Audit log
- `stripe_webhook_events` - Webhook event tracking
- `media_library` - Media file tracking

---

## 10. KEY ARCHITECTURAL PATTERNS

### 10.1 State Management
- **Booking Widget:** useReducer with localStorage persistence
- **Global Context:** BookingContext for modal state
- **Supabase Context:** Lazy-loaded Supabase client

### 10.2 Error Handling
- Try-catch blocks in API routes
- Graceful degradation (return empty arrays on DB errors)
- Client-side error logging to `/api/errors`
- Error boundary component for React errors

### 10.3 Caching Strategy
- Next.js ISR (Incremental Static Regeneration)
- Cache headers: `s-maxage=300, stale-while-revalidate=3600`
- Manual cache revalidation via `/api/revalidate`

### 10.4 Rate Limiting
- Login attempts: 5 per 15 minutes per IP
- Implementation: `lib/rate-limiter.ts`

### 10.5 Image Optimization
- Blur placeholders for lazy loading
- Supabase Storage URLs with CDN
- Image URL mapping for bucket name fixes

---

## 11. TESTING INFRASTRUCTURE

### Unit Tests
- Jest configuration
- Component tests with React Testing Library
- Utility function tests
- Service tests (booking, email, etc.)

### Integration Tests
- API route tests
- Database integration tests
- Stripe integration tests

### E2E Tests
- Playwright configuration
- Critical path tests
- Admin workflow tests
- Booking flow tests
- Production verification tests

### Property-Based Tests
- fast-check for generating test data
- Booking validation tests
- API response shape tests
- UI component tests

---

## 12. DEPLOYMENT & MONITORING

### Deployment
- Netlify hosting
- Automatic deployments from Git
- Environment variables management
- Post-deploy health checks

### Monitoring
- Health check endpoint: `GET /api/health`
- Error logging: `POST /api/errors`
- Activity logging: `activity_log` table
- Email logs: `email_logs` table

### Logging
- Console logging in development
- Structured logging with context
- TODO: Sentry integration for production

---

## 13. SECURITY CONSIDERATIONS

### Authentication
- Admin password-based (not ideal for production)
- Cookie-based sessions
- Rate limiting on login
- Middleware protection on admin routes

### Data Protection
- Supabase RLS policies
- HTTPS only in production
- Secure cookie flags
- Input validation on all forms

### Payment Security
- Stripe webhook signature verification
- Idempotency checks for webhook events
- PCI compliance via Stripe
- No sensitive data stored locally

### TODO Security Improvements
- Implement proper user authentication (OAuth, JWT)
- Add CSRF protection
- Implement API key authentication for admin endpoints
- Add request signing for webhooks
- Implement audit logging for all admin actions

---

## 14. PERFORMANCE OPTIMIZATIONS

### Frontend
- Lazy loading of components
- Image optimization with blur placeholders
- Code splitting
- CSS-in-JS with Tailwind
- React 19 RC optimizations

### Backend
- Database query optimization
- Caching with ISR
- Webhook event deduplication
- Batch operations where possible

### Database
- Indexes on frequently queried columns
- RLS policies for data filtering
- Connection pooling via Supabase

---

## 15. KNOWN ISSUES & TECHNICAL DEBT

1. **Yoga Dome Image Bug** - Images incorrectly categorized
2. **Supabase Bucket URL Mismatch** - Old URLs need fixing
3. **NaN Pricing Calculations** - Past calculation bugs
4. **Missing Error Tracking** - No Sentry integration
5. **Admin Auth** - Password-based, not scalable
6. **Incomplete Features** - Multi-language, activities, taxes
7. **Dead Code** - Debug endpoints, unused routes
8. **Agent Logging** - Debug logging to external service

---

## 16. RECOMMENDATIONS

### High Priority
1. Implement proper user authentication (OAuth/JWT)
2. Add Sentry for error tracking
3. Fix admin authentication (use proper session management)
4. Implement CSRF protection
5. Add comprehensive audit logging

### Medium Priority
1. Complete multi-language support
2. Implement activity management in booking flow
3. Add tax calculation to pricing
4. Remove debug endpoints and dead code
5. Implement API key authentication

### Low Priority
1. Add analytics dashboard
2. Implement customer portal
3. Add SMS notifications
4. Implement loyalty program
5. Add advanced reporting

---

## 17. CONCLUSION

This is a well-structured, feature-rich booking system for a surf retreat center. The codebase demonstrates good separation of concerns, comprehensive testing, and thoughtful error handling. However, there are opportunities for improvement in authentication, error tracking, and code cleanup. The system is production-ready but would benefit from the recommended security and architectural improvements.
