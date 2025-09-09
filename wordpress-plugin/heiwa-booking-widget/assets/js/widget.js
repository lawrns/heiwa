/**
 * Heiwa Booking Widget JavaScript
 *
 * Handles the booking widget functionality including:
 * - Widget toggle and display
 * - Direct API requests to backend
 * - Form handling and validation
 * - Booking flow management
 */

(function($) {
    'use strict';

    // Ensure $ is available for our code
    if (typeof $ === 'undefined' && typeof jQuery !== 'undefined') {
        $ = jQuery;
    }

    // Widget state
    let isWidgetOpen = false;
    let currentStep = 'destinations';
    let selectedCamp = null;
    let availabilityData = null;
    let surfCamps = [];

    // API configuration
    const API_CONFIG = {
        endpoint: heiwa_booking_ajax.api_endpoint || 'http://localhost:3005/api',
        apiKey: heiwa_booking_ajax.api_key || 'heiwa_wp_test_key_2024_secure_deployment'
    };

    /**
     * Initialize the booking widget
     */
    function initBookingWidget() {
        // Bind event handlers
        bindEvents();

        // Initialize modal state
        resetWidget();

        // Load initial data (but don't show it until modal opens)
        loadSurfCamps();
    }

    /**
     * Make API request to backend
     */
    function makeAPIRequest(endpoint, options = {}) {
        const url = `${API_CONFIG.endpoint}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'X-Heiwa-API-Key': API_CONFIG.apiKey,
                'Content-Type': 'application/json'
            }
        };

        return fetch(url, { ...defaultOptions, ...options })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            });
    }

    /**
     * Bind event handlers
     */
    function bindEvents() {
        // Widget toggle - use the correct class names from shortcode
        $(document).on('click', '.heiwa-booking-trigger', toggleWidget);
        $(document).on('click', '.heiwa-booking-close', closeWidget);
        $(document).on('click', '.heiwa-booking-overlay', closeWidget);

        // Navigation between steps
        $(document).on('click', '.heiwa-back-button', function() {
            const targetStep = $(this).data('step');
            showStep(targetStep);
        });

        // Destination selection
        $(document).on('click', '.heiwa-destination-card', selectDestination);

        // Participant counter
        $(document).on('click', '.heiwa-counter-btn', handleParticipantCounter);

        // Form submission
        $(document).on('submit', '.heiwa-booking-form', submitBooking);

        // Retry button
        $(document).on('click', '.heiwa-retry-button', loadSurfCamps);

        // Close widget when clicking outside
        $(document).on('click', function(e) {
            if (isWidgetOpen && !$(e.target).closest('.heiwa-booking-widget').length) {
                closeWidget();
            }
        });
    }

    /**
     * Toggle widget visibility
     */
    function toggleWidget() {
        if (isWidgetOpen) {
            closeWidget();
        } else {
            openWidget();
        }
    }

    /**
     * Open the widget
     */
    function openWidget() {
        $('.heiwa-booking-panel').addClass('heiwa-open');
        $('.heiwa-booking-overlay').addClass('heiwa-open');
        isWidgetOpen = true;

        // Show the destinations step and load data if not already loaded
        showStep('destinations');
        if (surfCamps.length === 0) {
            loadSurfCamps();
        } else {
            $('.heiwa-booking-loading').hide();
            $('.heiwa-step-destinations').show();
        }

        // Prevent body scroll
        $('body').addClass('heiwa-modal-open');
    }

    /**
     * Close the widget
     */
    function closeWidget() {
        $('.heiwa-booking-panel').removeClass('heiwa-open');
        $('.heiwa-booking-overlay').removeClass('heiwa-open');
        isWidgetOpen = false;

        // Re-enable body scroll
        $('body').removeClass('heiwa-modal-open');
    }

    /**
     * Show a specific step
     */
    function showStep(step) {
        $('.heiwa-booking-step').hide();
        $(`.heiwa-step-${step}`).show();
        currentStep = step;
    }

    /**
     * Load surf camps from API
     */
    function loadSurfCamps() {
        // Only show loading if modal is open
        if (isWidgetOpen) {
            $('.heiwa-booking-loading').show();
            $('.heiwa-booking-error').hide();
            $('.heiwa-step-destinations').hide();
        }

        makeAPIRequest('/wordpress/surf-camps')
            .then(response => {
                if (response.success && response.data) {
                    surfCamps = response.data.surf_camps || [];
                    displaySurfCamps(surfCamps);
                    if (isWidgetOpen) {
                        $('.heiwa-booking-loading').hide();
                        $('.heiwa-step-destinations').show();
                    }
                } else {
                    throw new Error(response.message || 'Failed to load surf camps');
                }
            })
            .catch(error => {
                console.error('Error loading surf camps:', error);
                if (isWidgetOpen) {
                    $('.heiwa-booking-loading').hide();
                    showError('Failed to load surf camps. Please check your connection and try again.');
                }
            });
    }

    /**
     * Display surf camps in the widget
     */
    function displaySurfCamps(camps) {
        const destinationsGrid = $('.heiwa-destinations-grid');
        destinationsGrid.empty();

        if (!camps || camps.length === 0) {
            destinationsGrid.html('<p>No surf camps available at the moment.</p>');
            return;
        }

        camps.forEach(camp => {
            const destinationCard = `
                <div class="heiwa-destination-card" data-camp-id="${camp.id}">
                    <img class="heiwa-destination-image" src="${camp.media?.featured_image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=200&fit=crop'}" alt="${camp.name}">
                    <div class="heiwa-destination-name">${camp.name}</div>
                    <div class="heiwa-destination-description">${camp.description ? camp.description.substring(0, 100) + '...' : 'Experience amazing surf adventures'}</div>
                    <div class="heiwa-destination-details">
                        <div class="heiwa-destination-price">${camp.pricing?.display_price || 'From €' + camp.pricing?.base_price}</div>
                        <div class="heiwa-destination-dates">${camp.destination || camp.dates?.formatted_dates || 'Multiple locations'}</div>
                    </div>
                </div>
            `;
            destinationsGrid.append(destinationCard);
        });
    }

    /**
     * Select a destination/surf camp
     */
    function selectDestination(e) {
        const campId = $(e.currentTarget).data('camp-id');
        selectedCamp = surfCamps.find(camp => camp.id === campId);

        // Highlight selected destination
        $('.heiwa-destination-card').removeClass('heiwa-selected');
        $(e.currentTarget).addClass('heiwa-selected');

        // Move to next step after a brief delay
        setTimeout(() => {
            showStep('dates');
            setupDatePicker();
        }, 300);
    }

    /**
     * Setup date picker for selected camp
     */
    function setupDatePicker() {
        if (!selectedCamp) return;

        // Display selected camp info
        const selectedCampInfo = `
            <div class="heiwa-selected-camp-info">
                <h5>${selectedCamp.name}</h5>
                <p>${selectedCamp.location || ''}</p>
                <p>From $${selectedCamp.price_per_day}/day</p>
            </div>
        `;
        $('.heiwa-selected-camp').html(selectedCampInfo);

        // Setup date picker (simplified for now)
        const datePickerHTML = `
            <div class="heiwa-date-form">
                <div class="heiwa-form-group">
                    <label>Start Date:</label>
                    <input type="date" class="heiwa-start-date" min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="heiwa-form-group">
                    <label>End Date:</label>
                    <input type="date" class="heiwa-end-date" min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="heiwa-form-group">
                    <label>Participants:</label>
                    <select class="heiwa-participants">
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="3">3 People</option>
                        <option value="4">4 People</option>
                        <option value="5">5+ People</option>
                    </select>
                </div>
                <button type="button" class="heiwa-button heiwa-button-primary heiwa-check-availability">Check Availability</button>
            </div>
        `;
        $('.heiwa-date-picker').html(datePickerHTML);

        // Bind availability check
        $(document).on('click', '.heiwa-check-availability', checkAvailability);
    }

    /**
     * Check availability for selected dates
     */
    function checkAvailability() {
        const startDate = $('.heiwa-start-date').val();
        const endDate = $('.heiwa-end-date').val();
        const participants = $('.heiwa-participants').val();

        if (!startDate || !endDate || !participants) {
            showError('Please fill in all required fields.');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            showError('End date must be after start date.');
            return;
        }

        // Show loading state
        $('.heiwa-check-availability').text('Checking...').prop('disabled', true);

        const params = new URLSearchParams({
            camp_id: selectedCamp.id,
            start_date: startDate,
            end_date: endDate,
            participants: participants
        });

        makeAPIRequest(`/wordpress/availability?${params}`)
            .then(data => {
                $('.heiwa-check-availability').text('Check Availability').prop('disabled', false);
                availabilityData = { ...data, startDate, endDate, participants };
                displayAvailability(data);
                showStep('booking');
            })
            .catch(error => {
                $('.heiwa-check-availability').text('Check Availability').prop('disabled', false);
                showError('Failed to check availability. Please try again.');
            });
    }

    /**
     * Display availability information
     */
    function displayAvailability(data) {
        const summaryHTML = `
            <div class="heiwa-summary-item">
                <span>Camp:</span>
                <span>${selectedCamp.name}</span>
            </div>
            <div class="heiwa-summary-item">
                <span>Dates:</span>
                <span>${availabilityData.startDate} to ${availabilityData.endDate}</span>
            </div>
            <div class="heiwa-summary-item">
                <span>Participants:</span>
                <span>${availabilityData.participants}</span>
            </div>
            <div class="heiwa-summary-item">
                <span>Total Price:</span>
                <span>$${data.total_price || (selectedCamp.price_per_day * availabilityData.participants * calculateDays(availabilityData.startDate, availabilityData.endDate))}</span>
            </div>
        `;
        $('.heiwa-booking-summary').html(summaryHTML);

        // Setup participant forms
        setupParticipantForms(parseInt(availabilityData.participants));
    }

    /**
     * Calculate number of days between dates
     */
    function calculateDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Setup participant forms
     */
    function setupParticipantForms(participantCount) {
        const participantsList = $('.heiwa-participants-list');
        participantsList.empty();

        for (let i = 1; i <= participantCount; i++) {
            const participantForm = `
                <div class="heiwa-participant-form">
                    <div class="heiwa-participant-header">
                        <div class="heiwa-participant-title">Participant ${i}</div>
                    </div>
                    <div class="heiwa-participant-fields">
                        <div class="heiwa-form-group">
                            <label>First Name:</label>
                            <input type="text" name="participant_${i}_first_name" required>
                        </div>
                        <div class="heiwa-form-group">
                            <label>Last Name:</label>
                            <input type="text" name="participant_${i}_last_name" required>
                        </div>
                        <div class="heiwa-form-group">
                            <label>Email:</label>
                            <input type="email" name="participant_${i}_email" required>
                        </div>
                    </div>
                </div>
            `;
            participantsList.append(participantForm);
        }

        // Update participant counter display
        $('.heiwa-participant-count').val(participantCount);
    }

    /**
     * Handle participant counter buttons
     */
    function handleParticipantCounter(e) {
        const action = $(e.currentTarget).data('action');
        const countInput = $('.heiwa-participant-count');
        let currentCount = parseInt(countInput.val());

        if (action === 'increase' && currentCount < 8) {
            currentCount++;
        } else if (action === 'decrease' && currentCount > 1) {
            currentCount--;
        }

        countInput.val(currentCount);
        setupParticipantForms(currentCount);
    }

    /**
     * Submit booking form
     */
    function submitBooking(e) {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(e.target);
        const participants = [];
        const participantCount = parseInt($('.heiwa-participant-count').val());

        // Collect participant data
        for (let i = 1; i <= participantCount; i++) {
            participants.push({
                first_name: formData.get(`participant_${i}_first_name`),
                last_name: formData.get(`participant_${i}_last_name`),
                email: formData.get(`participant_${i}_email`)
            });
        }

        const bookingData = {
            camp_id: selectedCamp.id,
            start_date: availabilityData.startDate,
            end_date: availabilityData.endDate,
            participants: participants,
            special_requests: formData.get('special_requests') || '',
            source: 'wordpress',
            wordpress_meta: {
                site_url: window.location.origin,
                page_url: window.location.href,
                widget_version: '1.0.0',
                utm_source: 'wordpress_widget',
                utm_medium: 'booking_widget',
                utm_campaign: 'surf_camp_booking'
            }
        };

        // Show loading state
        const submitBtn = $('.heiwa-booking-form button[type="submit"]');
        const originalText = submitBtn.text();
        submitBtn.text('Processing...').prop('disabled', true);

        makeAPIRequest('/wordpress/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        })
        .then(data => {
            submitBtn.text(originalText).prop('disabled', false);
            showConfirmation(data);
        })
        .catch(error => {
            submitBtn.text(originalText).prop('disabled', false);
            showError('Failed to create booking. Please try again.');
        });
    }

    /**
     * Show booking confirmation
     */
    function showConfirmation(data) {
        const confirmationHTML = `
            <div class="heiwa-confirmation-icon">✓</div>
            <div class="heiwa-confirmation-title">Booking Confirmed!</div>
            <div class="heiwa-confirmation-message">
                <p>Your booking has been successfully created.</p>
                <p><strong>Booking ID:</strong> ${data.booking_id}</p>
                <p>You will receive a confirmation email shortly with payment instructions.</p>
            </div>
            <button class="heiwa-button heiwa-button-primary" onclick="location.reload()">Book Another Trip</button>
        `;
        $('.heiwa-confirmation-content').html(confirmationHTML);
        showStep('confirmation');
    }

    /**
     * Reset widget to initial state
     */
    function resetWidget() {
        currentStep = 'destinations';
        selectedCamp = null;
        availabilityData = null;

        // Hide all steps initially
        $('.heiwa-booking-step').hide();
        $('.heiwa-booking-loading').hide();
        $('.heiwa-booking-error').hide();

        // Reset selections and forms
        $('.heiwa-destination-card').removeClass('heiwa-selected');
        $('.heiwa-booking-form')[0]?.reset();
    }

    /**
     * Show error message
     */
    function showError(message) {
        $('.heiwa-booking-error .heiwa-error-message').text(message);
        $('.heiwa-booking-loading').hide();
        $('.heiwa-booking-error').show();
        $('.heiwa-step-destinations').hide();
    }

    /**
     * Show success message
     */
    function showSuccess(message) {
        // Could be used for other success messages
        console.log('Success:', message);
    }

    // Global widget object for external access
    window.HeiwaBookingWidget = {
        init: function(widgetId, settings) {
            // Initialize specific widget instance
            initBookingWidget();
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        initBookingWidget();
    });

})(jQuery || window.jQuery);
