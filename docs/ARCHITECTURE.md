# HEIWA HOUSE - Architecture Documentation

## 1. Project Overview

**Heiwa House** is a premium surf and lifestyle destination website built for a guesthouse in Santa Cruz, Portugal. The application combines a modern public-facing website with a comprehensive admin management system, enabling booking operations, content management, and business analytics.

### Key Purpose
- Showcase surf camp experiences, room accommodations, and activities
- Facilitate online bookings for surf weeks and rooms
- Manage business operations (bookings, payments, invoices, clients)
- Provide content management capabilities for dynamic site content
- Track analytics and revenue

### Location
Portugal (Santa Cruz) - www.heiwahouse.com

---

## 2. Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19.0.0-rc.1** - UI library
- **TypeScript 5.9.2** - Type safety
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **Framer Motion 12.23.22** - Animation library
- **React Hook Form 7.63.0** - Form management
- **Radix UI** - Headless component library
- **Lucide React 0.544.0** - Icon library
- **date-fns 4.1.0** - Date manipulation
- **Zod 3.23.8** - Schema validation

### Backend & Database
- **Next.js API Routes** - Serverless backend
- **Supabase 2.58.0** - PostgreSQL database and authentication
- **Stripe 20.0.0** - Payment processing
- **Resend 6.4.2** - Email service

### Development Tools
- **ESLint 9.36.0** - Code linting
- **Playwright 1.56.1** - E2E testing
- **ts-node 10.9.2** - TypeScript execution for scripts

### Deployment
- **Netlify** - Hosting platform with automatic deployments

---

## 3. Directory Structure

```
heiwa-page/
├── app/                           # Next.js App Router
│   ├── admin/                     # Admin dashboard pages
│   │   ├── bookings/              # Booking management
│   │   ├── clients/               # Client management
│   │   ├── payments/              # Payment management
│   │   ├── invoices/              # Invoice management
│   │   ├── calendar/              # Calendar/scheduling
│   │   ├── cms/                   # Content management system
│   │   ├── surf-camps/            # Surf week management
│   │   ├── gallery/               # Media gallery
│   │   ├── blog/                  # Blog management
│   │   ├── add-ons/               # Add-on services
│   │   ├── activities/            # Activity management
│   │   ├── analytics/             # Analytics dashboard
│   │   └── assignments/           # Room assignments
│   ├── api/                       # API routes
│   │   ├── bookings/              # Booking endpoints
│   │   ├── rooms/                 # Room endpoints
│   │   ├── surf-camps/            # Surf camp endpoints
│   │   ├── payments/              # Payment endpoints
│   │   ├── invoices/              # Invoice endpoints
│   │   ├── clients/               # Client endpoints
│   │   ├── cms/                   # CMS endpoints
│   │   ├── admin/                 # Admin-only endpoints
│   │   ├── stripe/                # Stripe webhook
│   │   └── email/                 # Email service
│   ├── booking/                   # Public booking interface
│   ├── gallery/                   # Photo gallery
│   ├── surf-weeks/                # Surf week listing
│   ├── rooms/                     # Room showcase
│   ├── blog/                      # Blog pages
│   ├── flow/                      # Yoga/wellness
│   ├── play/                      # Activities
│   └── the-spot/                  # Location showcase
├── components/                    # Reusable React components
│   ├── admin/                     # Admin-specific components
│   │   ├── inline-editor/         # CMS inline editing
│   │   ├── calendar/              # Calendar components
│   │   └── bookings/              # Booking components
│   ├── BookingWidget/             # Booking form wizard
│   └── ui/                        # Shared UI components (80+ files)
├── lib/                           # Utilities and services
│   ├── database.types.ts          # Auto-generated Supabase types
│   ├── supabase.ts                # Supabase client setup
│   ├── booking-service.ts         # Booking business logic
│   ├── email-service.ts           # Email templates
│   ├── repositories/              # Data access layer
│   ├── services/                  # Business logic services
│   ├── hooks/                     # React custom hooks
│   └── utils/                     # Utility functions
├── public/                        # Static assets
├── scripts/                       # Build and migration scripts
└── playwright/                    # E2E test configurations
```

---

## 4. API Endpoints

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings with filters |
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/[id]` | Get specific booking |
| PUT | `/api/bookings/[id]` | Update booking |
| DELETE | `/api/bookings/[id]` | Delete booking |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | List all active rooms |
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms/[id]` | Get room details |
| PUT | `/api/rooms/[id]` | Update room |
| GET | `/api/rooms/availability` | Check room availability |

### Surf Camps
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/surf-camps` | List active surf camps |
| POST | `/api/surf-camps` | Create surf camp |
| GET | `/api/surf-camps/[id]` | Get surf camp details |
| PUT | `/api/surf-camps/[id]` | Update surf camp |

### Payments & Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Create payment record |
| POST | `/api/payments/[id]/refund` | Process refund |
| GET | `/api/create-payment-intent` | Stripe payment intent |
| POST | `/api/stripe/webhook` | Stripe webhook handler |
| GET | `/api/invoices` | List invoices |
| GET | `/api/invoices/[id]/pdf` | Generate PDF invoice |

### CMS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/pages/[slug]` | Get page content |
| GET | `/api/cms/sections` | List page sections |
| POST | `/api/cms/sections` | Create section |
| PUT | `/api/cms/sections/[id]` | Update section |
| POST | `/api/cms/sections/reorder` | Reorder sections |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin authentication |
| GET | `/api/admin/stats` | Admin statistics |
| GET | `/api/admin/analytics` | Analytics data |

---

## 5. Database Schema

### Core Business Tables

#### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| client_ids | UUID[] | Array of client references |
| check_in | DATE | Arrival date |
| check_out | DATE | Departure date |
| room_type | STRING | Room or surf_camp type |
| guests | INTEGER | Number of guests |
| total_amount | DECIMAL | Total price |
| payment_status | STRING | pending, paid, refunded |
| status | STRING | pending, confirmed, cancelled |

#### `rooms`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | STRING | Room name |
| capacity | INTEGER | Max guests |
| price_per_night | DECIMAL | Nightly rate |
| images | STRING[] | Image URLs |
| amenities | JSON | Features array |
| is_active | BOOLEAN | Availability status |

#### `surf_camps`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | STRING | Program name |
| start_date | DATE | Start date |
| end_date | DATE | End date |
| price | DECIMAL | Cost per participant |
| max_participants | INTEGER | Capacity |
| is_active | BOOLEAN | Status |

#### `clients`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | STRING | Full name |
| email | STRING | Email address |
| phone | STRING | Phone number |
| vip | BOOLEAN | VIP status |

#### `payments`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| booking_id | UUID | Booking reference |
| amount | DECIMAL | Payment amount |
| payment_status | STRING | pending, completed, failed |
| payment_method | STRING | card, bank_transfer |

### CMS Tables

#### `page_sections`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| page_slug | STRING | Page identifier |
| section_type | STRING | hero, text, image, etc. |
| content | JSON | Section content |
| order_index | INTEGER | Display order |
| is_active | BOOLEAN | Published status |

#### `testimonials`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| author_name | STRING | Guest name |
| rating | INTEGER | 1-5 stars |
| text | STRING | Review text |
| is_active | BOOLEAN | Published |

#### `faq_items`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| page_slug | STRING | Associated page |
| question | STRING | Question text |
| answer | STRING | Answer text |
| order_index | INTEGER | Display order |

---

## 6. Major Features

### Booking System
- Multi-step booking wizard with form validation
- Real-time availability checking
- Guest detail collection with dietary preferences
- Room and participant assignment
- Add-on service selection
- Dynamic pricing with tax calculations

### Payment Processing
- Stripe payment intent creation
- Multiple payment methods (card, bank transfer)
- Payment status tracking
- Refund processing
- Invoice generation

### Content Management System (CMS)
- Unified page section editor
- Drag-and-drop section reordering
- Rich text editing
- Image upload and management
- Version history tracking
- SEO metadata management
- WordPress-style sidebar editing

### Admin Dashboard
- Real-time booking and revenue statistics
- Booking calendar view
- Client database with search/filtering
- Payment and invoice management
- Room and surf camp management
- Analytics dashboard

### Blog System
- Rich-text post editor
- Multilingual translations
- Author and category management
- SEO metadata
- Tag system

### Email Management
- Pre-trip and post-trip email templates
- Contact form notifications
- Scheduled email campaigns
- Email logging and tracking

---

## 7. Authentication & Security

- **Admin Authentication**: Cookie-based sessions via `requireAdminAuth()` middleware
- **Protected Routes**: Server-side auth check in API routes
- **Environment Variables**: Sensitive data in .env.local
- **Stripe Webhook Verification**: Signature validation
- **SQL Injection Prevention**: Parameterized queries via Supabase

---

## 8. Development Workflow

### Running Locally
```bash
npm install
npm run dev  # Start dev server on http://localhost:3000
```

### Building
```bash
npm run build
npm start  # Production server
```

### Testing
```bash
npm run test:e2e  # Run Playwright tests
```

### Linting
```bash
npm run lint
```

---

## 9. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY
```

---

## 10. External Integrations

| Service | Purpose |
|---------|---------|
| Stripe | Payment processing |
| Supabase | PostgreSQL database, file storage |
| Resend | Email delivery |
| Google | Reviews aggregation |

---

*Generated: December 2024*
