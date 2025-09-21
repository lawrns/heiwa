# Data Model: Heiwa Booking Suite

## Overview
13 core entities supporting multi-brand surf camp booking platform with WordPress widget integration, admin operations, and Stripe payments.

## Entity Definitions

### Brand
**Purpose**: Multi-brand support for Heiwa House, Freedom Routes, etc.
**Fields**:
- `id`: UUID (primary key)
- `name`: VARCHAR(100) NOT NULL
- `slug`: VARCHAR(50) UNIQUE NOT NULL
- `theme_config`: JSONB (colors, typography, logos)
- `api_config`: JSONB (endpoint URLs, keys)
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- 1:M with Property (brand has many properties)
- 1:M with PromoCode (brand-specific promotions)

**Validation Rules**:
- slug must be URL-safe
- theme_config must contain required color/typography keys
- api_config must include valid URLs

### Property
**Purpose**: Physical surf camp locations owned by different operators
**Fields**:
- `id`: UUID (primary key)
- `brand_id`: UUID (foreign key → Brand)
- `name`: VARCHAR(200) NOT NULL
- `description`: TEXT
- `location`: JSONB (address, coordinates, timezone)
- `contact_info`: JSONB (phone, email, website)
- `owner_id`: UUID (foreign key → Admin/Owner)
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- M:1 with Brand
- 1:M with CampWeek
- 1:M with Room
- M:1 with Admin (owner)

**Validation Rules**:
- Must belong to active brand
- Location must include coordinates and timezone
- Contact info must have at least email or phone

### CampWeek
**Purpose**: Specific week-long camp sessions with capacity and pricing
**Fields**:
- `id`: UUID (primary key)
- `property_id`: UUID (foreign key → Property)
- `name`: VARCHAR(200) NOT NULL
- `start_date`: DATE NOT NULL
- `end_date`: DATE NOT NULL
- `base_price`: DECIMAL(10,2) NOT NULL
- `capacity`: INTEGER NOT NULL
- `booked_count`: INTEGER DEFAULT 0
- `is_active`: BOOLEAN DEFAULT true
- `blackout_dates`: DATE[] DEFAULT '{}'
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- M:1 with Property
- 1:M with Booking

**Validation Rules**:
- end_date > start_date
- capacity > 0
- booked_count ≤ capacity
- No overlapping camp weeks for same property
- Blackout dates must be within camp week range

### Room
**Purpose**: Accommodation units within properties
**Fields**:
- `id`: UUID (primary key)
- `property_id`: UUID (foreign key → Property)
- `name`: VARCHAR(100) NOT NULL
- `description`: TEXT
- `room_type`: VARCHAR(50) NOT NULL (dorm, private, suite)
- `max_occupancy`: INTEGER NOT NULL
- `base_price`: DECIMAL(10,2) NOT NULL
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- M:1 with Property
- 1:M with Bed

**Validation Rules**:
- max_occupancy > 0
- room_type must be valid enum value

### Bed
**Purpose**: Individual sleeping spaces within rooms with pricing tiers
**Fields**:
- `id`: UUID (primary key)
- `room_id`: UUID (foreign key → Room)
- `name`: VARCHAR(50) NOT NULL (e.g., "Top Bunk A", "Window Side")
- `bed_type`: VARCHAR(30) NOT NULL (single, bunk, double)
- `price_modifier`: DECIMAL(10,2) DEFAULT 0.00
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- M:1 with Room
- 1:M with Booking (through booking_bed junction)

**Validation Rules**:
- bed_type must be valid enum
- price_modifier can be positive (premium) or negative (discount)

### Addon
**Purpose**: Additional services or items that can be booked
**Fields**:
- `id`: UUID (primary key)
- `property_id`: UUID (foreign key → Property)
- `name`: VARCHAR(100) NOT NULL
- `description`: TEXT
- `category`: VARCHAR(50) NOT NULL (surf-lessons, equipment, meals, transport)
- `price`: DECIMAL(10,2) NOT NULL
- `is_required`: BOOLEAN DEFAULT false
- `max_quantity`: INTEGER DEFAULT 1
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- M:1 with Property
- M:M with Booking (through booking_addon junction)

**Validation Rules**:
- category must be valid enum
- price ≥ 0
- max_quantity > 0

### Customer
**Purpose**: End users making bookings through WordPress widget
**Fields**:
- `id`: UUID (primary key)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `first_name`: VARCHAR(100) NOT NULL
- `last_name`: VARCHAR(100) NOT NULL
- `phone`: VARCHAR(20)
- `date_of_birth`: DATE
- `emergency_contact`: JSONB (name, phone, relationship)
- `preferences`: JSONB (language, notifications)
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- 1:M with Booking

**Validation Rules**:
- Email must be valid format
- Phone optional but must be valid format if provided
- Emergency contact required for booking

### Booking
**Purpose**: Reservation records linking customers to specific camp sessions
**Fields**:
- `id`: UUID (primary key)
- `customer_id`: UUID (foreign key → Customer)
- `camp_week_id`: UUID (foreign key → CampWeek)
- `status`: VARCHAR(20) NOT NULL DEFAULT 'draft'
- `total_amount`: DECIMAL(10,2) NOT NULL
- `currency`: VARCHAR(3) DEFAULT 'USD'
- `booking_date`: TIMESTAMPTZ DEFAULT NOW()
- `check_in_date`: DATE
- `check_out_date`: DATE
- `special_requests`: TEXT
- `promo_code_id`: UUID (foreign key → PromoCode)
- `discount_amount`: DECIMAL(10,2) DEFAULT 0.00
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- M:1 with Customer
- M:1 with CampWeek
- M:1 with PromoCode (optional)
- M:M with Bed (through booking_bed)
- M:M with Addon (through booking_addon)
- 1:M with Payment

**Validation Rules**:
- Status must be valid enum: draft, pending, paid, confirmed, cancelled, refunded, partial
- Total amount ≥ 0
- Check-in/out dates must match camp week
- Cannot book more beds than available

**State Transitions**:
- draft → pending (payment initiated)
- pending → paid (payment successful)
- paid → confirmed (booking confirmed)
- confirmed → cancelled (customer/admin cancellation)
- paid/confirmed → refunded (full refund)
- paid/confirmed → partial (partial refund)

### Payment
**Purpose**: Financial transactions through Stripe with intent tracking
**Fields**:
- `id`: UUID (primary key)
- `booking_id`: UUID (foreign key → Booking)
- `stripe_payment_intent_id`: VARCHAR(255) UNIQUE NOT NULL
- `amount`: DECIMAL(10,2) NOT NULL
- `currency`: VARCHAR(3) DEFAULT 'USD'
- `status`: VARCHAR(20) NOT NULL
- `stripe_fee`: DECIMAL(10,2)
- `net_amount`: DECIMAL(10,2)
- `payment_method`: JSONB
- `failure_reason`: TEXT
- `processed_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- M:1 with Booking

**Validation Rules**:
- Status must be valid Stripe status enum
- Amount must match booking total
- Stripe payment intent ID must be unique

### PromoCode
**Purpose**: Discount codes with validation rules and usage limits
**Fields**:
- `id`: UUID (primary key)
- `brand_id`: UUID (foreign key → Brand)
- `code`: VARCHAR(50) UNIQUE NOT NULL
- `description`: TEXT
- `discount_type`: VARCHAR(20) NOT NULL (percentage, fixed)
- `discount_value`: DECIMAL(10,2) NOT NULL
- `minimum_amount`: DECIMAL(10,2) DEFAULT 0.00
- `max_uses`: INTEGER
- `used_count`: INTEGER DEFAULT 0
- `valid_from`: TIMESTAMPTZ
- `valid_until`: TIMESTAMPTZ
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- M:1 with Brand
- 1:M with Booking

**Validation Rules**:
- discount_type must be valid enum
- discount_value > 0
- If percentage, discount_value ≤ 100
- If max_uses set, used_count ≤ max_uses
- Valid date range if specified

### Owner
**Purpose**: Property operators with limited administrative access
**Fields**:
- `id`: UUID (primary key)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `first_name`: VARCHAR(100) NOT NULL
- `last_name`: VARCHAR(100) NOT NULL
- `company_name`: VARCHAR(200)
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- 1:M with Property

**Validation Rules**:
- Email must be valid and unique
- Company name optional but recommended

### Admin
**Purpose**: Platform administrators with full system access
**Fields**:
- `id`: UUID (primary key)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `first_name`: VARCHAR(100) NOT NULL
- `last_name`: VARCHAR(100) NOT NULL
- `role`: VARCHAR(20) NOT NULL DEFAULT 'admin'
- `is_active`: BOOLEAN DEFAULT true
- `last_login`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- None direct (full system access via RLS bypass)

**Validation Rules**:
- Role must be valid enum: admin, super_admin
- Email must be valid and unique

### WebhookEvent
**Purpose**: Stripe webhook events for payment processing and reconciliation
**Fields**:
- `id`: UUID (primary key)
- `stripe_event_id`: VARCHAR(255) UNIQUE NOT NULL
- `event_type`: VARCHAR(100) NOT NULL
- `event_data`: JSONB NOT NULL
- `processed`: BOOLEAN DEFAULT false
- `processing_attempts`: INTEGER DEFAULT 0
- `last_attempt_at`: TIMESTAMPTZ
- `error_message`: TEXT
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

**Relationships**:
- None direct (references payments through event data)

**Validation Rules**:
- Stripe event ID must be unique
- Event type must be valid Stripe webhook type
- Processing attempts tracked for retry logic

## Junction Tables

### booking_bed
**Purpose**: Many-to-many relationship between bookings and beds
- `booking_id`: UUID (foreign key → Booking)
- `bed_id`: UUID (foreign key → Bed)
- `assigned_at`: TIMESTAMPTZ DEFAULT NOW()
- Primary key: (booking_id, bed_id)

### booking_addon
**Purpose**: Many-to-many relationship between bookings and addons
- `booking_id`: UUID (foreign key → Booking)
- `addon_id`: UUID (foreign key → Addon)
- `quantity`: INTEGER NOT NULL DEFAULT 1
- `unit_price`: DECIMAL(10,2) NOT NULL
- `total_price`: DECIMAL(10,2) NOT NULL
- `added_at`: TIMESTAMPTZ DEFAULT NOW()
- Primary key: (booking_id, addon_id)

## Indexes Required
- Properties: brand_id, owner_id, is_active
- CampWeeks: property_id, start_date, end_date, is_active
- Rooms: property_id, is_active
- Beds: room_id, is_active
- Addons: property_id, category, is_active
- Customers: email
- Bookings: customer_id, camp_week_id, status, booking_date
- Payments: booking_id, stripe_payment_intent_id, status
- PromoCodes: brand_id, code, is_active, valid_until
- WebhookEvents: processed, created_at, event_type

## RLS Policies Overview
- **Brand isolation**: Users see only their brand's data
- **Property ownership**: Owners see only their properties
- **Customer privacy**: Customers see only their bookings/payments
- **Admin access**: Admins see all data (service role bypass)
- **Public access**: Read-only access for availability/pricing queries

## RPC Functions Required
- `get_available_beds(camp_week_id, start_date, end_date)`
- `calculate_booking_price(brand_id, beds, addons, promo_code)`
- `validate_promo_code(code, brand_id, booking_amount)`
- `get_property_availability(property_id, check_in, check_out)`
