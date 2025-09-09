<?php
/**
 * Shortcode Handler Class
 * Handles the [heiwa_booking] shortcode functionality
 * 
 * @package HeiwaBookingWidget
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Heiwa_Booking_Widget_Shortcode {

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
        // Register shortcode
        add_shortcode('heiwa_booking', array($this, 'render_shortcode'));
        
        // Add shortcode button to editor (optional)
        add_action('media_buttons', array($this, 'add_shortcode_button'));
        
        // Enqueue assets when shortcode is used
        add_action('wp_enqueue_scripts', array($this, 'maybe_enqueue_assets'));
    }

    /**
     * Render the shortcode
     * 
     * @param array $atts Shortcode attributes
     * @param string $content Shortcode content
     * @return string HTML output
     */
    public function render_shortcode($atts, $content = '') {
        // Parse shortcode attributes
        $atts = shortcode_atts(array(
            'position' => '', // Override widget position
            'trigger_text' => '', // Override trigger button text
            'primary_color' => '', // Override primary color
            'destinations' => '', // Comma-separated list of destination filters
            'level' => '', // Skill level filter
            'inline' => 'false', // Display inline instead of fixed position
            'id' => '', // Custom ID for multiple widgets
        ), $atts, 'heiwa_booking');

        // Get plugin settings
        $settings = get_option('heiwa_booking_settings', array());
        
        // Check if API is configured
        $api = new Heiwa_Booking_API_Connector();
        if (!$api->is_configured()) {
            if (current_user_can('manage_options')) {
                return '<div class="heiwa-booking-error">' . 
                       __('Heiwa Booking Widget: Please configure API settings.', 'heiwa-booking-widget') . 
                       ' <a href="' . admin_url('options-general.php?page=heiwa-booking-widget') . '">' . 
                       __('Configure now', 'heiwa-booking-widget') . '</a>' .
                       '</div>';
            }
            return ''; // Don't show anything to regular users
        }

        // Merge shortcode attributes with settings
        $widget_settings = array(
            'position' => !empty($atts['position']) ? $atts['position'] : ($settings['widget_position'] ?? 'right'),
            'trigger_text' => !empty($atts['trigger_text']) ? $atts['trigger_text'] : ($settings['trigger_text'] ?? 'BOOK NOW'),
            'primary_color' => !empty($atts['primary_color']) ? $atts['primary_color'] : ($settings['primary_color'] ?? '#2563eb'),
            'inline' => filter_var($atts['inline'], FILTER_VALIDATE_BOOLEAN),
            'destinations' => !empty($atts['destinations']) ? explode(',', $atts['destinations']) : array(),
            'level' => !empty($atts['level']) ? $atts['level'] : '',
            'id' => !empty($atts['id']) ? sanitize_key($atts['id']) : 'shortcode-' . wp_generate_uuid4(),
        );

        // Mark that shortcode is being used (for asset enqueuing)
        global $heiwa_booking_shortcode_used;
        $heiwa_booking_shortcode_used = true;

        // Generate unique widget ID
        $widget_id = 'heiwa-booking-widget-' . $widget_settings['id'];

        ob_start();
        ?>
        <!-- Heiwa Booking Widget (Shortcode) -->
        <div id="<?php echo esc_attr($widget_id); ?>" class="heiwa-booking-widget heiwa-shortcode-widget <?php echo $widget_settings['inline'] ? 'heiwa-inline' : 'heiwa-position-' . esc_attr($widget_settings['position']); ?>" data-widget-id="<?php echo esc_attr($widget_settings['id']); ?>">
            
            <?php if ($widget_settings['inline']): ?>
                <!-- Inline Widget -->
                <div class="heiwa-booking-inline-container">
                    <div class="heiwa-booking-inline-header">
                        <h3><?php _e('Book Your Surf Adventure', 'heiwa-booking-widget'); ?></h3>
                    </div>
                    <div class="heiwa-booking-inline-content">
                        <?php $this->render_widget_content($widget_settings); ?>
                    </div>
                </div>
            <?php else: ?>
                <!-- Fixed Position Widget -->
                <!-- Trigger Button -->
                <button class="heiwa-booking-trigger" style="background-color: <?php echo esc_attr($widget_settings['primary_color']); ?>;" data-widget-target="<?php echo esc_attr($widget_id); ?>">
                    <svg class="heiwa-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
                        <path d="M8 14H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span><?php echo esc_html($widget_settings['trigger_text']); ?></span>
                </button>

                <!-- Widget Panel -->
                <div class="heiwa-booking-panel">
                    <!-- Panel Header -->
                    <div class="heiwa-booking-header">
                        <h3><?php _e('Book Your Surf Adventure', 'heiwa-booking-widget'); ?></h3>
                        <button class="heiwa-booking-close" data-widget-target="<?php echo esc_attr($widget_id); ?>">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Panel Content -->
                    <div class="heiwa-booking-content">
                        <?php $this->render_widget_content($widget_settings); ?>
                    </div>
                </div>

                <!-- Overlay -->
                <div class="heiwa-booking-overlay" data-widget-target="<?php echo esc_attr($widget_id); ?>"></div>
            <?php endif; ?>
        </div>

        <style>
            #<?php echo esc_attr($widget_id); ?> {
                --heiwa-primary-color: <?php echo esc_attr($widget_settings['primary_color']); ?>;
                --heiwa-primary-hover: <?php echo esc_attr($this->adjust_brightness($widget_settings['primary_color'], -20)); ?>;
            }
        </style>

        <script>
            // Initialize this specific widget instance
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof window.HeiwaBookingWidget !== 'undefined') {
                    window.HeiwaBookingWidget.init('<?php echo esc_js($widget_id); ?>', <?php echo wp_json_encode($widget_settings); ?>);
                }
            });
        </script>
        <?php
        
        return ob_get_clean();
    }

    /**
     * Render widget content (shared between inline and popup versions)
     * 
     * @param array $settings Widget settings
     */
    private function render_widget_content($settings) {
        ?>
        <!-- Loading State -->
        <div class="heiwa-booking-loading">
            <div class="heiwa-spinner"></div>
            <p><?php _e('Loading surf camps...', 'heiwa-booking-widget'); ?></p>
        </div>

        <!-- Error State -->
        <div class="heiwa-booking-error" style="display: none;">
            <div class="heiwa-error-icon">⚠️</div>
            <h4><?php _e('Connection Error', 'heiwa-booking-widget'); ?></h4>
            <p class="heiwa-error-message"></p>
            <button class="heiwa-button heiwa-button-secondary heiwa-retry-button">
                <?php _e('Try Again', 'heiwa-booking-widget'); ?>
            </button>
        </div>

        <!-- Step 1: Destination Selection -->
        <div class="heiwa-booking-step heiwa-step-destinations">
            <h4><?php _e('Choose Your Destination', 'heiwa-booking-widget'); ?></h4>
            
            <?php if (!empty($settings['destinations'])): ?>
            <p class="heiwa-filtered-message">
                <?php printf(__('Showing destinations: %s', 'heiwa-booking-widget'), implode(', ', $settings['destinations'])); ?>
            </p>
            <?php endif; ?>
            
            <div class="heiwa-destinations-grid">
                <!-- Destinations will be loaded via AJAX -->
            </div>
        </div>

        <!-- Step 2: Date Selection -->
        <div class="heiwa-booking-step heiwa-step-dates" style="display: none;">
            <div class="heiwa-step-header">
                <button class="heiwa-back-button" data-step="destinations">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <?php _e('Back', 'heiwa-booking-widget'); ?>
                </button>
                <h4><?php _e('Select Dates', 'heiwa-booking-widget'); ?></h4>
            </div>
            <div class="heiwa-selected-camp">
                <!-- Selected camp info -->
            </div>
            <div class="heiwa-date-picker">
                <!-- Date picker will be rendered here -->
            </div>
            <div class="heiwa-availability-info">
                <!-- Availability and pricing info -->
            </div>
        </div>

        <!-- Step 3: Booking Form -->
        <div class="heiwa-booking-step heiwa-step-booking" style="display: none;">
            <div class="heiwa-step-header">
                <button class="heiwa-back-button" data-step="dates">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <?php _e('Back', 'heiwa-booking-widget'); ?>
                </button>
                <h4><?php _e('Booking Details', 'heiwa-booking-widget'); ?></h4>
            </div>
            
            <form class="heiwa-booking-form">
                <div class="heiwa-booking-summary">
                    <!-- Booking summary -->
                </div>
                
                <div class="heiwa-form-section">
                    <h5><?php _e('Participants', 'heiwa-booking-widget'); ?></h5>
                    <div class="heiwa-participants-controls">
                        <label><?php _e('Number of participants:', 'heiwa-booking-widget'); ?></label>
                        <div class="heiwa-counter">
                            <button type="button" class="heiwa-counter-btn" data-action="decrease">-</button>
                            <input type="number" class="heiwa-participant-count" value="1" min="1" max="8">
                            <button type="button" class="heiwa-counter-btn" data-action="increase">+</button>
                        </div>
                    </div>
                    <div class="heiwa-participants-list">
                        <!-- Participant forms will be generated here -->
                    </div>
                </div>

                <div class="heiwa-form-section">
                    <h5><?php _e('Additional Information', 'heiwa-booking-widget'); ?></h5>
                    <textarea 
                        name="special_requests" 
                        class="heiwa-special-requests"
                        placeholder="<?php _e('Any special requests or dietary requirements?', 'heiwa-booking-widget'); ?>"
                        rows="3"
                    ></textarea>
                </div>

                <div class="heiwa-form-actions">
                    <div class="heiwa-total-price">
                        <!-- Total price will be calculated here -->
                    </div>
                    <button type="submit" class="heiwa-button heiwa-button-primary" style="background-color: <?php echo esc_attr($settings['primary_color']); ?>;">
                        <?php _e('Complete Booking', 'heiwa-booking-widget'); ?>
                    </button>
                </div>
            </form>
        </div>

        <!-- Step 4: Confirmation -->
        <div class="heiwa-booking-step heiwa-step-confirmation" style="display: none;">
            <div class="heiwa-confirmation-content">
                <!-- Booking confirmation will be shown here -->
            </div>
        </div>
        <?php
    }

    /**
     * Add shortcode button to editor
     */
    public function add_shortcode_button() {
        if (!current_user_can('edit_posts') && !current_user_can('edit_pages')) {
            return;
        }

        echo '<button type="button" class="button" onclick="heiwaInsertShortcode();">';
        echo '<span class="dashicons dashicons-calendar-alt" style="vertical-align: middle;"></span> ';
        echo __('Heiwa Booking', 'heiwa-booking-widget');
        echo '</button>';

        ?>
        <script>
        function heiwaInsertShortcode() {
            var shortcode = '[heiwa_booking]';
            
            // For classic editor
            if (typeof tinyMCE !== 'undefined' && tinyMCE.activeEditor && !tinyMCE.activeEditor.isHidden()) {
                tinyMCE.activeEditor.execCommand('mceInsertContent', false, shortcode);
            }
            // For text editor
            else if (typeof QTags !== 'undefined') {
                QTags.insertContent(shortcode);
            }
            // For Gutenberg (basic support)
            else {
                navigator.clipboard.writeText(shortcode).then(function() {
                    alert('<?php echo esc_js(__('Shortcode copied to clipboard: [heiwa_booking]', 'heiwa-booking-widget')); ?>');
                });
            }
        }
        </script>
        <?php
    }

    /**
     * Maybe enqueue assets when shortcode is used
     */
    public function maybe_enqueue_assets() {
        global $post, $heiwa_booking_shortcode_used;
        
        // Check if shortcode is used in post content
        $has_shortcode = false;
        
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'heiwa_booking')) {
            $has_shortcode = true;
        }
        
        // Also check if shortcode was used programmatically
        if (!empty($heiwa_booking_shortcode_used)) {
            $has_shortcode = true;
        }

        if ($has_shortcode) {
            // Enqueue the same assets as the main widget
            $widget = new Heiwa_Booking_Widget();
            $widget->enqueue_frontend_assets();
        }
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
