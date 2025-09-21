<?php
/**
 * REST API Proxy for Heiwa Booking Widget
 *
 * Provides secure proxy endpoints for communicating with the Heiwa Booking API
 * while enforcing WordPress security measures and capability checks.
 *
 * @package HeiwaBookingWidget
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API Proxy class
 */
class Heiwa_Booking_REST_Proxy {

    /**
     * API namespace
     */
    const API_NAMESPACE = 'heiwa/v1';

    /**
     * API endpoints
     */
    const ENDPOINTS = array(
        'availability' => '/get-availability',
        'price-quote' => '/price-quote',
        'create-checkout' => '/create-checkout',
        'webhook' => '/stripe-webhook',
    );

    /**
     * Initialize the REST API proxy
     */
    public static function init() {
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
    }

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        // Availability endpoint
        register_rest_route(self::API_NAMESPACE, '/availability', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'handle_availability_request'),
            'permission_callback' => array(__CLASS__, 'check_public_permissions'),
            'args' => self::get_availability_args(),
        ));

        // Price quote endpoint
        register_rest_route(self::API_NAMESPACE, '/price-quote', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'handle_price_quote_request'),
            'permission_callback' => array(__CLASS__, 'check_authenticated_permissions'),
            'args' => self::get_price_quote_args(),
        ));

        // Checkout creation endpoint
        register_rest_route(self::API_NAMESPACE, '/create-checkout', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'handle_create_checkout_request'),
            'permission_callback' => array(__CLASS__, 'check_authenticated_permissions'),
            'args' => self::get_create_checkout_args(),
        ));

        // Webhook endpoint (no authentication required - validated by signature)
        register_rest_route(self::API_NAMESPACE, '/webhook', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'handle_webhook_request'),
            'permission_callback' => '__return_true', // Webhooks use signature validation
        ));
    }

    /**
     * Handle availability requests
     *
     * @param WP_REST_Request $request The REST request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public static function handle_availability_request($request) {
        // Validate request
        $validation = Heiwa_Booking_Security::validate_rest_request($request);
        if (is_wp_error($validation)) {
            return $validation;
        }

        $params = $request->get_params();

        // Get plugin settings
        $settings = get_option('heiwa_booking_settings', array());
        if (empty($settings['api_endpoint'])) {
            return new WP_Error(
                'configuration_error',
                __('API endpoint not configured', 'heiwa-booking-widget'),
                array('status' => 500)
            );
        }

        // Prepare API request
        $api_url = rtrim($settings['api_endpoint'], '/') . self::ENDPOINTS['availability'];
        $api_params = array(
            'brand_id' => $params['brand_id'],
            'check_in_date' => $params['check_in_date'] ?? null,
            'check_out_date' => $params['check_out_date'] ?? null,
            'guest_count' => intval($params['guest_count']),
            'property_ids' => $params['property_ids'] ?? null,
            'room_types' => $params['room_types'] ?? null,
        );

        // Make API call
        $response = self::make_api_request($api_url, $api_params, 'POST');

        if (is_wp_error($response)) {
            return $response;
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * Handle price quote requests
     *
     * @param WP_REST_Request $request The REST request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public static function handle_price_quote_request($request) {
        // Validate request
        $validation = Heiwa_Booking_Security::validate_rest_request($request);
        if (is_wp_error($validation)) {
            return $validation;
        }

        $params = $request->get_params();

        // Validate booking data
        $validated_data = Heiwa_Booking_Security::validate_booking_data($params);
        if (is_wp_error($validated_data)) {
            return $validated_data;
        }

        // Get plugin settings
        $settings = get_option('heiwa_booking_settings', array());
        if (empty($settings['api_endpoint'])) {
            return new WP_Error(
                'configuration_error',
                __('API endpoint not configured', 'heiwa-booking-widget'),
                array('status' => 500)
            );
        }

        // Prepare API request
        $api_url = rtrim($settings['api_endpoint'], '/') . self::ENDPOINTS['price-quote'];
        $api_params = array(
            'brand_id' => $validated_data['brand_id'] ?? $settings['brand_id'] ?? null,
            'camp_week_id' => $validated_data['camp_week_id'],
            'beds' => $validated_data['beds'],
            'addons' => $validated_data['addons'] ?? array(),
            'promo_code' => $validated_data['promo_code'] ?? null,
            'check_in_date' => $validated_data['check_in_date'] ?? null,
            'check_out_date' => $validated_data['check_out_date'] ?? null,
            'guest_count' => intval($validated_data['guest_count']),
        );

        // Make API call
        $response = self::make_api_request($api_url, $api_params, 'POST');

        if (is_wp_error($response)) {
            return $response;
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * Handle checkout creation requests
     *
     * @param WP_REST_Request $request The REST request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public static function handle_create_checkout_request($request) {
        // Validate request
        $validation = Heiwa_Booking_Security::validate_rest_request($request);
        if (is_wp_error($validation)) {
            return $validation;
        }

        $params = $request->get_params();

        // Validate booking data
        $validated_data = Heiwa_Booking_Security::validate_booking_data($params);
        if (is_wp_error($validated_data)) {
            return $validated_data;
        }

        // Additional validation for checkout
        if (empty($validated_data['success_url']) || empty($validated_data['cancel_url'])) {
            return new WP_Error(
                'validation_error',
                __('Success URL and cancel URL are required', 'heiwa-booking-widget'),
                array('status' => 400)
            );
        }

        // Validate URLs
        if (!wp_http_validate_url($validated_data['success_url']) || !wp_http_validate_url($validated_data['cancel_url'])) {
            return new WP_Error(
                'validation_error',
                __('Invalid success or cancel URL', 'heiwa-booking-widget'),
                array('status' => 400)
            );
        }

        // Get plugin settings
        $settings = get_option('heiwa_booking_settings', array());
        if (empty($settings['api_endpoint'])) {
            return new WP_Error(
                'configuration_error',
                __('API endpoint not configured', 'heiwa-booking-widget'),
                array('status' => 500)
            );
        }

        // Prepare API request
        $api_url = rtrim($settings['api_endpoint'], '/') . self::ENDPOINTS['create-checkout'];
        $api_params = array(
            'brand_id' => $validated_data['brand_id'] ?? $settings['brand_id'] ?? null,
            'camp_week_id' => $validated_data['camp_week_id'],
            'beds' => $validated_data['beds'],
            'customer' => array(
                'email' => $validated_data['customer_email'],
                'first_name' => $validated_data['customer_first_name'],
                'last_name' => $validated_data['customer_last_name'],
                'phone' => $validated_data['customer_phone'] ?? null,
                'date_of_birth' => $validated_data['date_of_birth'] ?? null,
                'emergency_contact' => $validated_data['emergency_contact'] ?? null,
            ),
            'addons' => $validated_data['addons'] ?? array(),
            'promo_code' => $validated_data['promo_code'] ?? null,
            'check_in_date' => $validated_data['check_in_date'] ?? null,
            'check_out_date' => $validated_data['check_out_date'] ?? null,
            'special_requests' => $validated_data['special_requests'] ?? null,
            'success_url' => $validated_data['success_url'],
            'cancel_url' => $validated_data['cancel_url'],
        );

        // Make API call
        $response = self::make_api_request($api_url, $api_params, 'POST');

        if (is_wp_error($response)) {
            return $response;
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * Handle webhook requests
     *
     * @param WP_REST_Request $request The REST request
     * @return WP_REST_Response|WP_Error Response or error
     */
    public static function handle_webhook_request($request) {
        // Webhooks are handled directly by the API, just proxy them
        $settings = get_option('heiwa_booking_settings', array());
        if (empty($settings['api_endpoint'])) {
            return new WP_Error(
                'configuration_error',
                __('API endpoint not configured', 'heiwa-booking-widget'),
                array('status' => 500)
            );
        }

        $api_url = rtrim($settings['api_endpoint'], '/') . self::ENDPOINTS['webhook'];

        // Get raw body for signature verification
        $body = $request->get_body();
        $headers = $request->get_headers();

        // Forward headers needed for webhook validation
        $forward_headers = array();
        if (isset($headers['stripe_signature'])) {
            $forward_headers['stripe-signature'] = $headers['stripe_signature'][0];
        }

        // Make API call with raw body and headers
        $response = self::make_api_request($api_url, $body, 'POST', $forward_headers, 'raw');

        if (is_wp_error($response)) {
            return $response;
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * Check public permissions (for availability)
     *
     * @param WP_REST_Request $request The REST request
     * @return bool Whether the request is allowed
     */
    public static function check_public_permissions($request) {
        // Rate limiting for public endpoints
        $ip = Heiwa_Booking_Security::get_client_ip();
        $rate_key = 'heiwa_public_api_' . $ip;
        $requests = get_transient($rate_key);

        if ($requests === false) {
            $requests = array();
        }

        // Clean old requests (5 minute window)
        $requests = array_filter($requests, function($timestamp) {
            return (time() - $timestamp) < 300;
        });

        // Allow max 100 requests per 5 minutes
        if (count($requests) >= 100) {
            return new WP_Error(
                'rate_limit_exceeded',
                __('Too many requests. Please try again later.', 'heiwa-booking-widget'),
                array('status' => 429)
            );
        }

        $requests[] = time();
        set_transient($rate_key, $requests, 300);

        return true;
    }

    /**
     * Check authenticated permissions (for booking operations)
     *
     * @param WP_REST_Request $request The REST request
     * @return bool Whether the request is allowed
     */
    public static function check_authenticated_permissions($request) {
        // Allow logged-in users or valid nonce
        if (is_user_logged_in()) {
            return true;
        }

        // Check nonce for non-logged-in users
        $nonce = $request->get_header('x_wp_nonce') ?: $request->get_param('_wpnonce');
        if (!empty($nonce) && wp_verify_nonce($nonce, 'wp_rest')) {
            return true;
        }

        return new WP_Error(
            'rest_forbidden',
            __('Authentication required for this operation', 'heiwa-booking-widget'),
            array('status' => 401)
        );
    }

    /**
     * Make API request to backend
     *
     * @param string $url The API URL
     * @param array|string $data The request data
     * @param string $method The HTTP method
     * @param array $headers Additional headers
     * @param string $data_format Data format ('json' or 'raw')
     * @return array|WP_Error Response data or error
     */
    private static function make_api_request($url, $data, $method = 'POST', $headers = array(), $data_format = 'json') {
        $settings = get_option('heiwa_booking_settings', array());

        $request_args = array(
            'method' => $method,
            'timeout' => 30,
            'headers' => array_merge(array(
                'Content-Type' => 'application/json',
                'User-Agent' => 'HeiwaBookingWidget/' . HEIWA_BOOKING_VERSION . ' (WordPress)',
            ), $headers),
            'body' => $data_format === 'raw' ? $data : wp_json_encode($data),
        );

        // Add API key if configured
        if (!empty($settings['api_key'])) {
            $request_args['headers']['Authorization'] = 'Bearer ' . $settings['api_key'];
        }

        $response = wp_remote_request($url, $request_args);

        if (is_wp_error($response)) {
            Heiwa_Booking_Security::log_security_event('api_request_failed', array(
                'url' => $url,
                'error' => $response->get_error_message()
            ));

            return new WP_Error(
                'api_error',
                __('Failed to communicate with booking service', 'heiwa-booking-widget'),
                array('status' => 502)
            );
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        // Log API calls for monitoring
        Heiwa_Booking_Security::log_security_event('api_request', array(
            'url' => $url,
            'method' => $method,
            'response_code' => $response_code,
            'response_size' => strlen($response_body)
        ));

        if ($response_code >= 400) {
            $error_data = json_decode($response_body, true);
            $error_message = isset($error_data['message']) ? $error_data['message'] : __('API request failed', 'heiwa-booking-widget');

            return new WP_Error(
                'api_error',
                $error_message,
                array('status' => $response_code)
            );
        }

        $decoded_response = json_decode($response_body, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error(
                'api_error',
                __('Invalid response from booking service', 'heiwa-booking-widget'),
                array('status' => 502)
            );
        }

        return $decoded_response;
    }

    /**
     * Get availability endpoint arguments
     *
     * @return array Argument definitions
     */
    private static function get_availability_args() {
        return array(
            'brand_id' => array(
                'required' => true,
                'type' => 'string',
                'description' => 'Brand identifier',
                'validate_callback' => function($value) {
                    return is_string($value) && !empty($value);
                }
            ),
            'check_in_date' => array(
                'type' => 'string',
                'description' => 'Check-in date (YYYY-MM-DD)',
                'validate_callback' => function($value) {
                    return empty($value) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $value);
                }
            ),
            'check_out_date' => array(
                'type' => 'string',
                'description' => 'Check-out date (YYYY-MM-DD)',
                'validate_callback' => function($value) {
                    return empty($value) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $value);
                }
            ),
            'guest_count' => array(
                'required' => true,
                'type' => 'integer',
                'description' => 'Number of guests',
                'minimum' => 1,
                'maximum' => 20,
            ),
            'property_ids' => array(
                'type' => 'array',
                'description' => 'Specific property IDs to search',
                'items' => array('type' => 'string'),
            ),
            'room_types' => array(
                'type' => 'array',
                'description' => 'Room types to include',
                'items' => array(
                    'type' => 'string',
                    'enum' => array('dorm', 'private', 'suite')
                ),
            ),
        );
    }

    /**
     * Get price quote endpoint arguments
     *
     * @return array Argument definitions
     */
    private static function get_price_quote_args() {
        return array(
            'brand_id' => array(
                'type' => 'string',
                'description' => 'Brand identifier',
            ),
            'camp_week_id' => array(
                'required' => true,
                'type' => 'string',
                'description' => 'Camp week identifier',
            ),
            'beds' => array(
                'required' => true,
                'type' => 'array',
                'description' => 'Selected bed IDs',
                'items' => array('type' => 'string'),
                'minItems' => 1,
            ),
            'addons' => array(
                'type' => 'array',
                'description' => 'Selected addons',
                'items' => array(
                    'type' => 'object',
                    'properties' => array(
                        'addon_id' => array('type' => 'string'),
                        'quantity' => array('type' => 'integer', 'minimum' => 1),
                    ),
                    'required' => array('addon_id', 'quantity'),
                ),
            ),
            'promo_code' => array(
                'type' => 'string',
                'description' => 'Promotional code',
            ),
            'check_in_date' => array(
                'type' => 'string',
                'description' => 'Check-in date override',
            ),
            'check_out_date' => array(
                'type' => 'string',
                'description' => 'Check-out date override',
            ),
            'guest_count' => array(
                'required' => true,
                'type' => 'integer',
                'description' => 'Number of guests',
                'minimum' => 1,
                'maximum' => 20,
            ),
        );
    }

    /**
     * Get create checkout endpoint arguments
     *
     * @return array Argument definitions
     */
    private static function get_create_checkout_args() {
        $base_args = self::get_price_quote_args();

        // Add checkout-specific arguments
        $base_args['customer_email'] = array(
            'required' => true,
            'type' => 'string',
            'description' => 'Customer email address',
            'format' => 'email',
        );
        $base_args['customer_first_name'] = array(
            'required' => true,
            'type' => 'string',
            'description' => 'Customer first name',
        );
        $base_args['customer_last_name'] = array(
            'required' => true,
            'type' => 'string',
            'description' => 'Customer last name',
        );
        $base_args['customer_phone'] = array(
            'type' => 'string',
            'description' => 'Customer phone number',
        );
        $base_args['success_url'] = array(
            'required' => true,
            'type' => 'string',
            'description' => 'Success redirect URL',
            'format' => 'uri',
        );
        $base_args['cancel_url'] = array(
            'required' => true,
            'type' => 'string',
            'description' => 'Cancel redirect URL',
            'format' => 'uri',
        );
        $base_args['special_requests'] = array(
            'type' => 'string',
            'description' => 'Special requests or notes',
        );

        // Remove arguments not needed for checkout
        unset($base_args['guest_count']); // Derived from beds

        return $base_args;
    }
}

// Initialize REST API proxy
Heiwa_Booking_REST_Proxy::init();
