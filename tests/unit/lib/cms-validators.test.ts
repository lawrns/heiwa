/**
 * CMS Validators Unit Tests
 * Tests for content validation rules, schema validation, and error handling
 */

import {
  validateHomepageSection,
  validateCreateHomepageSection,
  validateUpdateHomepageSection,
  validatePageContent,
  validateTestimonial,
  validateFAQItem,
  validateMediaItem,
  validateCTAButton,
  validateActivityLog,
  validateSearchParams,
  validateExportOptions,
  isValidHomepageSection,
  isValidPageContent,
  isValidTestimonial,
  isValidFAQItem,
  isValidMediaItem,
  isValidCTAButton,
  ValidationError,
  handleValidationError,
  CMSErrorCodes,
} from '@/lib/cms-validators';

describe('CMS Validators', () => {
  // ==========================================================================
  // Homepage Section Validation
  // ==========================================================================

  describe('validateHomepageSection', () => {
    const validSection = {
      section_type: 'hero',
      title: 'Welcome to Heiwa',
      subtitle: 'Your surf retreat',
      description: 'Experience the best surf in Portugal',
      content: {},
      is_active: true,
      order_index: 0,
    };

    it('should validate a valid homepage section', () => {
      const result = validateHomepageSection(validSection);
      expect(result.success).toBe(true);
    });

    it('should accept all valid section types', () => {
      const sectionTypes = ['hero', 'activities_around', 'what_we_are_about', 'testimonials', 'cta'];
      
      sectionTypes.forEach(type => {
        const result = validateHomepageSection({ ...validSection, section_type: type });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid section types', () => {
      const result = validateHomepageSection({ ...validSection, section_type: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should accept optional video_url', () => {
      const result = validateHomepageSection({
        ...validSection,
        video_url: 'https://youtube.com/watch?v=123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid video_url format', () => {
      const result = validateHomepageSection({
        ...validSection,
        video_url: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should accept empty string for video_url', () => {
      const result = validateHomepageSection({
        ...validSection,
        video_url: '',
      });
      expect(result.success).toBe(true);
    });

    it('should enforce title max length', () => {
      const result = validateHomepageSection({
        ...validSection,
        title: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should enforce description max length', () => {
      const result = validateHomepageSection({
        ...validSection,
        description: 'a'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('should default is_active to true', () => {
      const result = validateHomepageSection({
        section_type: 'hero',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_active).toBe(true);
      }
    });

    it('should default order_index to 0', () => {
      const result = validateHomepageSection({
        section_type: 'hero',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.order_index).toBe(0);
      }
    });
  });

  // ==========================================================================
  // Page Content Validation
  // ==========================================================================

  describe('validatePageContent', () => {
    const validContent = {
      page_slug: 'surf',
      section: 'hero',
      title: 'Surf Experience',
      content: 'Learn to surf with us',
      is_active: true,
      order_index: 0,
    };

    it('should validate valid page content', () => {
      const result = validatePageContent(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept all valid page slugs', () => {
      const slugs = ['flow', 'play', 'surf', 'the-spot', 'privacy', 'terms'];
      
      slugs.forEach(slug => {
        const result = validatePageContent({ ...validContent, page_slug: slug });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid page slugs', () => {
      const result = validatePageContent({ ...validContent, page_slug: 'invalid-page' });
      expect(result.success).toBe(false);
    });

    it('should accept all valid sections', () => {
      const sections = ['hero', 'intro', 'faq', 'features', 'seo'];
      
      sections.forEach(section => {
        const result = validatePageContent({ ...validContent, section });
        expect(result.success).toBe(true);
      });
    });

    it('should enforce content max length', () => {
      const result = validatePageContent({
        ...validContent,
        content: 'a'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it('should accept json_content object', () => {
      const result = validatePageContent({
        ...validContent,
        json_content: { key: 'value', nested: { data: true } },
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // Testimonial Validation
  // ==========================================================================

  describe('validateTestimonial', () => {
    const validTestimonial = {
      author_name: 'John Doe',
      rating: 5,
      text: 'Amazing experience!',
      is_active: true,
      order_index: 0,
    };

    it('should validate valid testimonial', () => {
      const result = validateTestimonial(validTestimonial);
      expect(result.success).toBe(true);
    });

    it('should require author_name', () => {
      const result = validateTestimonial({ ...validTestimonial, author_name: '' });
      expect(result.success).toBe(false);
    });

    it('should enforce author_name max length', () => {
      const result = validateTestimonial({
        ...validTestimonial,
        author_name: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('should accept ratings 1-5', () => {
      for (let rating = 1; rating <= 5; rating++) {
        const result = validateTestimonial({ ...validTestimonial, rating });
        expect(result.success).toBe(true);
      }
    });

    it('should reject ratings outside 1-5', () => {
      expect(validateTestimonial({ ...validTestimonial, rating: 0 }).success).toBe(false);
      expect(validateTestimonial({ ...validTestimonial, rating: 6 }).success).toBe(false);
      expect(validateTestimonial({ ...validTestimonial, rating: -1 }).success).toBe(false);
    });

    it('should require text', () => {
      const result = validateTestimonial({ ...validTestimonial, text: '' });
      expect(result.success).toBe(false);
    });

    it('should enforce text max length', () => {
      const result = validateTestimonial({
        ...validTestimonial,
        text: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional image_url', () => {
      const result = validateTestimonial({
        ...validTestimonial,
        image_url: '/images/avatar.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should default verified to false', () => {
      const result = validateTestimonial(validTestimonial);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verified).toBe(false);
      }
    });
  });

  // ==========================================================================
  // FAQ Item Validation
  // ==========================================================================

  describe('validateFAQItem', () => {
    const validFAQ = {
      page_slug: 'surf',
      category: 'booking',
      question: 'How do I book?',
      answer: 'You can book through our website.',
      is_active: true,
      order_index: 0,
    };

    it('should validate valid FAQ item', () => {
      const result = validateFAQItem(validFAQ);
      expect(result.success).toBe(true);
    });

    it('should accept all valid page slugs including general', () => {
      const slugs = ['flow', 'play', 'surf', 'the-spot', 'general'];
      
      slugs.forEach(slug => {
        const result = validateFAQItem({ ...validFAQ, page_slug: slug });
        expect(result.success).toBe(true);
      });
    });

    it('should require question', () => {
      const result = validateFAQItem({ ...validFAQ, question: '' });
      expect(result.success).toBe(false);
    });

    it('should enforce question max length', () => {
      const result = validateFAQItem({
        ...validFAQ,
        question: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should require answer', () => {
      const result = validateFAQItem({ ...validFAQ, answer: '' });
      expect(result.success).toBe(false);
    });

    it('should enforce answer max length', () => {
      const result = validateFAQItem({
        ...validFAQ,
        answer: 'a'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('should default category to general', () => {
      const result = validateFAQItem({
        page_slug: 'surf',
        question: 'Test?',
        answer: 'Test answer',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('general');
      }
    });
  });

  // ==========================================================================
  // Media Item Validation
  // ==========================================================================

  describe('validateMediaItem', () => {
    const validMedia = {
      filename: 'room-photo.jpg',
      original_name: 'Room Photo.jpg',
      file_type: 'image',
      file_size: 1024000,
      supabase_path: 'rooms/room-photo.jpg',
      public_url: 'https://storage.supabase.co/rooms/room-photo.jpg',
      alt_text: 'Ocean view room',
      tags: ['room', 'ocean'],
      category: 'rooms',
      is_active: true,
      order_index: 0,
    };

    it('should validate valid media item', () => {
      const result = validateMediaItem(validMedia);
      expect(result.success).toBe(true);
    });

    it('should accept all valid file types', () => {
      const types = ['image', 'video', 'document'];
      
      types.forEach(type => {
        const result = validateMediaItem({ ...validMedia, file_type: type });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid file types', () => {
      const result = validateMediaItem({ ...validMedia, file_type: 'audio' });
      expect(result.success).toBe(false);
    });

    it('should require filename', () => {
      const result = validateMediaItem({ ...validMedia, filename: '' });
      expect(result.success).toBe(false);
    });

    it('should require supabase_path', () => {
      const result = validateMediaItem({ ...validMedia, supabase_path: '' });
      expect(result.success).toBe(false);
    });

    it('should accept optional file_size', () => {
      const { file_size, ...withoutSize } = validMedia;
      const result = validateMediaItem(withoutSize);
      expect(result.success).toBe(true);
    });

    it('should default tags to empty array', () => {
      const { tags, ...withoutTags } = validMedia;
      const result = validateMediaItem(withoutTags);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });
  });

  // ==========================================================================
  // CTA Button Validation
  // ==========================================================================

  describe('validateCTAButton', () => {
    const validCTA = {
      location: 'homepage-hero',
      text: 'Book Now',
      link: '/book',
      style: 'primary',
      is_active: true,
      order_index: 0,
    };

    it('should validate valid CTA button', () => {
      const result = validateCTAButton(validCTA);
      expect(result.success).toBe(true);
    });

    it('should accept all valid styles', () => {
      const styles = ['primary', 'secondary', 'outline'];
      
      styles.forEach(style => {
        const result = validateCTAButton({ ...validCTA, style });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid styles', () => {
      const result = validateCTAButton({ ...validCTA, style: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should require location', () => {
      const result = validateCTAButton({ ...validCTA, location: '' });
      expect(result.success).toBe(false);
    });

    it('should require text', () => {
      const result = validateCTAButton({ ...validCTA, text: '' });
      expect(result.success).toBe(false);
    });

    it('should require link', () => {
      const result = validateCTAButton({ ...validCTA, link: '' });
      expect(result.success).toBe(false);
    });

    it('should default style to primary', () => {
      const result = validateCTAButton({
        location: 'test',
        text: 'Click',
        link: '/test',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.style).toBe('primary');
      }
    });
  });

  // ==========================================================================
  // Activity Log Validation
  // ==========================================================================

  describe('validateActivityLog', () => {
    const validLog = {
      table_name: 'homepage_sections',
      record_id: '123e4567-e89b-12d3-a456-426614174000',
      action: 'update',
      old_values: { title: 'Old Title' },
      new_values: { title: 'New Title' },
    };

    it('should validate valid activity log', () => {
      const result = validateActivityLog(validLog);
      expect(result.success).toBe(true);
    });

    it('should accept all valid actions', () => {
      const actions = ['create', 'update', 'delete'];
      
      actions.forEach(action => {
        const result = validateActivityLog({ ...validLog, action });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid actions', () => {
      const result = validateActivityLog({ ...validLog, action: 'read' });
      expect(result.success).toBe(false);
    });

    it('should require valid UUID for record_id', () => {
      const result = validateActivityLog({ ...validLog, record_id: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('should require table_name', () => {
      const result = validateActivityLog({ ...validLog, table_name: '' });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // Search Params Validation
  // ==========================================================================

  describe('validateSearchParams', () => {
    it('should validate empty params with defaults', () => {
      const result = validateSearchParams({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sort_order).toBe('desc');
      }
    });

    it('should accept valid search params', () => {
      const result = validateSearchParams({
        search: 'test',
        page: 2,
        limit: 50,
        sort_by: 'created_at',
        sort_order: 'asc',
      });
      expect(result.success).toBe(true);
    });

    it('should enforce page minimum', () => {
      const result = validateSearchParams({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('should enforce limit maximum', () => {
      const result = validateSearchParams({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it('should enforce search max length', () => {
      const result = validateSearchParams({ search: 'a'.repeat(201) });
      expect(result.success).toBe(false);
    });

    it('should accept valid sort orders', () => {
      expect(validateSearchParams({ sort_order: 'asc' }).success).toBe(true);
      expect(validateSearchParams({ sort_order: 'desc' }).success).toBe(true);
    });

    it('should reject invalid sort orders', () => {
      const result = validateSearchParams({ sort_order: 'random' });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // Export Options Validation
  // ==========================================================================

  describe('validateExportOptions', () => {
    it('should validate valid export options', () => {
      const result = validateExportOptions({
        format: 'json',
        include_inactive: false,
      });
      expect(result.success).toBe(true);
    });

    it('should accept all valid formats', () => {
      const formats = ['json', 'csv', 'xlsx'];
      
      formats.forEach(format => {
        const result = validateExportOptions({ format });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid formats', () => {
      const result = validateExportOptions({ format: 'pdf' });
      expect(result.success).toBe(false);
    });

    it('should accept date_range', () => {
      const result = validateExportOptions({
        format: 'json',
        date_range: {
          start: '2025-01-01T00:00:00Z',
          end: '2025-12-31T23:59:59Z',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should default include_inactive to false', () => {
      const result = validateExportOptions({ format: 'json' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.include_inactive).toBe(false);
      }
    });
  });

  // ==========================================================================
  // Type Guards
  // ==========================================================================

  describe('Type Guards', () => {
    it('isValidHomepageSection should return true for valid data', () => {
      expect(isValidHomepageSection({ section_type: 'hero' })).toBe(true);
    });

    it('isValidHomepageSection should return false for invalid data', () => {
      expect(isValidHomepageSection({ section_type: 'invalid' })).toBe(false);
    });

    it('isValidPageContent should return true for valid data', () => {
      expect(isValidPageContent({ page_slug: 'surf', section: 'hero' })).toBe(true);
    });

    it('isValidPageContent should return false for invalid data', () => {
      expect(isValidPageContent({ page_slug: 'invalid' })).toBe(false);
    });

    it('isValidTestimonial should return true for valid data', () => {
      expect(isValidTestimonial({
        author_name: 'John',
        rating: 5,
        text: 'Great!',
      })).toBe(true);
    });

    it('isValidTestimonial should return false for invalid data', () => {
      expect(isValidTestimonial({ author_name: '' })).toBe(false);
    });

    it('isValidFAQItem should return true for valid data', () => {
      expect(isValidFAQItem({
        page_slug: 'surf',
        question: 'Test?',
        answer: 'Answer',
      })).toBe(true);
    });

    it('isValidMediaItem should return true for valid data', () => {
      expect(isValidMediaItem({
        filename: 'test.jpg',
        original_name: 'test.jpg',
        file_type: 'image',
        supabase_path: 'path/test.jpg',
      })).toBe(true);
    });

    it('isValidCTAButton should return true for valid data', () => {
      expect(isValidCTAButton({
        location: 'test',
        text: 'Click',
        link: '/test',
      })).toBe(true);
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('Error Handling', () => {
    it('ValidationError should contain details', () => {
      const error = new ValidationError('Test error', [
        { code: 'invalid_type', path: ['field'], message: 'Required', expected: 'string', received: 'undefined' },
      ]);
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test error');
      expect(error.details).toHaveLength(1);
      expect(error.details[0].path).toEqual(['field']);
    });

    it('handleValidationError should throw ValidationError', () => {
      const result = validateHomepageSection({ section_type: 'invalid' });
      
      if (!result.success) {
        expect(() => handleValidationError(result)).toThrow(ValidationError);
      }
    });

    it('handleValidationError should include field paths in message', () => {
      const result = validateTestimonial({ author_name: '', rating: 0, text: '' });
      
      if (!result.success) {
        try {
          handleValidationError(result);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).message).toContain('Validation failed');
        }
      }
    });
  });

  // ==========================================================================
  // Error Codes
  // ==========================================================================

  describe('CMSErrorCodes', () => {
    it('should have all expected error codes', () => {
      expect(CMSErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(CMSErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
      expect(CMSErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(CMSErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
      expect(CMSErrorCodes.DATABASE_ERROR).toBe('DATABASE_ERROR');
      expect(CMSErrorCodes.UPLOAD_ERROR).toBe('UPLOAD_ERROR');
      expect(CMSErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });
});
