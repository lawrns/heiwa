/**
 * MediaLibraryModal Component Tests
 * Feature: image-upload-authentication
 *
 * Tests for the MediaLibraryModal component, focusing on the critical
 * credentials: 'include' fix for authenticated image uploads.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaLibraryModal } from '@/components/admin/inline-editor/MediaLibraryModal';

// Mock fetch globally
global.fetch = jest.fn();

describe('MediaLibraryModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();

  const mockMediaData = [
    {
      id: '1',
      filename: 'image1.jpg',
      original_name: 'Test Image 1',
      file_type: 'image/jpeg',
      public_url: 'https://example.com/image1.jpg',
      alt_text: 'Test image 1',
      category: 'general',
    },
    {
      id: '2',
      filename: 'image2.png',
      original_name: 'Test Image 2',
      file_type: 'image/png',
      public_url: 'https://example.com/image2.png',
      alt_text: 'Test image 2',
      category: 'gallery',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <MediaLibraryModal
          isOpen={false}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText('Select Image')).not.toBeInTheDocument();
    });

    it('should render modal elements when isOpen is true', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockMediaData }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      // Check for modal elements
      expect(screen.getByPlaceholderText('Search images...')).toBeInTheDocument();
      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should load and display media items', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockMediaData }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByAltText('Test image 1')).toBeInTheDocument();
        expect(screen.getByAltText('Test image 2')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(() => {}) // Never resolves
      );

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('should show empty state when no images', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No images uploaded yet')).toBeInTheDocument();
      });
    });
  });

  describe('Image Upload - Critical Credentials Fix', () => {
    it('should include credentials in upload fetch request', async () => {
      const user = userEvent.setup();

      // Mock media load
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No images uploaded yet')).toBeInTheDocument();
      });

      // Mock upload response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: '3',
            filename: 'new-image.jpg',
            original_name: 'New Image',
            file_type: 'image/jpeg',
            public_url: 'https://example.com/new-image.jpg',
          },
        }),
      });

      // Mock reload after upload
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const uploadCall = (global.fetch as jest.Mock).mock.calls.find(
          (call: [string, { method?: string }]) => call[0] === '/api/cms/media' && call[1]?.method === 'POST'
        );

        expect(uploadCall).toBeDefined();
        expect(uploadCall[1]).toHaveProperty('credentials', 'include');
      });
    });

    it('should successfully upload an image with correct form data', async () => {
      const user = userEvent.setup();

      // Mock initial media load
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Upload')).toBeInTheDocument();
      });

      const uploadedImageUrl = 'https://example.com/uploaded-image.jpg';

      // Mock upload response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'new-1',
            filename: 'uploaded-image.jpg',
            original_name: 'Uploaded Image',
            file_type: 'image/jpeg',
            public_url: uploadedImageUrl,
            alt_text: '',
            category: 'general',
          },
        }),
      });

      // Mock reload after upload
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            id: 'new-1',
            filename: 'uploaded-image.jpg',
            original_name: 'Uploaded Image',
            file_type: 'image/jpeg',
            public_url: uploadedImageUrl,
            alt_text: '',
            category: 'general',
          }],
        }),
      });

      const file = new File(['test content'], 'uploaded-image.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/cms/media',
          expect.objectContaining({
            method: 'POST',
            credentials: 'include',
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle upload failure gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock initial media load
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Upload')).toBeInTheDocument();
      });

      // Mock upload failure
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Upload failed' }),
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const uploadButton = screen.getByText('Upload').closest('button');
        expect(uploadButton).not.toBeDisabled();
      });

      consoleSpy.mockRestore();
    });

    it('should handle network error during upload', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock initial media load
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Upload')).toBeInTheDocument();
      });

      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Upload failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should handle 401 authentication error with credentials included', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock initial media load
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Upload')).toBeInTheDocument();
      });

      // Mock 401 authentication error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const uploadButton = screen.getByText('Upload').closest('button');
        expect(uploadButton).not.toBeDisabled();
      });

      // Verify credentials were included in the request
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/cms/media',
        expect.objectContaining({
          credentials: 'include',
        })
      );

      consoleSpy.mockRestore();
    });

    it('should handle media load failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to load media'));

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load media:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Search Functionality', () => {
    it('should filter images by search query', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockMediaData }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByAltText('Test image 1')).toBeInTheDocument();
        expect(screen.getByAltText('Test image 2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search images...');
      await user.type(searchInput, 'Test Image 1');

      await waitFor(() => {
        expect(screen.getByAltText('Test image 1')).toBeInTheDocument();
        expect(screen.queryByAltText('Test image 2')).not.toBeInTheDocument();
      });
    });

    it('should show "no match" message when search has no results', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockMediaData }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByAltText('Test image 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search images...');
      await user.type(searchInput, 'NonexistentImage');

      await waitFor(() => {
        expect(screen.getByText('No images match your search')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Controls', () => {
    it('should call onClose when close button clicked', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      // The close button has an X icon, find it by looking for all buttons and picking the one with the X svg
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(btn => btn.querySelector('svg.lucide-x'));

      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when cancel button clicked', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop clicked', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const { container } = render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      const backdrop = container.querySelector('.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Upload Button Interaction', () => {
    it('should trigger file input when upload button clicked', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      const uploadButton = screen.getByText('Upload');
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const clickSpy = jest.spyOn(fileInput, 'click');

      await user.click(uploadButton);

      expect(clickSpy).toHaveBeenCalled();

      clickSpy.mockRestore();
    });

    it('should accept only image files', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });
  });

  describe('API Integration', () => {
    it('should make correct API call to load media', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/cms/media?')
        );
      });

      const loadCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = new URL(loadCall[0], 'http://localhost');

      expect(url.searchParams.get('file_type')).toBe('image');
      expect(url.searchParams.get('sort_by')).toBe('created_at');
      expect(url.searchParams.get('sort_order')).toBe('desc');
      expect(url.searchParams.get('limit')).toBe('100');
    });

    it('should reload media after successful upload', async () => {
      const user = userEvent.setup();

      // Mock initial load
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <MediaLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Mock upload
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { public_url: 'https://example.com/new.jpg' },
        }),
      });

      // Mock reload
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });
    });
  });
});
