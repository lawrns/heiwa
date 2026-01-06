import { z } from 'zod';

// Helper schema for Supabase timestamps (ISO strings or Date objects)
const TimestampSchema = z.union([
  z.string(),
  z.date(),
  z.object({ seconds: z.number(), nanoseconds: z.number().optional() })
]);

// Client schema
export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required'),
  socials: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
  lastBookingDate: TimestampSchema.optional(),
  notes: z.string().optional().default(''),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Client = z.infer<typeof ClientSchema>;

// Surf Camp schema (legacy - keeping for backward compatibility)
export const SurfCampSchema = z.object({
  id: z.string(),
  category: z.enum(['FR', 'HH']),
  startDate: TimestampSchema,
  endDate: TimestampSchema,
  availableRooms: z.array(z.string()),
  occupancy: z.number().min(1, 'Occupancy must be at least 1'),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type SurfCamp = z.infer<typeof SurfCampSchema>;

// Camp Week schema (new structure for customer-facing weeks)
export const CampWeekSchema = z.object({
  id: z.string(),
  campId: z.string(), // Links to surf camp
  startDate: TimestampSchema,
  endDate: TimestampSchema,
  category: z.enum(['FreedomRoutes', 'Heiwa']),
  published: z.boolean().default(false),
  maxGuests: z.number().min(1),
  pricingRules: z.record(z.string(), z.any()), // Flexible pricing structure
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type CampWeek = z.infer<typeof CampWeekSchema>;

// Room pricing schema
const RoomPricingSchema = z.object({
  standard: z.number().min(0, 'Standard price must be non-negative'),
  offSeason: z.number().min(0, 'Off-season price must be non-negative'),
  camp: z.union([
    z.record(z.number(), z.number().min(0)), // For occupancy-based pricing
    z.object({ perBed: z.number().min(0) })   // For per-bed pricing
  ]),
});

// Room schema
export const RoomSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Room name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  bookingType: z.enum(['whole', 'perBed']),
  pricing: RoomPricingSchema,
  amenities: z.array(z.string()).default([]),
  bedTypes: z.array(z.enum(['single', 'double', 'bunk'])).default([]),
  description: z.string().optional().default(''),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Room = z.infer<typeof RoomSchema>;

// Add-on schema
export const AddOnSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Add-on name is required'),
  description: z.string().optional().default(''),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.enum(['equipment', 'service', 'food', 'transport', 'other']),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  maxQuantity: z.number().min(1).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type AddOn = z.infer<typeof AddOnSchema>;

// Booking item schema
const BookingItemSchema = z.object({
  type: z.enum(['room', 'surfCamp', 'addOn']),
  itemId: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  dates: z.object({
    checkIn: TimestampSchema,
    checkOut: TimestampSchema,
  }).optional(),
});

// Booking schema
export const BookingSchema = z.object({
  id: z.string(),
  client_ids: z.array(z.string()).min(1, 'At least one client is required'),
  items: z.array(BookingItemSchema).min(1, 'At least one booking item is required'),
  total_amount: z.number().min(0, 'Total amount must be non-negative'),
  payment_status: z.enum(['pending', 'confirmed', 'cancelled']),
  payment_method: z.enum(['stripe', 'cash', 'transfer', 'other']).optional(),
  notes: z.string().optional().default(''),
  source: z.enum(['dashboard', 'wordpress', 'api']).optional().default('dashboard'),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingItem = z.infer<typeof BookingItemSchema>;

// Collection names
export const COLLECTIONS = {
  CLIENTS: 'clients',
  SURF_CAMPS: 'surfCamps',
  ROOMS: 'rooms',
  ADD_ONS: 'addOns',
  BOOKINGS: 'bookings',
  CAMP_WEEKS: 'campWeeks',
  ROOM_ASSIGNMENTS: 'roomAssignments',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  AUTOMATIONS: 'automations',
  EXTERNAL_CALENDAR_EVENTS: 'externalCalendarEvents',
  FEATURE_FLAGS: 'featureFlags',
} as const;

// Form schemas for creating/updating entities
export const CreateClientSchema = ClientSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateClientSchema = CreateClientSchema.partial();

export const CreateSurfCampSchema = SurfCampSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateSurfCampSchema = CreateSurfCampSchema.partial();

export const CreateRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  bookingType: z.enum(['whole', 'perBed']),
  pricing: RoomPricingSchema,
  amenities: z.array(z.string()),
  bedTypes: z.array(z.enum(['single', 'double', 'bunk'])).default([]),
  description: z.string(),
  images: z.array(z.string()),
  isActive: z.boolean(),
});
export const UpdateRoomSchema = CreateRoomSchema.partial();

export const CreateAddOnSchema = z.object({
  name: z.string().min(1, 'Add-on name is required'),
  description: z.string(),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.enum(['equipment', 'service', 'food', 'transport', 'other']),
  images: z.array(z.string()),
  isActive: z.boolean(),
  maxQuantity: z.number().min(1).optional(),
});
export const UpdateAddOnSchema = CreateAddOnSchema.partial();

export const CreateBookingSchema = BookingSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateBookingSchema = CreateBookingSchema.partial();

// Form schema for booking creation with proper defaults
export const CreateBookingFormSchema = CreateBookingSchema.extend({
  source: z.enum(['dashboard', 'wordpress', 'api']).default('dashboard'),
});

export type CreateBookingForm = z.infer<typeof CreateBookingFormSchema>;

export const CreateCampWeekSchema = CampWeekSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateCampWeekSchema = CreateCampWeekSchema.partial();

// Invoice schema
export const InvoiceSchema = z.object({
  id: z.string(),
  booking_id: z.string(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().default('EUR'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  due_date: TimestampSchema.optional(),
  sent_date: TimestampSchema.optional(),
  paid_date: TimestampSchema.optional(),
  created_at: TimestampSchema,
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export const CreateInvoiceSchema = InvoiceSchema.omit({ id: true, created_at: true, invoice_number: true }).extend({
  booking_id: z.string().min(1, 'Booking ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  due_date: z.string().optional(),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

// Payment schema
export const PaymentSchema = z.object({
  id: z.string(),
  booking_id: z.string(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().default('EUR'),
  payment_method: z.enum(['stripe', 'cash', 'transfer', 'paypal', 'other']),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded', 'partially_refunded']),
  transaction_id: z.string().optional(),
  payment_date: TimestampSchema.optional(),
  refund_amount: z.number().min(0).optional(),
  refund_reason: z.string().optional(),
  notes: z.string().optional(),
  created_at: TimestampSchema,
});

export type Payment = z.infer<typeof PaymentSchema>;

export const CreatePaymentSchema = PaymentSchema.omit({ id: true, created_at: true }).extend({
  booking_id: z.string().min(1, 'Booking ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  payment_date: z.string().optional(),
});

export const UpdatePaymentSchema = CreatePaymentSchema.partial();

export const RefundPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Refund amount must be greater than 0'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// ADDITIONAL VALIDATION SCHEMAS
// ============================================

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

// Participant schema for bookings
export const ParticipantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  dateOfBirth: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(1),
    phone: z.string().min(10),
  }).optional(),
});

export type Participant = z.infer<typeof ParticipantSchema>;

// Room assignment schema
export const RoomAssignmentSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  bedType: z.enum(['single', 'double', 'bunk', 'sofa']).optional(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  numberOfGuests: z.number().min(1).max(10),
});

export type RoomAssignment = z.infer<typeof RoomAssignmentSchema>;

// CMS Homepage section schema
export const CMSHomepageSectionSchema = z.object({
  section: z.enum(['hero', 'features', 'activities', 'testimonials', 'cta']),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  videoId: z.string().optional(),
  linkUrl: z.string().url('Invalid link URL').optional(),
  linkText: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().min(0).default(0),
  cards: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().min(1),
    image: z.string().url().optional(),
    link: z.string().url().optional(),
  })).optional(),
  testimonials: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    text: z.string().min(10),
    rating: z.number().min(1).max(5),
    date: z.string().optional(),
  })).optional(),
});

export type CMSHomepageSection = z.infer<typeof CMSHomepageSectionSchema>;

// Payment webhook schema (Stripe)
export const PaymentWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  api_version: z.string(),
  created: z.number(),
  data: z.object({
    object: z.object({
      id: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      metadata: z.record(z.string()).optional(),
    }),
  }),
  livemode: z.boolean(),
  pending_webhooks: z.number().optional(),
  request: z.object({
    id: z.string().optional(),
    idempotency_key: z.string().optional(),
  }).optional(),
  type: z.string(),
});

export type PaymentWebhook = z.infer<typeof PaymentWebhookSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate request body against schema
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }
  return result.data;
}

/**
 * Validate query parameters against schema
 */
export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return validateRequestBody(schema, params);
}

/**
 * Create validation error response
 */
export function createValidationError(errors: Array<{ field: string; message: string }>) {
  return {
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: errors,
  };
}
