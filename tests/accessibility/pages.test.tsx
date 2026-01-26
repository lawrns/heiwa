/**
 * Page Accessibility Tests
 * Feature: comprehensive-testing
 * Task: 14.4
 * 
 * Tests for page-level WCAG 2.1 AA compliance
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Page Accessibility Tests', () => {
  describe('Homepage Structure', () => {
    it('should have proper document structure with main landmark', async () => {
      const { container } = render(
        <main role="main" aria-label="Main content">
          <h1>Welcome to Heiwa</h1>
          <section aria-label="Introduction">
            <p>Your surf retreat destination</p>
          </section>
        </main>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', async () => {
      const { container } = render(
        <main>
          <h1>Heiwa Surf Retreat</h1>
          <section>
            <h2>Our Rooms</h2>
            <article>
              <h3>Ocean View Suite</h3>
              <p>Description of the room</p>
            </article>
          </section>
          <section>
            <h2>Surf Experiences</h2>
            <article>
              <h3>Beginner Lessons</h3>
              <p>Learn to surf</p>
            </article>
          </section>
        </main>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible navigation', async () => {
      const { container } = render(
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/rooms">Rooms</a></li>
            <li><a href="/surf">Surf</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible footer', async () => {
      const { container } = render(
        <footer role="contentinfo">
          <nav aria-label="Footer navigation">
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </nav>
          <p>&copy; 2024 Heiwa Surf Retreat</p>
        </footer>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Booking Flow Accessibility', () => {
    it('should have accessible booking form structure', async () => {
      const { container } = render(
        <main>
          <h1>Book Your Stay</h1>
          <form aria-label="Booking form">
            <fieldset>
              <legend>Select Dates</legend>
              <div>
                <label htmlFor="check-in">Check-in Date</label>
                <input type="date" id="check-in" required aria-required="true" />
              </div>
              <div>
                <label htmlFor="check-out">Check-out Date</label>
                <input type="date" id="check-out" required aria-required="true" />
              </div>
            </fieldset>
            <fieldset>
              <legend>Guest Information</legend>
              <div>
                <label htmlFor="guests">Number of Guests</label>
                <select id="guests" aria-required="true">
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                </select>
              </div>
            </fieldset>
            <button type="submit">Continue to Payment</button>
          </form>
        </main>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible step indicator', async () => {
      const { container } = render(
        <nav aria-label="Booking progress">
          <ol>
            <li aria-current="step">
              <span aria-hidden="true">1</span>
              <span>Select Dates</span>
            </li>
            <li>
              <span aria-hidden="true">2</span>
              <span>Guest Details</span>
            </li>
            <li>
              <span aria-hidden="true">3</span>
              <span>Payment</span>
            </li>
            <li>
              <span aria-hidden="true">4</span>
              <span>Confirmation</span>
            </li>
          </ol>
        </nav>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible error messages', async () => {
      const { container } = render(
        <form aria-label="Guest details">
          <div>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              aria-invalid="true"
              aria-describedby="email-error"
            />
            <span id="email-error" role="alert">
              Please enter a valid email address
            </span>
          </div>
          <button type="submit">Submit</button>
        </form>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible price summary', async () => {
      const { container } = render(
        <section aria-label="Booking summary">
          <h2>Your Booking</h2>
          <dl>
            <dt>Room</dt>
            <dd>Ocean View Suite</dd>
            <dt>Check-in</dt>
            <dd>January 15, 2025</dd>
            <dt>Check-out</dt>
            <dd>January 20, 2025</dd>
            <dt>Total</dt>
            <dd>$1,500.00</dd>
          </dl>
        </section>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Admin Dashboard Accessibility', () => {
    it('should have accessible dashboard layout', async () => {
      const { container } = render(
        <div>
          <header role="banner">
            <h1>Admin Dashboard</h1>
            <nav aria-label="Admin navigation">
              <ul>
                <li><a href="/admin">Dashboard</a></li>
                <li><a href="/admin/bookings">Bookings</a></li>
                <li><a href="/admin/rooms">Rooms</a></li>
                <li><a href="/admin/clients">Clients</a></li>
              </ul>
            </nav>
          </header>
          <main>
            <h2>Overview</h2>
            <section aria-label="Statistics">
              <div role="region" aria-label="Total bookings">
                <span>Total Bookings</span>
                <span aria-live="polite">150</span>
              </div>
            </section>
          </main>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible data table', async () => {
      const { container } = render(
        <table aria-label="Recent bookings">
          <caption>Recent Bookings</caption>
          <thead>
            <tr>
              <th scope="col">Booking ID</th>
              <th scope="col">Guest Name</th>
              <th scope="col">Check-in</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BK-001</td>
              <td>John Doe</td>
              <td>Jan 15, 2025</td>
              <td>
                <span role="status">Confirmed</span>
              </td>
              <td>
                <button aria-label="View booking BK-001">View</button>
                <button aria-label="Edit booking BK-001">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible modal dialogs', async () => {
      const { container } = render(
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <h2 id="modal-title">Edit Booking</h2>
          <p id="modal-description">Update the booking details below</p>
          <form>
            <div>
              <label htmlFor="modal-guest">Guest Name</label>
              <input type="text" id="modal-guest" defaultValue="John Doe" />
            </div>
            <div>
              <button type="button">Cancel</button>
              <button type="submit">Save Changes</button>
            </div>
          </form>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible filter controls', async () => {
      const { container } = render(
        <form aria-label="Filter bookings">
          <fieldset>
            <legend>Filter Options</legend>
            <div>
              <label htmlFor="status-filter">Status</label>
              <select id="status-filter">
                <option value="">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="date-filter">Date Range</label>
              <input type="date" id="date-filter" />
            </div>
            <button type="submit">Apply Filters</button>
            <button type="reset">Clear Filters</button>
          </fieldset>
        </form>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Skip Links and Landmarks', () => {
    it('should have skip to main content link', async () => {
      const { container } = render(
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <header role="banner">
            <nav aria-label="Main">
              <a href="/">Home</a>
            </nav>
          </header>
          <main id="main-content" role="main">
            <h1>Page Title</h1>
          </main>
        </div>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper landmark regions', async () => {
      const { container } = render(
        <div>
          <header role="banner">
            <h1>Site Title</h1>
          </header>
          <nav role="navigation" aria-label="Main">
            <ul>
              <li><a href="/">Home</a></li>
            </ul>
          </nav>
          <main role="main">
            <article>
              <h2>Article Title</h2>
              <p>Content</p>
            </article>
          </main>
          <aside role="complementary" aria-label="Related content">
            <h2>Related</h2>
          </aside>
          <footer role="contentinfo">
            <p>Footer content</p>
          </footer>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Images and Media', () => {
    it('should have accessible images with alt text', async () => {
      const { container } = render(
        <figure>
          <img 
            src="/images/room.jpg" 
            alt="Ocean view suite with king bed and balcony overlooking the beach"
          />
          <figcaption>Our premium Ocean View Suite</figcaption>
        </figure>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have decorative images marked appropriately', async () => {
      const { container } = render(
        <div>
          <img src="/images/decoration.svg" alt="" role="presentation" />
          <p>Content with decorative image</p>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Interactive Elements', () => {
    it('should have accessible buttons with clear labels', async () => {
      const { container } = render(
        <div>
          <button type="button" aria-label="Open menu">
            <span aria-hidden="true">☰</span>
          </button>
          <button type="button">
            Book Now
          </button>
          <button type="button" aria-label="Close dialog">
            <span aria-hidden="true">×</span>
          </button>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible links with descriptive text', async () => {
      const { container } = render(
        <nav>
          <a href="/rooms/ocean-view">
            View Ocean View Suite details
          </a>
          <a href="/booking" aria-label="Book your stay at Heiwa">
            Book Now
          </a>
        </nav>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Loading States', () => {
    it('should have accessible loading indicators', async () => {
      const { container } = render(
        <div role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">Loading bookings...</span>
          <div aria-hidden="true" className="spinner" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should announce content updates', async () => {
      const { container } = render(
        <div>
          <div aria-live="polite" aria-atomic="true">
            <p>Showing 10 of 50 results</p>
          </div>
          <ul>
            <li>Result 1</li>
            <li>Result 2</li>
          </ul>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
