# Heiwa Booking Widget Demo

This directory contains a comprehensive demo page for the Heiwa Booking Widget, showcasing its full functionality and providing a testing environment.

## Overview

The widget demo page (`/widget`) simulates a real-world surf camp website where users can interact with the Heiwa Booking Widget. It includes:

- A professional landing page design
- A prominent "Book Now" button in the top navigation
- Complete booking widget integration
- Responsive design for all devices

## Features Demonstrated

### 🎨 Design System
- Modern, mobile-first responsive design
- Professional surf camp branding
- Clean typography and spacing
- Interactive UI components

### 📱 Booking Widget
- **Step-by-step booking flow**:
  1. Booking type selection (Room vs Surf Week)
  2. Date and participant selection
  3. Personal details collection
  4. Booking confirmation

- **Interactive features**:
  - Visual feedback on selection
  - Smooth transitions between steps
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
- **Styling**: Tailwind CSS + Custom CSS Modules
- **Testing**: Playwright for E2E testing
- **JavaScript**: ES6+ with TypeScript support
- **Widget**: jQuery-based interactive components

### Widget Implementation
- **Modal System**: Fixed positioning with backdrop overlay
- **State Management**: Client-side JavaScript state tracking
- **Form Handling**: Progressive enhancement with validation
- **Accessibility**: ARIA attributes and keyboard navigation
- **Responsive**: Mobile-first design with breakpoint adaptations

## Development

### Adding New Test Scenarios

1. Create new test functions in `tests/widget-e2e.test.ts`
2. Follow the existing patterns for setup and assertions
3. Use descriptive test names that explain the scenario
4. Include proper error handling and timeouts

### Modifying the Demo Page

1. Edit `page.tsx` to update the demo content
2. Maintain the existing structure for widget integration
3. Update tests accordingly if functionality changes
4. Ensure responsive design remains intact

### Widget Customization

The demo widget can be customized by modifying:
- CSS variables in the loaded stylesheets
- JavaScript behavior in the initialization script
- HTML structure in the widget template
- Form fields and validation logic

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
