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
    let currentStep = 'destination';
    let selectedCamp = null;
    let availabilityData = null;
    let surfCamps = [];
    let bookingData = {
        destination: null,
        dates: { start: null, end: null },
        participants: 1,
        participantDetails: [],
        addons: [],
        specialRequests: '',
        dietaryRequirements: ''
    };

    // Step configuration
    const STEPS = [
        { id: 'destination', title: 'Choose Your Destination', label: 'Destination' },
        { id: 'dates_participants', title: 'Select Dates & Participants', label: 'Dates' },
        { id: 'form_addons', title: 'Your Details & Add-ons', label: 'Details' },
        { id: 'confirmation', title: 'Review & Confirm', label: 'Confirm' }
    ];

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
        console.log('Heiwa Booking Widget: Binding events...');

        // Widget toggle - use the correct class names from shortcode
        $(document).on('click', '.heiwa-booking-trigger', toggleWidget);

        console.log('Heiwa Booking Widget: Events bound successfully');

        // Close widget when clicking outside (updated for sidebar)
        $(document).on('click', function(e) {
            if (isWidgetOpen &&
                !$(e.target).closest('.heiwa-booking-drawer').length &&
                !$(e.target).closest('.heiwa-booking-trigger').length) {
                closeWidget();
            }
        });
    }

    /**
     * Toggle widget visibility
     */
    function toggleWidget(e) {
        if (e) {
            e.preventDefault();
        }
        console.log('Heiwa Booking Widget: Toggle widget called, isOpen:', isWidgetOpen);

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
        // Create sidebar if it doesn't exist
        if (!$('.heiwa-booking-backdrop').length) {
            createSidebarBooking();
        }

        $('.heiwa-booking-backdrop').addClass('active');
        $('.heiwa-booking-drawer').addClass('active');
        isWidgetOpen = true;

        // Show the first step and load data if not already loaded
        showStep('destination');
        if (surfCamps.length === 0) {
            loadSurfCamps();
        } else {
            renderDestinations();
        }

        // Update progress indicator
        updateProgressIndicator();

        // Prevent body scroll
        $('body').addClass('heiwa-modal-open');
    }

    /**
     * Close the widget
     */
    function closeWidget() {
        $('.heiwa-booking-backdrop').removeClass('active');
        $('.heiwa-booking-drawer').removeClass('active');
        isWidgetOpen = false;

        // Re-enable body scroll
        $('body').removeClass('heiwa-modal-open');
    }

    /**
     * Create the sidebar booking structure
     */
    function createSidebarBooking() {
        const sidebarHTML = `
            <div class="heiwa-booking-backdrop"></div>
            <div class="heiwa-booking-drawer" role="dialog" aria-label="Booking Flow">
                <div class="heiwa-booking-drawer-header">
                    <h2 class="heiwa-booking-drawer-title">Book Your Surf Adventure</h2>
                    <button class="heiwa-booking-drawer-close" aria-label="Close booking">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="heiwa-booking-progress">
                    <div class="heiwa-booking-stepper">
                        ${STEPS.map((step, index) => `
                            <div class="heiwa-booking-step ${index === 0 ? 'current' : 'upcoming'}" data-step="${step.id}">
                                <div class="heiwa-booking-step-number">${index + 1}</div>
                                <div class="heiwa-booking-step-label">${step.label}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="heiwa-booking-content">
                    ${STEPS.map(step => `
                        <div class="heiwa-booking-step-content" data-step="${step.id}">
                            <h3 class="heiwa-booking-step-title">${step.title}</h3>
                            <div class="heiwa-step-${step.id}"></div>
                        </div>
                    `).join('')}
                </div>

                <div class="heiwa-booking-summary">
                    <div class="heiwa-summary-content">
                        <div class="heiwa-summary-item">
                            <span class="heiwa-summary-label">Destination:</span>
                            <span class="heiwa-summary-value" data-summary="destination">Not selected</span>
                        </div>
                        <div class="heiwa-summary-item">
                            <span class="heiwa-summary-label">Dates:</span>
                            <span class="heiwa-summary-value" data-summary="dates">Not selected</span>
                        </div>
                        <div class="heiwa-summary-item">
                            <span class="heiwa-summary-label">Participants:</span>
                            <span class="heiwa-summary-value" data-summary="participants">1</span>
                        </div>
                    </div>
                    <div class="heiwa-summary-total">
                        <span class="heiwa-summary-total-label">Total:</span>
                        <span class="heiwa-summary-total-value" data-summary="total">€0</span>
                    </div>
                    <button class="heiwa-cta-button" data-action="next-step">Continue</button>
                </div>
            </div>
        `;

        $('body').append(sidebarHTML);

        // Bind events for the new sidebar
        $('.heiwa-booking-drawer-close').on('click', closeWidget);
        $('.heiwa-booking-backdrop').on('click', function(e) {
            if (e.target === this) {
                closeWidget();
            }
        });
        $('.heiwa-cta-button').on('click', handleCTAClick);
    }

    /**
     * Show a specific step
     */
    function showStep(stepId) {
        currentStep = stepId;

        // Hide all step content
        $('.heiwa-booking-step-content').removeClass('active');

        // Show current step content
        $(`.heiwa-booking-step-content[data-step="${stepId}"]`).addClass('active');

        // Update progress indicator
        updateProgressIndicator();

        // Update CTA button
        updateCTAButton();

        // Render step content
        renderStepContent(stepId);
    }

    /**
     * Update progress indicator
     */
    function updateProgressIndicator() {
        const currentIndex = STEPS.findIndex(step => step.id === currentStep);

        STEPS.forEach((step, index) => {
            const $stepElement = $(`.heiwa-booking-step[data-step="${step.id}"]`);

            $stepElement.removeClass('current completed upcoming');

            if (index < currentIndex) {
                $stepElement.addClass('completed');
            } else if (index === currentIndex) {
                $stepElement.addClass('current');
            } else {
                $stepElement.addClass('upcoming');
            }
        });
    }

    /**
     * Update CTA button based on current step
     */
    function updateCTAButton() {
        const $button = $('.heiwa-cta-button');
        const stepIndex = STEPS.findIndex(step => step.id === currentStep);

        if (stepIndex === STEPS.length - 1) {
            $button.text('Complete Booking');
            $button.attr('data-action', 'complete-booking');
        } else {
            $button.text('Continue');
            $button.attr('data-action', 'next-step');
        }

        // Enable/disable based on step validation
        const isValid = validateCurrentStep();
        $button.prop('disabled', !isValid);
    }

    /**
     * Handle CTA button click
     */
    function handleCTAClick() {
        const action = $('.heiwa-cta-button').attr('data-action');

        if (action === 'next-step') {
            goToNextStep();
        } else if (action === 'complete-booking') {
            completeBooking();
        }
    }

    /**
     * Go to next step
     */
    function goToNextStep() {
        const currentIndex = STEPS.findIndex(step => step.id === currentStep);

        if (currentIndex < STEPS.length - 1) {
            const nextStep = STEPS[currentIndex + 1];
            showStep(nextStep.id);
        }
    }

    /**
     * Validate current step
     */
    function validateCurrentStep() {
        switch (currentStep) {
            case 'destination':
                return bookingData.destination !== null;
            case 'dates_participants':
                return bookingData.dates.start && bookingData.dates.end && bookingData.participants > 0;
            case 'form_addons':
                return bookingData.participantDetails.length === bookingData.participants &&
                       bookingData.participantDetails.every(p => p.firstName && p.lastName && p.email);
            case 'confirmation':
                return true;
            default:
                return false;
        }
    }

    /**
     * Render step content
     */
    function renderStepContent(stepId) {
        switch (stepId) {
            case 'destination':
                renderDestinations();
                break;
            case 'dates_participants':
                renderDatesParticipants();
                break;
            case 'form_addons':
                renderFormAddons();
                break;
            case 'confirmation':
                renderConfirmation();
                break;
        }
    }

    /**
     * Render destinations step
     */
    function renderDestinations() {
        const $container = $('.heiwa-step-destination');

        if (surfCamps.length === 0) {
            $container.html('<div class="heiwa-loading">Loading destinations...</div>');
            return;
        }

        const destinationsHTML = `
            <div class="heiwa-destination-grid">
                ${surfCamps.map(camp => `
                    <div class="heiwa-destination-card ${bookingData.destination?.id === camp.id ? 'selected' : ''}"
                         data-camp-id="${camp.id}">
                        <img src="${camp.image || 'https://via.placeholder.com/300x120/2563eb/ffffff?text=🏄‍♂️+Surf+Camp'}"
                             alt="${camp.name}"
                             class="heiwa-destination-card-image">
                        <div class="heiwa-destination-card-content">
                            <h4 class="heiwa-destination-card-title">
                                🏄‍♂️ ${camp.name}
                            </h4>
                            <p class="heiwa-destination-card-description">
                                ${camp.description || 'Amazing surf experience awaits!'}
                            </p>
                            <div class="heiwa-destination-card-footer">
                                <span class="heiwa-destination-card-price">€${camp.price || 599}</span>
                                <span class="heiwa-destination-card-level">${camp.level || 'All Levels'}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="heiwa-express-booking">
                🚀 Quick Book: Most Popular Camp
            </button>
        `;

        $container.html(destinationsHTML);

        // Bind destination selection events
        $('.heiwa-destination-card').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const campId = $(this).data('camp-id');
            selectDestination(campId);
        });

        $('.heiwa-express-booking').on('click', function() {
            if (surfCamps.length > 0) {
                selectDestination(surfCamps[0].id);
                goToNextStep();
            }
        });
    }

    /**
     * Select a destination
     */
    function selectDestination(campId) {
        console.log('Heiwa Booking Widget: selectDestination called with campId:', campId);
        console.log('Heiwa Booking Widget: surfCamps length:', surfCamps.length);

        if (!surfCamps || surfCamps.length === 0) {
            console.error('Heiwa Booking Widget: surfCamps is empty or undefined');
            return;
        }

        const camp = surfCamps.find(c => c.id === campId);
        console.log('Heiwa Booking Widget: Found camp:', camp);

        if (camp) {
            console.log('Heiwa Booking Widget: Selecting destination:', camp.name);
            bookingData.destination = camp;

            // Update UI
            $('.heiwa-destination-card').removeClass('selected');
            $(`.heiwa-destination-card[data-camp-id="${campId}"]`).addClass('selected');

            // Update summary
            updateSummary();
            updateCTAButton();

            console.log('Heiwa Booking Widget: Advancing to next step...');

            // Auto-advance to next step after a brief delay
            setTimeout(() => {
                goToNextStep();
            }, 500);
        } else {
            console.error('Heiwa Booking Widget: Camp not found with ID:', campId);
        }
    }

    /**
     * Render dates and participants step
     */
    function renderDatesParticipants() {
        const $container = $('.heiwa-step-dates_participants');

        const datesHTML = `
            <div class="heiwa-form-group">
                <label class="heiwa-form-label">Start Date</label>
                <input type="date" class="heiwa-form-input" id="start-date"
                       value="${bookingData.dates.start || ''}" min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="heiwa-form-group">
                <label class="heiwa-form-label">End Date</label>
                <input type="date" class="heiwa-form-input" id="end-date"
                       value="${bookingData.dates.end || ''}" min="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="heiwa-form-group">
                <label class="heiwa-form-label">Number of Participants</label>
                <div class="heiwa-participant-counter">
                    <button type="button" class="heiwa-counter-button" data-action="decrease" ${bookingData.participants <= 1 ? 'disabled' : ''}>−</button>
                    <span class="heiwa-counter-value">${bookingData.participants}</span>
                    <button type="button" class="heiwa-counter-button" data-action="increase" ${bookingData.participants >= 8 ? 'disabled' : ''}>+</button>
                </div>
            </div>
        `;

        $container.html(datesHTML);

        // Bind events
        $('#start-date, #end-date').on('change', updateDates);
        $('.heiwa-counter-button').on('click', updateParticipantCount);
    }

    /**
     * Update dates
     */
    function updateDates() {
        bookingData.dates.start = $('#start-date').val();
        bookingData.dates.end = $('#end-date').val();

        updateSummary();
        updateCTAButton();
    }

    /**
     * Update participant count
     */
    function updateParticipantCount(e) {
        const action = $(e.target).data('action');

        if (action === 'increase' && bookingData.participants < 8) {
            bookingData.participants++;
        } else if (action === 'decrease' && bookingData.participants > 1) {
            bookingData.participants--;
        }

        // Update UI
        $('.heiwa-counter-value').text(bookingData.participants);
        $('.heiwa-counter-button[data-action="decrease"]').prop('disabled', bookingData.participants <= 1);
        $('.heiwa-counter-button[data-action="increase"]').prop('disabled', bookingData.participants >= 8);

        // Ensure participant details array matches count
        while (bookingData.participantDetails.length < bookingData.participants) {
            bookingData.participantDetails.push({ firstName: '', lastName: '', email: '' });
        }
        bookingData.participantDetails = bookingData.participantDetails.slice(0, bookingData.participants);

        updateSummary();
        updateCTAButton();
    }

    /**
     * Render form and addons step
     */
    function renderFormAddons() {
        const $container = $('.heiwa-step-form_addons');

        const formHTML = `
            <div class="heiwa-participant-accordion">
                ${bookingData.participantDetails.map((participant, index) => `
                    <div class="heiwa-participant-item">
                        <div class="heiwa-participant-header" data-participant="${index}">
                            <span>Participant ${index + 1}</span>
                            <span>▼</span>
                        </div>
                        <div class="heiwa-participant-content expanded">
                            <div class="heiwa-participant-fields">
                                <div class="heiwa-form-group">
                                    <label class="heiwa-form-label">First Name</label>
                                    <input type="text" class="heiwa-form-input"
                                           data-participant="${index}" data-field="firstName"
                                           value="${participant.firstName}" required>
                                </div>
                                <div class="heiwa-form-group">
                                    <label class="heiwa-form-label">Last Name</label>
                                    <input type="text" class="heiwa-form-input"
                                           data-participant="${index}" data-field="lastName"
                                           value="${participant.lastName}" required>
                                </div>
                                <div class="heiwa-form-group">
                                    <label class="heiwa-form-label">Email</label>
                                    <input type="email" class="heiwa-form-input"
                                           data-participant="${index}" data-field="email"
                                           value="${participant.email}" required>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="heiwa-form-group">
                <label class="heiwa-form-label">Special Requests</label>
                <textarea class="heiwa-form-textarea" id="special-requests"
                          placeholder="Any special requests or dietary requirements?">${bookingData.specialRequests}</textarea>
            </div>

            <div class="heiwa-trust-signals">
                <svg class="heiwa-trust-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span class="heiwa-trust-text">Secure booking with instant confirmation</span>
            </div>
        `;

        $container.html(formHTML);

        // Bind events
        $('.heiwa-participant-header').on('click', toggleParticipantAccordion);
        $('.heiwa-form-input[data-participant]').on('input', updateParticipantDetails);
        $('#special-requests').on('input', function() {
            bookingData.specialRequests = $(this).val();
        });
    }

    /**
     * Toggle participant accordion
     */
    function toggleParticipantAccordion(e) {
        const $content = $(e.target).closest('.heiwa-participant-item').find('.heiwa-participant-content');
        $content.toggleClass('expanded');
    }

    /**
     * Update participant details
     */
    function updateParticipantDetails(e) {
        const participantIndex = parseInt($(e.target).data('participant'));
        const field = $(e.target).data('field');
        const value = $(e.target).val();

        if (bookingData.participantDetails[participantIndex]) {
            bookingData.participantDetails[participantIndex][field] = value;
        }

        updateCTAButton();
    }

    /**
     * Render confirmation step
     */
    function renderConfirmation() {
        const $container = $('.heiwa-step-confirmation');

        const total = calculateTotal();

        const confirmationHTML = `
            <div class="heiwa-booking-summary-card">
                <h4>Booking Summary</h4>
                <div class="heiwa-summary-details">
                    <div class="heiwa-summary-row">
                        <span>Destination:</span>
                        <span>${bookingData.destination?.name || 'Not selected'}</span>
                    </div>
                    <div class="heiwa-summary-row">
                        <span>Dates:</span>
                        <span>${bookingData.dates.start} to ${bookingData.dates.end}</span>
                    </div>
                    <div class="heiwa-summary-row">
                        <span>Participants:</span>
                        <span>${bookingData.participants}</span>
                    </div>
                    <div class="heiwa-summary-row total">
                        <span>Total:</span>
                        <span>€${total}</span>
                    </div>
                </div>
            </div>
        `;

        $container.html(confirmationHTML);
    }

    /**
     * Calculate total price
     */
    function calculateTotal() {
        if (!bookingData.destination) return 0;

        const basePrice = bookingData.destination.price || 599;
        const days = bookingData.dates.start && bookingData.dates.end ?
            Math.ceil((new Date(bookingData.dates.end) - new Date(bookingData.dates.start)) / (1000 * 60 * 60 * 24)) : 7;

        return basePrice * bookingData.participants;
    }

    /**
     * Update summary in footer
     */
    function updateSummary() {
        $('[data-summary="destination"]').text(bookingData.destination?.name || 'Not selected');

        const dateText = bookingData.dates.start && bookingData.dates.end ?
            `${bookingData.dates.start} to ${bookingData.dates.end}` : 'Not selected';
        $('[data-summary="dates"]').text(dateText);

        $('[data-summary="participants"]').text(bookingData.participants);
        $('[data-summary="total"]').text(`€${calculateTotal()}`);
    }

    /**
     * Complete booking
     */
    function completeBooking() {
        const $button = $('.heiwa-cta-button');
        $button.addClass('loading').prop('disabled', true);

        // Prepare booking data for submission
        const submissionData = {
            camp_id: bookingData.destination?.id,
            start_date: bookingData.dates.start,
            end_date: bookingData.dates.end,
            participants: bookingData.participantDetails,
            special_requests: bookingData.specialRequests,
            total_price: calculateTotal()
        };

        makeAPIRequest('/wordpress/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Heiwa-API-Key': API_CONFIG.apiKey
            },
            body: JSON.stringify(submissionData)
        })
        .then(response => {
            if (response.success) {
                // Show success message
                showSuccessMessage();
            } else {
                throw new Error(response.message || 'Booking failed');
            }
        })
        .catch(error => {
            console.error('Booking error:', error);
            alert('Booking failed. Please try again.');
        })
        .finally(() => {
            $button.removeClass('loading').prop('disabled', false);
        });
    }

    /**
     * Show success message
     */
    function showSuccessMessage() {
        const $content = $('.heiwa-booking-content');
        $content.html(`
            <div class="heiwa-success-message">
                <h3>🎉 Booking Confirmed!</h3>
                <p>Your surf adventure is booked! You'll receive a confirmation email shortly.</p>
                <button class="heiwa-cta-button" onclick="location.reload()">Book Another Trip</button>
            </div>
        `);
    }



    /**
     * Load surf camps from API
     */
    function loadSurfCamps() {
        console.log('Heiwa Booking Widget: Loading surf camps...');

        // Show loading state
        if (isWidgetOpen && currentStep === 'destination') {
            const $container = $('.heiwa-step-destination');
            $container.html('<div class="heiwa-loading">Loading destinations...</div>');
        }

        makeAPIRequest('/wordpress/surf-camps')
            .then(response => {
                console.log('Heiwa Booking Widget: Surf camps API response:', response);

                if (response.success && response.data) {
                    surfCamps = response.data.surf_camps || [];
                    console.log('Heiwa Booking Widget: Loaded', surfCamps.length, 'surf camps');

                    // If we're currently on the destination step, render it
                    if (isWidgetOpen && currentStep === 'destination') {
                        renderDestinations();
                    }
                } else {
                    throw new Error(response.message || 'Failed to load surf camps');
                }
            })
            .catch(error => {
                console.error('Heiwa Booking Widget: Error loading surf camps:', error);

                // Show error state
                if (isWidgetOpen && currentStep === 'destination') {
                    const $container = $('.heiwa-step-destination');
                    $container.html(`
                        <div class="heiwa-error-state">
                            <h4>Unable to load destinations</h4>
                            <p>Please check your connection and try again.</p>
                            <button class="heiwa-retry-button" onclick="window.HeiwaBookingWidget.retryLoadSurfCamps()">Retry</button>
                        </div>
                    `);
                }
            });
    }

    // Removed duplicate displaySurfCamps function - using renderDestinations instead



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
        },
        retryLoadSurfCamps: function() {
            loadSurfCamps();
        }
    };

    // Initialize when document is ready - multiple fallbacks for WordPress compatibility
    function initializeWidget() {
        if (typeof jQuery !== 'undefined') {
            console.log('Heiwa Booking Widget: Initializing...');
            initBookingWidget();
        } else {
            console.error('Heiwa Booking Widget: jQuery not available');
        }
    }

    // Multiple initialization methods for WordPress compatibility
    if (document.readyState === 'loading') {
        // Document still loading
        $(document).ready(initializeWidget);
    } else {
        // Document already loaded
        initializeWidget();
    }

    // Fallback initialization after a short delay
    setTimeout(function() {
        if (!isWidgetOpen && $('.heiwa-booking-trigger').length > 0) {
            // Check if events are bound
            const triggerElement = $('.heiwa-booking-trigger')[0];
            if (triggerElement && !jQuery._data(triggerElement, 'events')) {
                console.log('Heiwa Booking Widget: Fallback initialization');
                initBookingWidget();
            }
        }
    }, 1000);

})(jQuery || window.jQuery);
