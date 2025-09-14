<?php
/**
 * Landing Page Widget Class
 * Handles the full landing page with hero section and booking widget
 * 
 * @package HeiwaBookingWidget
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Heiwa_Booking_Landing_Page {

    /**
     * Constructor
     */
    public function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Register shortcode for landing page
        add_shortcode('heiwa_landing_page', array($this, 'render_landing_page'));
        
        // Enqueue assets when shortcode is used
        add_action('wp_enqueue_scripts', array($this, 'maybe_enqueue_assets'));
    }

    /**
     * Render the landing page shortcode
     * 
     * @param array $atts Shortcode attributes
     * @param string $content Shortcode content
     * @return string HTML output
     */
    public function render_landing_page($atts, $content = '') {
        // Parse shortcode attributes
        $atts = shortcode_atts(array(
            'show_hero' => 'true',
            'show_destinations' => 'true',
            'show_cta' => 'true',
            'hero_title' => 'Experience the Ultimate Surf Adventure',
            'hero_subtitle' => 'Join our world-class surf camps in stunning locations around the world.',
            'primary_color' => '#f97316',
            'id' => '',
        ), $atts, 'heiwa_landing_page');

        // Get plugin settings
        $settings = get_option('heiwa_booking_settings', array());
        
        // Check if API is configured
        $api = new Heiwa_Booking_API_Connector();
        if (!$api->is_configured()) {
            if (current_user_can('manage_options')) {
                return '<div class="heiwa-booking-error">' . 
                       __('Heiwa Landing Page: Please configure API settings.', 'heiwa-booking-widget') . 
                       ' <a href="' . admin_url('options-general.php?page=heiwa-booking-widget') . '">' . 
                       __('Configure now', 'heiwa-booking-widget') . '</a>' .
                       '</div>';
            }
            return '';
        }

        // Generate unique widget ID
        $widget_id = 'heiwa-landing-page-' . (!empty($atts['id']) ? sanitize_key($atts['id']) : wp_generate_uuid4());

        // Mark that shortcode is being used (for asset enqueuing)
        global $heiwa_landing_page_used;
        $heiwa_landing_page_used = true;

        ob_start();
        ?>
        <!-- Heiwa Landing Page Widget -->
        <div id="<?php echo esc_attr($widget_id); ?>" class="heiwa-landing-page-widget" data-widget-id="<?php echo esc_attr($widget_id); ?>">
            
            <?php if (filter_var($atts['show_hero'], FILTER_VALIDATE_BOOLEAN)): ?>
            <!-- Hero Section -->
            <section class="heiwa-hero-section">
                <!-- Background Pattern -->
                <div class="heiwa-hero-background">
                    <svg class="heiwa-hero-pattern" viewBox="0 0 400 400" fill="none">
                        <defs>
                            <pattern id="wave-pattern-<?php echo esc_attr($widget_id); ?>" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M0,50 Q25,25 50,50 T100,50" stroke="currentColor" stroke-width="2" fill="none" class="heiwa-pattern-stroke"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#wave-pattern-<?php echo esc_attr($widget_id); ?>)" />
                    </svg>
                </div>

                <div class="heiwa-hero-content">
                    <div class="heiwa-hero-inner">
                        <h1 class="heiwa-hero-title">
                            <?php echo esc_html($atts['hero_title']); ?>
                        </h1>
                        <p class="heiwa-hero-subtitle">
                            <?php echo esc_html($atts['hero_subtitle']); ?>
                        </p>
                        
                        <!-- Feature Highlights -->
                        <div class="heiwa-feature-grid">
                            <div class="heiwa-feature-card">
                                <div class="heiwa-feature-icon heiwa-blue-gradient">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 class="heiwa-feature-title"><?php _e('Expert Coaching', 'heiwa-booking-widget'); ?></h3>
                                <p class="heiwa-feature-description"><?php _e('Professional surfers with decades of experience', 'heiwa-booking-widget'); ?></p>
                            </div>

                            <div class="heiwa-feature-card">
                                <div class="heiwa-feature-icon heiwa-orange-gradient">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 class="heiwa-feature-title"><?php _e('Perfect Waves', 'heiwa-booking-widget'); ?></h3>
                                <p class="heiwa-feature-description"><?php _e('World-famous breaks with consistent, quality waves', 'heiwa-booking-widget'); ?></p>
                            </div>

                            <div class="heiwa-feature-card">
                                <div class="heiwa-feature-icon heiwa-teal-gradient">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 class="heiwa-feature-title"><?php _e('Amazing Community', 'heiwa-booking-widget'); ?></h3>
                                <p class="heiwa-feature-description"><?php _e('Connect with fellow surfers from around the world', 'heiwa-booking-widget'); ?></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <?php endif; ?>

            <?php if (filter_var($atts['show_destinations'], FILTER_VALIDATE_BOOLEAN)): ?>
            <!-- Destinations Preview -->
            <section class="heiwa-destinations-section">
                <div class="heiwa-destinations-inner">
                    <div class="heiwa-destinations-header">
                        <h2 class="heiwa-destinations-title"><?php _e('Our Surf Destinations', 'heiwa-booking-widget'); ?></h2>
                        <p class="heiwa-destinations-subtitle">
                            <?php _e('Discover amazing surf spots around the world', 'heiwa-booking-widget'); ?>
                        </p>
                    </div>

                    <div class="heiwa-destinations-grid">
                        <?php
                        $destinations = array(
                            array(
                                'name' => 'Costa Rica',
                                'location' => 'Nosara Beach Camp',
                                'description' => 'Perfect waves for all levels with stunning beachfront accommodation',
                                'price' => 899,
                                'gradient' => 'blue',
                            ),
                            array(
                                'name' => 'Morocco',
                                'location' => 'Taghazout Surf Camp',
                                'description' => 'North African adventure with consistent Atlantic waves',
                                'price' => 799,
                                'gradient' => 'orange',
                            ),
                            array(
                                'name' => 'Portugal',
                                'location' => 'Ericeira Surf Week',
                                'description' => 'European surf paradise with world-class coaching',
                                'price' => 899,
                                'gradient' => 'teal',
                            ),
                        );

                        foreach ($destinations as $index => $destination):
                        ?>
                        <div class="heiwa-destination-card heiwa-<?php echo esc_attr($destination['gradient']); ?>-gradient" data-destination="<?php echo esc_attr($destination['name']); ?>">
                            <div class="heiwa-destination-image">
                                <span class="heiwa-destination-name"><?php echo esc_html($destination['name']); ?></span>
                            </div>
                            <div class="heiwa-destination-content">
                                <h3 class="heiwa-destination-location"><?php echo esc_html($destination['location']); ?></h3>
                                <p class="heiwa-destination-description"><?php echo esc_html($destination['description']); ?></p>
                                <div class="heiwa-destination-footer">
                                    <span class="heiwa-destination-price">€<?php echo esc_html($destination['price']); ?></span>
                                    <span class="heiwa-destination-duration">7 days</span>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>
            <?php endif; ?>

            <?php if (filter_var($atts['show_cta'], FILTER_VALIDATE_BOOLEAN)): ?>
            <!-- Call to Action -->
            <section class="heiwa-cta-section">
                <div class="heiwa-cta-inner">
                    <h2 class="heiwa-cta-title"><?php _e('Ready for Your Surf Adventure?', 'heiwa-booking-widget'); ?></h2>
                    <p class="heiwa-cta-subtitle"><?php _e('Book your perfect surf experience today', 'heiwa-booking-widget'); ?></p>
                    <div class="heiwa-cta-text">
                        <?php _e('Click the "Book Now" button to get started!', 'heiwa-booking-widget'); ?>
                    </div>
                </div>
            </section>
            <?php endif; ?>

            <!-- Fixed Book Now Button -->
            <button class="heiwa-booking-trigger heiwa-landing-trigger" 
                    data-widget-target="<?php echo esc_attr($widget_id); ?>"
                    style="--heiwa-primary-color: <?php echo esc_attr($atts['primary_color']); ?>;">
                <svg class="heiwa-trigger-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span class="heiwa-trigger-text">
                    <?php _e('Book Now', 'heiwa-booking-widget'); ?>
                    <span class="heiwa-trigger-pulse"></span>
                </span>
            </button>
        </div>

        <style>
            #<?php echo esc_attr($widget_id); ?> {
                --heiwa-primary-color: <?php echo esc_attr($atts['primary_color']); ?>;
                --heiwa-primary-hover: <?php echo esc_attr($this->adjust_brightness($atts['primary_color'], -20)); ?>;
            }
        </style>

        <script>
            // Initialize this specific landing page instance
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof window.HeiwaBookingWidget !== 'undefined') {
                    window.HeiwaBookingWidget.init('<?php echo esc_js($widget_id); ?>');
                }
            });
        </script>
        <?php
        
        return ob_get_clean();
    }

    /**
     * Maybe enqueue assets when shortcode is used
     */
    public function maybe_enqueue_assets() {
        global $post, $heiwa_landing_page_used;
        
        // Check if shortcode is used in post content
        $has_shortcode = false;
        
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'heiwa_landing_page')) {
            $has_shortcode = true;
        }
        
        // Also check if shortcode was used programmatically
        if (!empty($heiwa_landing_page_used)) {
            $has_shortcode = true;
        }

        if ($has_shortcode) {
            // Enqueue landing page specific assets
            $this->enqueue_assets();
        }
    }

    /**
     * Enqueue landing page assets
     */
    private function enqueue_assets() {
        // Enqueue base widget CSS
        wp_enqueue_style(
            'heiwa-booking-base',
            HEIWA_BOOKING_PLUGIN_URL . 'assets/css/base.css',
            array(),
            HEIWA_BOOKING_VERSION
        );

        wp_enqueue_style(
            'heiwa-booking-components',
            HEIWA_BOOKING_PLUGIN_URL . 'assets/css/components.css',
            array('heiwa-booking-base'),
            HEIWA_BOOKING_VERSION
        );

        wp_enqueue_style(
            'heiwa-booking-layout',
            HEIWA_BOOKING_PLUGIN_URL . 'assets/css/layout.css',
            array('heiwa-booking-base', 'heiwa-booking-components'),
            HEIWA_BOOKING_VERSION
        );

        // Enqueue landing page specific CSS
        wp_enqueue_style(
            'heiwa-landing-page',
            HEIWA_BOOKING_PLUGIN_URL . 'assets/css/landing-page.css',
            array('heiwa-booking-base', 'heiwa-booking-components', 'heiwa-booking-layout'),
            HEIWA_BOOKING_VERSION
        );

        wp_enqueue_style(
            'heiwa-booking-utilities',
            HEIWA_BOOKING_PLUGIN_URL . 'assets/css/utilities.css',
            array('heiwa-booking-base', 'heiwa-booking-components', 'heiwa-booking-layout', 'heiwa-landing-page'),
            HEIWA_BOOKING_VERSION
        );

        // Enqueue JavaScript
        wp_enqueue_script(
            'heiwa-booking-widget',
            HEIWA_BOOKING_PLUGIN_URL . 'assets/js/widget.js',
            array('jquery'),
            HEIWA_BOOKING_VERSION,
            true
        );

        // Localize script with AJAX URL and nonce
        wp_localize_script('heiwa-booking-widget', 'heiwa_booking_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('heiwa_booking_nonce'),
            'api_endpoint' => $settings['api_endpoint'] ?? '',
            'build_id' => HEIWA_WIDGET_BUILD_ID
        ));
    }

    /**
     * Adjust color brightness
     * 
     * @param string $hex Hex color code
     * @param int $percent Percentage to adjust (-100 to 100)
     * @return string Adjusted hex color
     */
    private function adjust_brightness($hex, $percent) {
        // Remove # if present
        $hex = ltrim($hex, '#');
        
        // Convert to RGB
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        
        // Adjust brightness
        $r = max(0, min(255, $r + ($r * $percent / 100)));
        $g = max(0, min(255, $g + ($g * $percent / 100)));
        $b = max(0, min(255, $b + ($b * $percent / 100)));
        
        // Convert back to hex
        return '#' . sprintf('%02x%02x%02x', $r, $g, $b);
    }
}

