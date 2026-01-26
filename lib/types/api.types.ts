/**
 * Shared API Types
 *
 * Common types used across API routes for consistent type safety.
 */

import type {
  Booking,
  Client,
  Room,
  SurfCamp,
  SurfCampEnrollment,
  RoomAssignment,
  Payment,
  Invoice,
  Testimonial,
  BlogPost,
  BlogAuthor,
  BlogCategory,
  BlogTag,
  PageSection,
  Experience,
  AddOn,
  ContactSubmission,
  MediaLibraryItem,
  Json,
} from '@/lib/database.types';

// Re-export database types for convenience
export type {
  Booking,
  Client,
  Room,
  SurfCamp,
  SurfCampEnrollment,
  RoomAssignment,
  Payment,
  Invoice,
  Testimonial,
  BlogPost,
  BlogAuthor,
  BlogCategory,
  BlogTag,
  PageSection,
  Experience,
  AddOn,
  ContactSubmission,
  MediaLibraryItem,
  Json,
};

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  count?: number;
  total?: number;
  limit?: number;
  offset?: number;
}

export interface ApiError {
  success: false;
  error: string;
  errorCode?: string;
  details?: unknown;
}

// ============================================================================
// Booking Types
// ============================================================================

export interface BookingWithClient extends Booking {
  client?: Client;
  clients?: Client[];
}

export interface TransformedBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  type: 'room' | 'surf_camp';
  item_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string | null;
  special_requests: string;
  dietary_preferences: string;
  client_notes: string;
  notes: string;
  client_ids: string[];
  participants?: Participant[];
  room_assignments?: RoomAssignmentInfo[];
}

export interface Participant {
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dietaryRequirements?: string;
  specialRequests?: string;
  skillLevel?: string;
  clientId?: string;
}

export interface RoomAssignmentInfo {
  roomId: string;
  roomName: string;
  roomType: string;
  capacity: number;
  bedNumber: number | null;
  checkInDate: string;
  checkOutDate: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  enrollmentId: string | null;
}

// ============================================================================
// Room Types
// ============================================================================

export interface RoomWithAvailability extends Room {
  available?: boolean;
  availableBeds?: number;
}

export interface RoomPricing {
  standard: number;
  offSeason?: number;
  highSeason?: number;
  perBed?: number;
}

// ============================================================================
// Surf Camp Types
// ============================================================================

export interface SurfCampWithEnrollments extends SurfCamp {
  enrollments?: SurfCampEnrollment[];
  enrollmentCount?: number;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface PaymentWithBooking extends Payment {
  booking?: Booking;
  client?: Client;
}

// ============================================================================
// Blog Types
// ============================================================================

export interface BlogPostWithRelations extends BlogPost {
  author?: BlogAuthor;
  category?: BlogCategory;
  tags?: BlogTag[];
  translations?: BlogPostTranslation[];
}

export interface BlogPostTranslation {
  id: string;
  post_id: string;
  locale: string;
  slug_localized: string;
  title: string;
  excerpt: string | null;
  body_rich: Json;
  cover_image_url: string | null;
  cover_alt_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

// ============================================================================
// Calendar Types
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type?: string;
  location?: string;
  color?: string;
  booking_id?: string;
  client_name?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
  bookingsByStatus: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topRooms: Array<{ name: string; bookings: number }>;
}

export interface BookingAnalytics {
  period: string;
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  revenue: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface BookingFormData {
  room_id?: string;
  camp_id?: string;
  start_date: string;
  end_date: string;
  guests: number;
  participants: Participant[];
  message?: string;
}

// ============================================================================
// Widget Types
// ============================================================================

export interface WidgetConfig {
  mode: 'rooms' | 'surf-camps' | 'both';
  primaryColor?: string;
  allowMultipleRooms?: boolean;
  showPricing?: boolean;
}

export interface WidgetBookingRequest {
  type: 'room' | 'surf_camp';
  item_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  participants: Participant[];
  add_ons?: string[];
  pricing: {
    subtotal: number;
    addOns: number;
    total: number;
  };
  source_url?: string;
  widget_version?: string;
}

// ============================================================================
// CMS Types
// ============================================================================

export interface PageSectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  link_url?: string;
  link_text?: string;
  cards?: CardContent[];
  items?: unknown[];
}

export interface CardContent {
  title: string;
  description?: string;
  image?: string;
  link?: string;
  icon?: string;
}

export interface HomepageSectionData {
  section: string;
  title: string;
  subtitle?: string;
  description?: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  link_url?: string;
  link_text?: string;
  is_active: boolean;
  order_index: number;
  cards?: CardContent[];
}

// ============================================================================
// Filter Types
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
}

export interface BookingFilters {
  status?: string;
  payment_status?: string;
  room_type?: string;
  date_range?: DateRange;
  search?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
