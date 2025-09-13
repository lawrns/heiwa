# Heiwa Booking Widget

This directory contains the enhanced Heiwa Booking Widget implementation with modern React components and improved user experience.

## Overview

The widget page (`/widget`) redirects to the main application where users can interact with the enhanced Heiwa Booking Widget. The new implementation features:

- Modern React-based booking flow
- Enhanced surf week selection with fixed date periods
- Real-time occupancy tracking and pricing
- Responsive design for all devices

## Features

### 🎨 Enhanced Design System
- Modern React-based components with Tailwind CSS
- Professional surf-themed design with orange/teal colors
- Responsive layout optimized for all devices
- Accessible UI components with proper ARIA support

### 📱 Enhanced Booking Widget
- **5-step booking flow**:
  1. Experience type selection (Room vs Surf Week)
  2. Enhanced surf week selection with fixed date periods OR date/guest selection for rooms
  3. Room/option selection with real-time availability
  4. Guest details collection with validation
  5. Review and secure payment processing

- **Advanced features**:
  - Real-time occupancy tracking ("5/12 booked")
  - Dynamic pricing display ("from €X")
  - Horizontal surf week cards with date ranges
  - Responsive design with mobile optimization
  - Accessibility compliance (ARIA, keyboard navigation)
  - Form validation
  - Success confirmation

### 🧪 Testing Environment
- Complete E2E test coverage with Playwright
- Accessibility testing
- Responsive design validation
- Error handling scenarios

## Getting Started

### Running the Demo

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/widget`

3. Click the "Book Now" button in the top-right corner

4. Follow the booking flow through all steps

### Running Tests

Execute the comprehensive E2E test suite:

```bash
# Run all widget tests
npm run test:e2e -- tests/widget-e2e.test.ts

# Run specific test scenarios
npm run test:e2e -- tests/widget-e2e.test.ts --grep "full booking flow"

# Run tests in headed mode (visible browser)
npm run test:e2e:headed -- tests/widget-e2e.test.ts
```

## Test Scenarios Covered

### Core Functionality
- ✅ **Complete booking flow** - Room booking from start to finish
- ✅ **Surf week booking** - Alternative booking path
- ✅ **Step navigation** - Forward/backward between steps
- ✅ **Widget closure** - Proper modal dismissal
- ✅ **Form submission** - Valid data handling

### User Experience
- ✅ **Visual feedback** - Selection highlighting and transitions
- ✅ **Responsive design** - Mobile, tablet, and desktop layouts
- ✅ **Accessibility** - Keyboard navigation and screen reader support
- ✅ **Error handling** - Network failures and edge cases

### Technical Validation
- ✅ **Asset loading** - CSS and JavaScript resource verification
- ✅ **DOM manipulation** - Dynamic content updates
- ✅ **Event handling** - User interaction responses
- ✅ **State management** - Multi-step flow state transitions

## Widget Integration

### For Production Websites

To integrate this widget on your WordPress site:

1. **Load the required assets**:
   ```html
   <link rel="stylesheet" href="/wordpress-plugin/heiwa-booking-widget/assets/css/base.css">
   <link rel="stylesheet" href="/wordpress-plugin/heiwa-booking-widget/assets/css/components.css">
   <link rel="stylesheet" href="/wordpress-plugin/heiwa-booking-widget/assets/css/layout.css">
   <link rel="stylesheet" href="/wordpress-plugin/heiwa-booking-widget/assets/css/utilities.css">
   <script src="/wordpress-plugin/heiwa-booking-widget/assets/js/widget.js"></script>
   ```

2. **Add the shortcode**:
   ```php
   [heiwa_booking]
   ```

3. **Or use the PHP function**:
   ```php
   <?php heiwa_booking_widget(); ?>
   ```

### Customization Options

The widget supports various customization parameters:

```php
[heiwa_booking
  position="right"
  trigger_text="Reserve Now"
  primary_color="#your-brand-color"
  inline="false"
  destinations="Costa Rica,Portugal"
  level="intermediate"
]
```

## Architecture

### File Structure
```
src/app/widget/
├── page.tsx              # Main demo page component
├── README.md            # This documentation
└── ../tests/
    └── widget-e2e.test.ts # Comprehensive E2E tests
```

### Technical Stack
- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks and context
- **Testing**: Playwright for E2E testing
- **Backend**: Supabase with real-time data
- **Payment**: Stripe integration

### Implementation Details
- **Component Architecture**: Modular React components with proper separation of concerns
- **State Management**: Custom hooks for booking flow state management
- **API Integration**: Real-time data fetching from Supabase and WordPress APIs
- **Accessibility**: Full ARIA support and keyboard navigation
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Development

### Adding New Features

1. Create new React components in `src/components/BookingWidget/`
2. Follow the existing patterns for hooks and state management
3. Update TypeScript interfaces in `types.ts`
4. Add comprehensive E2E tests in `tests/new-widget.test.ts`

### Modifying the Booking Flow

1. Edit step components in `src/components/BookingWidget/steps/`
2. Update the booking flow hook in `hooks/useBookingFlow.ts`
3. Ensure proper state management and validation
4. Test changes across all device sizes

### Widget Customization

The enhanced widget can be customized by modifying:
- Tailwind CSS classes and design tokens
- React component props and state management
- API endpoints and data fetching logic
- Form validation and business logic

## Performance

### Optimization Features
- **Lazy Loading**: Widget assets loaded on demand
- **Code Splitting**: Separate chunks for different functionalities
- **Image Optimization**: Responsive images with fallbacks
- **Caching**: Browser caching for static assets

### Metrics
- **Initial Load**: < 2 seconds for first paint
- **Interaction**: < 500ms for step transitions
- **Bundle Size**: Optimized CSS and JavaScript delivery

## Troubleshooting

### Common Issues

1. **Widget not appearing**: Check console for JavaScript errors
2. **Styling issues**: Verify CSS files are loading correctly
3. **Form submission fails**: Check network connectivity and API endpoints
4. **Mobile display problems**: Test viewport meta tags and responsive breakpoints

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('heiwa_widget_debug', 'true');
```

## Support

For questions about the widget demo or implementation:

1. Check the test suite for expected behavior
2. Review the CSS and JavaScript source files
3. Consult the main Heiwa Booking Widget documentation
4. Create an issue in the project repository

## License

This demo is part of the Heiwa House booking system and follows the same licensing terms as the main application.
