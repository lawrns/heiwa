/**
 * Repository Exports
 *
 * Typed database access layer using the repository pattern.
 * Import repositories from this file for type-safe database operations.
 */

import { BaseRepository } from './base.repository';
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
  HomepageContent,
  MediaLibraryItem,
  ContactSubmission,
  Experience,
  AddOn,
  InsertBooking,
  InsertClient,
  InsertRoom,
  InsertSurfCamp,
  InsertSurfCampEnrollment,
  InsertRoomAssignment,
  InsertPayment,
  InsertInvoice,
  InsertTestimonial,
  InsertBlogPost,
  InsertBlogAuthor,
  InsertBlogCategory,
  InsertBlogTag,
  InsertPageSection,
  InsertHomepageContent,
  InsertMediaLibraryItem,
  InsertContactSubmission,
  InsertExperience,
  InsertAddOn,
  UpdateBooking,
  UpdateClient,
  UpdateRoom,
  UpdateSurfCamp,
  UpdateSurfCampEnrollment,
  UpdateRoomAssignment,
  UpdatePayment,
  UpdateInvoice,
  UpdateTestimonial,
  UpdateBlogPost,
  UpdateBlogAuthor,
  UpdateBlogCategory,
  UpdateBlogTag,
  UpdatePageSection,
  UpdateHomepageContent,
  UpdateMediaLibraryItem,
  UpdateContactSubmission,
  UpdateExperience,
  UpdateAddOn,
} from '@/lib/database.types';

// Re-export base repository for custom implementations
export { BaseRepository } from './base.repository';
export type { QueryOptions, QueryResult, SingleResult } from './base.repository';

// ============================================================================
// Repository Instances - Singleton pattern for efficiency
// ============================================================================

class BookingRepository extends BaseRepository<'bookings', Booking, InsertBooking, UpdateBooking> {
  constructor() {
    super('bookings');
  }
}

class ClientRepository extends BaseRepository<'clients', Client, InsertClient, UpdateClient> {
  constructor() {
    super('clients');
  }
}

class RoomRepository extends BaseRepository<'rooms', Room, InsertRoom, UpdateRoom> {
  constructor() {
    super('rooms');
  }
}

class SurfCampRepository extends BaseRepository<'surf_camps', SurfCamp, InsertSurfCamp, UpdateSurfCamp> {
  constructor() {
    super('surf_camps');
  }
}

class SurfCampEnrollmentRepository extends BaseRepository<
  'surf_camp_enrollments',
  SurfCampEnrollment,
  InsertSurfCampEnrollment,
  UpdateSurfCampEnrollment
> {
  constructor() {
    super('surf_camp_enrollments');
  }
}

class RoomAssignmentRepository extends BaseRepository<
  'room_assignments',
  RoomAssignment,
  InsertRoomAssignment,
  UpdateRoomAssignment
> {
  constructor() {
    super('room_assignments');
  }
}

class PaymentRepository extends BaseRepository<'payments', Payment, InsertPayment, UpdatePayment> {
  constructor() {
    super('payments');
  }
}

class InvoiceRepository extends BaseRepository<'invoices', Invoice, InsertInvoice, UpdateInvoice> {
  constructor() {
    super('invoices');
  }
}

class TestimonialRepository extends BaseRepository<
  'testimonials',
  Testimonial,
  InsertTestimonial,
  UpdateTestimonial
> {
  constructor() {
    super('testimonials');
  }
}

class BlogPostRepository extends BaseRepository<'blog_posts', BlogPost, InsertBlogPost, UpdateBlogPost> {
  constructor() {
    super('blog_posts');
  }
}

class BlogAuthorRepository extends BaseRepository<
  'blog_authors',
  BlogAuthor,
  InsertBlogAuthor,
  UpdateBlogAuthor
> {
  constructor() {
    super('blog_authors');
  }
}

class BlogCategoryRepository extends BaseRepository<
  'blog_categories',
  BlogCategory,
  InsertBlogCategory,
  UpdateBlogCategory
> {
  constructor() {
    super('blog_categories');
  }
}

class BlogTagRepository extends BaseRepository<'blog_tags', BlogTag, InsertBlogTag, UpdateBlogTag> {
  constructor() {
    super('blog_tags');
  }
}

class PageSectionRepository extends BaseRepository<
  'page_sections',
  PageSection,
  InsertPageSection,
  UpdatePageSection
> {
  constructor() {
    super('page_sections');
  }
}

class HomepageContentRepository extends BaseRepository<
  'homepage_content',
  HomepageContent,
  InsertHomepageContent,
  UpdateHomepageContent
> {
  constructor() {
    super('homepage_content');
  }
}

class MediaLibraryRepository extends BaseRepository<
  'media_library',
  MediaLibraryItem,
  InsertMediaLibraryItem,
  UpdateMediaLibraryItem
> {
  constructor() {
    super('media_library');
  }
}

class ContactSubmissionRepository extends BaseRepository<
  'contact_submissions',
  ContactSubmission,
  InsertContactSubmission,
  UpdateContactSubmission
> {
  constructor() {
    super('contact_submissions');
  }
}

class ExperienceRepository extends BaseRepository<
  'experiences',
  Experience,
  InsertExperience,
  UpdateExperience
> {
  constructor() {
    super('experiences');
  }
}

class AddOnRepository extends BaseRepository<'add_ons', AddOn, InsertAddOn, UpdateAddOn> {
  constructor() {
    super('add_ons');
  }
}

// ============================================================================
// Singleton Exports
// ============================================================================

export const bookingRepository = new BookingRepository();
export const clientRepository = new ClientRepository();
export const roomRepository = new RoomRepository();
export const surfCampRepository = new SurfCampRepository();
export const surfCampEnrollmentRepository = new SurfCampEnrollmentRepository();
export const roomAssignmentRepository = new RoomAssignmentRepository();
export const paymentRepository = new PaymentRepository();
export const invoiceRepository = new InvoiceRepository();
export const testimonialRepository = new TestimonialRepository();
export const blogPostRepository = new BlogPostRepository();
export const blogAuthorRepository = new BlogAuthorRepository();
export const blogCategoryRepository = new BlogCategoryRepository();
export const blogTagRepository = new BlogTagRepository();
export const pageSectionRepository = new PageSectionRepository();
export const homepageContentRepository = new HomepageContentRepository();
export const mediaLibraryRepository = new MediaLibraryRepository();
export const contactSubmissionRepository = new ContactSubmissionRepository();
export const experienceRepository = new ExperienceRepository();
export const addOnRepository = new AddOnRepository();

// ============================================================================
// Convenience object for accessing all repositories
// ============================================================================

export const repositories = {
  bookings: bookingRepository,
  clients: clientRepository,
  rooms: roomRepository,
  surfCamps: surfCampRepository,
  surfCampEnrollments: surfCampEnrollmentRepository,
  roomAssignments: roomAssignmentRepository,
  payments: paymentRepository,
  invoices: invoiceRepository,
  testimonials: testimonialRepository,
  blogPosts: blogPostRepository,
  blogAuthors: blogAuthorRepository,
  blogCategories: blogCategoryRepository,
  blogTags: blogTagRepository,
  pageSections: pageSectionRepository,
  homepageContent: homepageContentRepository,
  mediaLibrary: mediaLibraryRepository,
  contactSubmissions: contactSubmissionRepository,
  experiences: experienceRepository,
  addOns: addOnRepository,
} as const;
