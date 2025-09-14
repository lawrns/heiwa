# Heiwa Booking Widget - WordPress Plugin

A comprehensive WordPress booking widget that integrates with the Heiwa House booking system. Displays both a landing page and collapsible booking interface for surf camps and accommodations.

## 🚀 **NEW: Landing Page Widget**

Version 3.0.0 introduces a complete landing page widget that matches the React widget design exactly!

### **Shortcodes Available**

#### **1. `[heiwa_landing_page]` - Full Landing Page**
Creates a complete landing page with hero section, destinations, and booking widget.

```php
// Basic usage
[heiwa_landing_page]

// With custom options
[heiwa_landing_page 
    show_hero="true" 
    show_destinations="true" 
    show_cta="true"
    hero_title="Experience the Ultimate Surf Adventure"
    primary_color="#f97316"
]
```

**Shortcode Attributes:**
- `show_hero` (true/false) - Display hero section
- `show_destinations` (true/false) - Display destination previews  
- `show_cta` (true/false) - Display call-to-action section
- `hero_title` (string) - Custom hero title
- `hero_subtitle` (string) - Custom hero subtitle
- `primary_color` (hex) - Brand color override
- `id` (string) - Custom widget ID for multiple instances

#### **2. `[heiwa_booking]` - Booking Widget Only**
Creates just the booking widget (existing functionality).

```php
// Basic usage
[heiwa_booking]

// With options
[heiwa_booking inline="true" primary_color="#2563eb"]
```

## 🎨 **Visual Design**

The landing page widget provides **pixel-perfect visual parity** with the React widget:

- ✅ **Hero section** with gradient background and wave patterns
- ✅ **Feature highlights** with gradient icon containers
- ✅ **Destination cards** with hover animations
- ✅ **Call-to-action section** with gradient background
- ✅ **Fixed "Book Now" button** with animations and pulse effect
- ✅ **Beautiful booking modal** with React-style experience selection

## 📦 **Installation & Setup**

### **1. Install the Plugin**

1. Upload the `heiwa-booking-widget` folder to `/wp-content/plugins/`
2. Activate the plugin through the WordPress admin
3. Go to **Settings > Heiwa Booking Widget**
4. Configure your API settings

### **2. Configure API Settings**

**Required Settings:**
- **API Endpoint**: Your Heiwa House API endpoint
- **API Key**: Your authentication key

**Optional Settings:**
- **Widget Position**: Choose between 'left', 'right', or 'center'
- **Primary Color**: Brand color (defaults to Heiwa orange #f97316)
- **Trigger Text**: Custom text for the booking button

### **3. Use the Shortcodes**

**Full Landing Page:**
```php
// Add to any page or post
[heiwa_landing_page]
```

**Booking Widget Only:**
```php
// Add to any page or post
[heiwa_booking]
```

## 🎯 **Use Cases**

### **Landing Page Widget `[heiwa_landing_page]`**
Perfect for:
- **Homepage** - Complete surf camp landing experience
- **Dedicated booking pages** - Full-featured booking flow
- **Marketing pages** - Showcase destinations and features
- **Campaign pages** - Custom hero titles and branding

### **Booking Widget `[heiwa_booking]`**
Perfect for:
- **Blog posts** - Add booking functionality to content
- **Product pages** - Quick booking access
- **Sidebar widgets** - Compact booking option
- **Footer areas** - Site-wide booking availability

## 🔧 **Architecture**

### **CSS Structure (5-Layer System)**
1. **`base.css`** - Foundation layer with design tokens and typography
2. **`components.css`** - Component layer with buttons, cards, forms
3. **`layout.css`** - Layout layer with modal positioning and responsive design
4. **`landing-page.css`** - Landing page specific styles (NEW)
5. **`utilities.css`** - Utilities layer with overrides and animations

### **Loading Order**
```
base.css → components.css → layout.css → landing-page.css → utilities.css
```

### **Build System**
Generate combined CSS for production:

```bash
# From the wordpress-plugin/heiwa-booking-widget directory
./build-css.sh
```

This creates `widget.css` with all layers combined.

## 🎨 **Customization**

### **CSS Customization**
Override styles by targeting these classes:

**Landing Page:**
- `.heiwa-landing-page-widget` - Main container
- `.heiwa-hero-section` - Hero section
- `.heiwa-destinations-section` - Destinations preview
- `.heiwa-cta-section` - Call-to-action section
- `.heiwa-landing-trigger` - Fixed Book Now button

**Booking Widget:**
- `.heiwa-booking-widget` - Main widget container
- `.heiwa-booking-panel` - Modal panel
- `.heiwa-experience-card` - Experience selection cards
- `.heiwa-booking-form` - Booking form elements

### **Color Customization**
Use CSS custom properties:

```css
:root {
  --heiwa-primary-color: #your-brand-color;
  --heiwa-primary-hover: #your-hover-color;
}
```

### **JavaScript Events**
The widget triggers these custom events:
- `heiwa_widget_opened` - When modal opens
- `heiwa_widget_closed` - When modal closes
- `heiwa_booking_submitted` - When booking form is submitted
- `heiwa_destination_selected` - When destination card is clicked

## 🔗 **WordPress Integration**

### **Theme Integration**
Works with all major WordPress themes:
- Twenty Twenty-Three
- Astra
- GeneratePress
- Divi
- Elementor

### **Page Builder Support**
Compatible with:
- Gutenberg (Block Editor)
- Elementor
- Beaver Builder
- Visual Composer

### **Plugin Compatibility**
Tested with:
- Contact Form 7
- WooCommerce
- Yoast SEO
- WP Rocket
- Autoptimize

## 🚀 **Performance**

### **Optimization Features**
- **Modular CSS loading** for better caching
- **Conditional asset loading** (only loads when shortcode is used)
- **Optimized JavaScript** with minimal DOM manipulation
- **Responsive images** and lazy loading
- **CDN compatible** assets

### **Build Optimization**
```bash
# Create optimized single CSS file
./build-css.sh

# Optional: Minify for production
npm install -g csso
csso assets/css/widget.css --output assets/css/widget.min.css
```

## 🛠 **Development**

### **File Structure**
```
wordpress-plugin/heiwa-booking-widget/
├── assets/
│   ├── css/
│   │   ├── base.css              # Foundation styles
│   │   ├── components.css        # UI components
│   │   ├── layout.css            # Layout & positioning
│   │   ├── landing-page.css      # Landing page styles (NEW)
│   │   ├── utilities.css         # Overrides & animations
│   │   ├── widget.css            # Production build (generated)
│   │   └── admin.css             # Admin interface styles
│   ├── images/                   # Background images
│   └── js/
│       ├── widget.js             # Frontend functionality
│       └── admin.js              # Admin interface JS
├── includes/
│   ├── class-api-connector.php
│   ├── class-shortcode.php       # [heiwa_booking] shortcode
│   ├── class-landing-page.php    # [heiwa_landing_page] shortcode (NEW)
│   └── class-widget.php
├── admin/
│   └── class-settings.php
├── heiwa-booking-widget.php      # Main plugin file
├── build-css.sh                  # Build script (updated)
└── README.md                     # This file
```

### **Adding Custom Destinations**
Modify the destinations array in `class-landing-page.php`:

```php
$destinations = array(
    array(
        'name' => 'Your Location',
        'location' => 'Your Surf Camp',
        'description' => 'Your description',
        'price' => 999,
        'gradient' => 'blue', // blue, orange, or teal
    ),
);
```

## 📋 **Deployment Checklist**

### **WordPress Installation**
1. ✅ Upload plugin to `/wp-content/plugins/`
2. ✅ Activate plugin in WordPress admin
3. ✅ Configure API settings (Settings > Heiwa Booking Widget)
4. ✅ Test shortcode: `[heiwa_landing_page]`
5. ✅ Verify booking functionality

### **Production Optimization**
1. ✅ Run `./build-css.sh` to generate combined CSS
2. ✅ Minify CSS and JS if needed
3. ✅ Test on staging environment
4. ✅ Configure CDN for assets
5. ✅ Set up monitoring and analytics

## 🔍 **Troubleshooting**

### **Common Issues**

**Landing page not displaying:**
- Check if shortcode is correct: `[heiwa_landing_page]`
- Verify API settings are configured
- Check browser console for JavaScript errors

**Styling issues:**
- Clear cache (WP Rocket, Autoptimize, etc.)
- Check for theme CSS conflicts
- Verify all CSS files are loading

**Booking widget not opening:**
- Ensure jQuery is loaded
- Check for JavaScript conflicts
- Verify API endpoint is accessible

### **Debug Mode**
Enable WordPress debug mode:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## 📈 **Version History**

### **v3.0.0 (Current)**
- ✅ Added `[heiwa_landing_page]` shortcode
- ✅ Complete visual parity with React widget
- ✅ Landing page with hero, destinations, and CTA
- ✅ Updated modular CSS architecture
- ✅ Enhanced build system

### **v2.0.0**
- ✅ Migrated to modular CSS architecture
- ✅ Improved performance and maintainability
- ✅ Enhanced theme compatibility

### **v1.0.8**
- ✅ Initial release with basic booking functionality

## 🎯 **What's New in 3.0.0**

The landing page widget provides **everything from the React widget** but as a WordPress plugin:

- 🎨 **Beautiful hero section** with gradient backgrounds
- 🏄 **Surf destination previews** with hover animations
- 🎯 **Call-to-action section** with gradient styling
- 📱 **Responsive design** across all devices
- ⚡ **Fast loading** with optimized assets
- 🔧 **Easy customization** with shortcode attributes
- 🎪 **WordPress integration** with proper hooks and filters

## 📞 **Support**

For support and documentation:
- Use the shortcode: `[heiwa_landing_page]` for full landing page
- Use the shortcode: `[heiwa_booking]` for widget only
- Check the build script for CSS optimization
- Test with WordPress debug mode enabled

## 📄 **License**

GPL v2 or later

---

**Ready to create beautiful surf camp landing pages in WordPress!** 🏄‍♂️🌊