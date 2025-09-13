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

    // Widget state with improved state management
    let isWidgetOpen = false;
    let isToggling = false; // Prevent rapid state changes
    let toggleTimeout = null; // Debounce timeout
    let currentStep = 'booking-type';
    let selectedCamp = null;
    let availabilityData = null;
    let surfCamps = [];
    let surfWeeks = [];
    let selectedSurfWeek = null;
    let bookingType = null; // 'room' or 'surf-week'
    let renderMode = 'drawer'; // 'drawer' or 'inline'
    let inlineContainer = null; // Container element for inline mode
    let bookingData = {
        destination: null,
        bookingType: null,
        dates: { start: null, end: null },
        participants: 1,
        participantDetails: [],
        addons: [],
        specialRequests: '',
        dietaryRequirements: '',
        selectedRoom: null,
        selectedSurfWeek: null
    };

    // Currency formatter helper
    const heiwaFmt = new Intl.NumberFormat((navigator.language || 'en-US'), {
        style: 'currency',
        currency: 'EUR'
    });

    // XSS sanitization helper
    function heiwaSanitize(s) {
        const d = document.createElement('div');
        d.textContent = String(s || '');
        return d.innerHTML;
    }

    // Lucide icon helper function
    function getLucideIcon(iconName, size = 20) {
        const icons = {
            'waves': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
            'zap': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>`,
            'calendar': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
            'users': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
            'dollar-sign': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
            'party-popper': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>`,
            'bath': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path><line x1="10" y1="5" x2="8" y2="7"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="7" y1="19" x2="7" y2="21"></line><line x1="17" y1="19" x2="17" y2="21"></line></svg>`,
            'wifi': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><circle cx="12" cy="20" r="1.5"></circle></svg>`,
            'tree': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v8"></path><path d="M12 3v3"></path><path d="M18 6a6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6 6 6 0 0 1 6 6Z"></path></svg>`,
            'grid': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6"></rect><rect x="15" y="3" width="6" height="6"></rect><rect x="3" y="15" width="6" height="6"></rect><rect x="15" y="15" width="6" height="6"></rect></svg>`,
            'bed': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"></path></svg>`,
            'maximize': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>`,
            'wind': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>`,
            'home': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>`,
            'chef': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" y1="17" x2="18" y2="17"></line></svg>`,
            'check': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"></polyline></svg>`,
            'arrow-left': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>`
        };
        return icons[iconName] || '';
    }

    /**
     * Get amenity icon and label
     */
    function getAmenityIcon(amenity) {
        const amenityMap = {
            'private-bathroom': { icon: 'bath', label: 'Private Bathroom' },
            'shared-bathroom': { icon: 'users', label: 'Shared Bathroom' },
            'wooden-furniture': { icon: 'tree', label: 'Wooden Furniture' },
            'traditional-tiles': { icon: 'grid', label: 'Traditional Tiles' },
            'queen-bed': { icon: 'bed', label: 'Queen Bed' },
            'twin-beds': { icon: 'bed', label: 'Twin Beds' },
            'bunk-beds': { icon: 'bed', label: 'Bunk Beds' },
            'spacious': { icon: 'maximize', label: 'Spacious' },
            'community': { icon: 'users', label: 'Community Space' },
            'wifi': { icon: 'wifi', label: 'Wi-Fi' },
            'air-conditioning': { icon: 'wind', label: 'Air Conditioning' },
            'sea-view': { icon: 'waves', label: 'Sea View' },
            'balcony': { icon: 'home', label: 'Balcony' },
            'kitchen': { icon: 'chef', label: 'Kitchen' }
        };
        return amenityMap[amenity] || { icon: 'check', label: amenity };
    }

    /**
     * Detect render mode and set up containers
     */
    function detectRenderMode() {
        // Check for inline container
        inlineContainer = $('.heiwa-inline-booking, .heiwa-booking-inline-container').first();

        if (inlineContainer.length > 0) {
            renderMode = 'inline';
            console.log('Heiwa Booking Widget: Detected inline render mode');
        } else {
            renderMode = 'drawer';
            console.log('Heiwa Booking Widget: Using drawer render mode');
        }
    }

    /**
     * Get the appropriate container for a step based on render mode
     */
    function getStepContainer(stepId) {
        if (renderMode === 'inline') {
            // For inline mode, create/find containers within the inline container
            let $container = inlineContainer.find(`.heiwa-step-${stepId}`);
            if ($container.length === 0) {
                // Create container if it doesn't exist
                $container = $(`<div class="heiwa-step-content heiwa-step-${stepId}" data-step="${stepId}"></div>`);
                inlineContainer.append($container);
            }
            return $container;
        } else {
            // For drawer mode, use existing selectors
            return $(`.heiwa-step-${stepId}`);
        }
    }

    /**
     * Get the main booking content container
     */
    function getBookingContentContainer() {
        if (renderMode === 'inline') {
            return inlineContainer;
        } else {
            return $('.heiwa-booking-content');
        }
    }

    /**
     * Get the summary container
     */
    function getSummaryContainer() {
        if (renderMode === 'inline') {
            return inlineContainer.find('.heiwa-booking-summary');
        } else {
            return $('.heiwa-booking-summary');
        }
    }

    /**
     * Get the progress indicator container
     */
    function getProgressContainer() {
        if (renderMode === 'inline') {
            return inlineContainer.find('.heiwa-booking-progress');
        } else {
            return $('.heiwa-booking-progress');
        }
    }

    /**
     * Initialize inline container with basic structure
     */
    function initializeInlineContainer() {
        if (!inlineContainer || inlineContainer.length === 0) return;

        console.log('Heiwa Booking Widget: Initializing inline container');

        // Add the inline class for styling
        inlineContainer.addClass('heiwa-inline-booking');

        // Create basic inline structure
        const inlineStructure = `
            <div class="heiwa-booking-inline-header">
                <h2 class="heiwa-booking-inline-title">Book Your Surf Adventure</h2>
            </div>
            <div class="heiwa-booking-inline-content">
                <div class="heiwa-booking-progress"></div>
                <div class="heiwa-booking-content"></div>
                <div class="heiwa-booking-summary"></div>
            </div>
        `;

        // Only add structure if it doesn't already exist
        if (inlineContainer.find('.heiwa-booking-inline-content').length === 0) {
            inlineContainer.html(inlineStructure);
        }

        // Render initial step navigation and show first step for inline mode
        renderStepNavigation();
        showStep('booking-type');
    }

    /**
     * Setup enhanced date picker functionality
     */
    function setupDatePickers() {
        // Initialize custom date pickers for better cross-browser support
        $('.heiwa-date-picker').each(function() {
            const $input = $(this);

            // Check if browser supports modern date picker features
            if (supportsModernDatePicker()) {
                initCustomDatePicker($input);
            } else {
                // Fallback to enhanced native date picker
                initEnhancedNativeDatePicker($input);
            }
        });

        // Auto-set end date when start date is selected
        $(document).on('change', '#start-date, #room-checkin-date', function() {
            const startDate = new Date($(this).val());
            const endDateId = $(this).attr('id').includes('room') ? '#room-checkout-date' : '#end-date';
            const endDate = $(endDateId).val();

            if (!endDate || new Date(endDate) <= startDate) {
                // Auto-set end date to 7 days after start date
                const suggestedEndDate = new Date(startDate);
                suggestedEndDate.setDate(suggestedEndDate.getDate() + 7);
                const formattedDate = suggestedEndDate.toISOString().split('T')[0];

                $(endDateId).val(formattedDate);

                // Update custom date picker display if it exists
                const $customPicker = $(endDateId).next('.heiwa-custom-date-picker');
                if ($customPicker.length) {
                    $customPicker.find('.heiwa-date-text')
                        .text(formatDateForDisplay(formattedDate))
                        .removeClass('placeholder');
                }

                updateDates();
            }
        });
    }

    /**
     * Check if browser supports modern date picker features
     */
    function supportsModernDatePicker() {
        // Check for modern browser features needed for custom date picker
        return typeof document.querySelector !== 'undefined' &&
               typeof addEventListener !== 'undefined' &&
               !/(MSIE|Trident)/.test(navigator.userAgent);
    }

    /**
     * Initialize custom date picker for modern browsers
     */
    function initCustomDatePicker($input) {
        const inputId = $input.attr('id');
        const placeholder = $input.attr('placeholder') || 'Select date';
        const minDate = $input.attr('min') || null;
        const currentValue = $input.val();

        // Create custom date picker wrapper
        const customPickerHTML = `
            <div class="heiwa-custom-date-picker" data-input-id="${inputId}">
                <div class="heiwa-date-input-wrapper">
                    <div class="heiwa-date-display" data-placeholder="${placeholder}">
                        <span class="heiwa-date-text ${currentValue ? '' : 'placeholder'}">
                            ${currentValue ? formatDateForDisplay(currentValue) : placeholder}
                        </span>
                        ${getLucideIcon('calendar', 20)}
                    </div>
                    <div class="heiwa-calendar-dropdown">
                        <div class="heiwa-calendar-header">
                            <button type="button" class="heiwa-calendar-nav-btn" data-nav="prev">
                                ${getLucideIcon('arrow-left', 16)}
                            </button>
                            <span class="heiwa-calendar-month-year"></span>
                            <button type="button" class="heiwa-calendar-nav-btn" data-nav="next">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </button>
                        </div>
                        <div class="heiwa-calendar-grid">
                            <div class="heiwa-calendar-weekdays">
                                <div class="heiwa-calendar-weekday">Sun</div>
                                <div class="heiwa-calendar-weekday">Mon</div>
                                <div class="heiwa-calendar-weekday">Tue</div>
                                <div class="heiwa-calendar-weekday">Wed</div>
                                <div class="heiwa-calendar-weekday">Thu</div>
                                <div class="heiwa-calendar-weekday">Fri</div>
                                <div class="heiwa-calendar-weekday">Sat</div>
                            </div>
                            <div class="heiwa-calendar-days"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Replace the original input with custom picker
        $input.after(customPickerHTML);
        $input.hide();

        const $customPicker = $input.next('.heiwa-custom-date-picker');

        // Initialize calendar state
        let currentDate = new Date();
        let selectedDate = currentValue ? new Date(currentValue + 'T00:00:00') : null;

        // Bind events
        bindCustomDatePickerEvents($input, $customPicker, {
            currentDate,
            selectedDate,
            minDate: minDate ? new Date(minDate + 'T00:00:00') : null
        });

        // Initial render
        renderCalendar($customPicker, currentDate, selectedDate, minDate ? new Date(minDate + 'T00:00:00') : null);
    }

    /**
     * Initialize enhanced native date picker for older browsers
     */
    function initEnhancedNativeDatePicker($input) {
        $input.addClass('heiwa-date-picker-native');

        // Enhanced native functionality
        $input.on('click focus', function() {
            if (this.showPicker) {
                try {
                    this.showPicker();
                } catch (e) {
                    console.log('showPicker not supported, using native behavior');
                }
            }
        });

        $input.on('keydown', function(e) {
            // Allow tab, escape, enter, and delete keys
            if ([9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            // Prevent all other key input to force calendar usage
            e.preventDefault();
        });

        $input.removeAttr('title');
    }

    /**
     * Bind events for custom date picker
     */
    function bindCustomDatePickerEvents($input, $customPicker, state) {
        const $dateDisplay = $customPicker.find('.heiwa-date-display');
        const $dropdown = $customPicker.find('.heiwa-calendar-dropdown');
        const $dateText = $customPicker.find('.heiwa-date-text');

        // Toggle dropdown
        $dateDisplay.on('click', function(e) {
            e.stopPropagation();
            const isActive = $dropdown.hasClass('active');

            // Close all other dropdowns
            $('.heiwa-calendar-dropdown').removeClass('active');
            $('.heiwa-date-display').removeClass('active');

            if (!isActive) {
                $dropdown.addClass('active');
                $dateDisplay.addClass('active');
            }
        });

        // Navigation buttons
        $customPicker.on('click', '.heiwa-calendar-nav-btn', function(e) {
            e.stopPropagation();
            const direction = $(this).data('nav');

            if (direction === 'prev') {
                state.currentDate.setMonth(state.currentDate.getMonth() - 1);
            } else {
                state.currentDate.setMonth(state.currentDate.getMonth() + 1);
            }

            renderCalendar($customPicker, state.currentDate, state.selectedDate, state.minDate);
        });

        // Day selection
        $customPicker.on('click', '.heiwa-calendar-day:not(.disabled)', function(e) {
            e.stopPropagation();
            const dayElement = $(this);
            const day = parseInt(dayElement.find('span').text());
            const isOtherMonth = dayElement.hasClass('other-month');

            // Handle other month days
            if (isOtherMonth) {
                const direction = day > 15 ? -1 : 1;
                state.currentDate.setMonth(state.currentDate.getMonth() + direction);
            }

            // Set selected date
            state.selectedDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), day);

            // Update input value
            const formattedDate = formatDateForInput(state.selectedDate);
            $input.val(formattedDate);

            // Update display
            $dateText.text(formatDateForDisplay(formattedDate)).removeClass('placeholder');

            // Update booking data
            updateDateInBookingData($input.attr('id'), formattedDate);

            // Close dropdown
            $dropdown.removeClass('active');
            $dateDisplay.removeClass('active');

            // Re-render calendar to show selection
            renderCalendar($customPicker, state.currentDate, state.selectedDate, state.minDate);

            // Trigger change event
            $input.trigger('change');
        });

        // Close dropdown when clicking outside
        $(document).on('click', function(e) {
            if (!$customPicker.is(e.target) && !$customPicker.has(e.target).length) {
                $dropdown.removeClass('active');
                $dateDisplay.removeClass('active');
            }
        });
    }

    /**
     * Render calendar for custom date picker
     */
    function renderCalendar($customPicker, currentDate, selectedDate, minDate) {
        const $monthYear = $customPicker.find('.heiwa-calendar-month-year');
        const $daysContainer = $customPicker.find('.heiwa-calendar-days');

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Update month/year display
        $monthYear.text(`${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`);

        // Generate calendar days
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let daysHTML = '';
        const totalDays = 42; // 6 weeks

        for (let i = 0; i < totalDays; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.getTime() === today.getTime();
            const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
            const isDisabled = minDate && date < minDate;

            let classes = ['heiwa-calendar-day'];
            if (!isCurrentMonth) classes.push('other-month');
            if (isToday) classes.push('today');
            if (isSelected) classes.push('selected');
            if (isDisabled) classes.push('disabled');

            daysHTML += `
                <button type="button" class="${classes.join(' ')}" data-date="${date.toISOString().split('T')[0]}">
                    <span>${date.getDate()}</span>
                </button>
            `;
        }

        $daysContainer.html(daysHTML);
    }

    /**
     * Format date for display (e.g., "March 15, 2024")
     */
    function formatDateForDisplay(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString + 'T00:00:00');
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    /**
     * Format date for input (YYYY-MM-DD)
     */
    function formatDateForInput(date) {
        if (!date) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    /**
     * Update booking data when date changes
     */
    function updateDateInBookingData(inputId, dateValue) {
        if (inputId === 'start-date' || inputId === 'room-checkin-date') {
            bookingData.dates.start = dateValue;
        } else if (inputId === 'end-date' || inputId === 'room-checkout-date') {
            bookingData.dates.end = dateValue;
        }

        updateStepProgress();
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

    // Step configuration - MAJOR UX OVERHAUL: Dynamic step filtering for simplified flows
    const ALL_STEPS = [
        { id: 'booking-type', title: 'Choose Booking Type', label: 'Type', flows: ['room', 'surf-week'] },
        { id: 'surf-weeks', title: 'Available Surf Weeks', label: 'Surf Weeks', flows: ['surf-week'] },
        { id: 'assignment', title: 'Assign Rooms & Beds', label: 'Assignment', flows: ['surf-week'], requiresMultiple: true },
        { id: 'room-calendar', title: 'Select Dates & Room', label: 'Check-in', flows: ['room'] },
        { id: 'room-selection', title: 'Choose Your Room', label: 'Room', flows: ['room'] },
        { id: 'dates_participants', title: 'Select Dates & Participants', label: 'Travelers', flows: ['surf-week'] },
        { id: 'form_addons', title: 'Your Details & Add-ons', label: 'Details', flows: ['room', 'surf-week'] },
        { id: 'confirmation', title: 'Review & Confirm', label: 'Confirm', flows: ['room', 'surf-week'] }
    ];

    /**
     * Get filtered steps based on current booking context
     * Implements dynamic step navigation for simplified UX
     */
    function getActiveSteps() {
        const currentFlow = bookingData.bookingType || 'room';
        const participantCount = bookingData.participants || 1;

        return ALL_STEPS.filter(step => {
            // Must be part of current flow
            if (!step.flows.includes(currentFlow)) return false;

            // Skip assignment step for single participants in surf-week flow
            if (step.id === 'assignment' && currentFlow === 'surf-week' && participantCount === 1) {
                return false;
            }

            // Skip room-selection step for single participants in room flow
            if (step.id === 'room-selection' && currentFlow === 'room' && participantCount === 1) {
                return false;
            }

            return true;
        });
    }

    // Legacy compatibility - use dynamic steps
    function getSTEPS() {
        return getActiveSteps();
    }

    // API configuration - lazy loaded to avoid initialization errors
    function getAPIConfig() {
        if (typeof window.heiwa_booking_ajax !== 'undefined') {
            return {
                restBase: window.heiwa_booking_ajax.rest_base || '/wp-json/heiwa/v1',
                nonce: window.heiwa_booking_ajax.nonce || '',
                buildId: window.heiwa_booking_ajax.build_id || 'dev'
            };
        }
        // Fallback configuration
        return {
            restBase: '/wp-json/heiwa/v1',
            nonce: '',
            buildId: 'dev'
        };
    }

    /**
     * Ensure the widget stylesheets are loaded (modular CSS architecture)
     * Loads all four layers in dependency order: base, components, layout, utilities
     */
    function ensureWidgetStylesLoaded() {
        try {
            // If all modular CSS are already present, skip
            const requiredFiles = ['base.css','components.css','layout.css','utilities.css'];
            const allPresent = requiredFiles.every(f => document.querySelector(`link[rel="stylesheet"][href*="heiwa-booking-widget/assets/css/${f}"]`));
            if (allPresent) {
                console.log('Heiwa Booking Widget: Modular CSS already present');
                return;
            }

            // Derive base path and version param from the script tag that loaded this file
            const scriptEl = Array.from(document.scripts || []).find(s => s.src && s.src.includes('heiwa-booking-widget/assets/js/widget.js'));
            const defaultBase = '/wordpress-plugin/heiwa-booking-widget/assets/css/';
            let basePath = defaultBase;
            let versionParam = '';
            if (scriptEl && scriptEl.src) {
                const src = scriptEl.src;
                basePath = src.replace(/assets\/js\/widget\.js(?:\?.*)?$/, 'assets/css/');
                const vMatch = src.match(/[?&]v=([0-9\-]+)/);
                versionParam = vMatch ? (`?v=${vMatch[1]}`) : '';
            }

            const hrefs = requiredFiles.map(f => `${basePath}${f}${versionParam}`);

            // Helper to append a stylesheet and resolve when loaded
            const loadStylesheet = (href) => new Promise((resolve, reject) => {
                // Avoid duplicate if exact href already present
                if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return resolve();
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.setAttribute('data-heiwa-style', href.split('/').pop());
                link.onload = () => resolve();
                link.onerror = (e) => reject(new Error(`Failed to load ${href}`));
                document.head.appendChild(link);
            });

            // Load sequentially to preserve cascade order
            hrefs.reduce((p, href) => p.then(() => loadStylesheet(href)), Promise.resolve())
                .then(() => {
                    console.log('Heiwa Booking Widget: Modular CSS loaded successfully', hrefs);
                })
                .catch((err) => {
                    console.warn('Heiwa Booking Widget: One or more CSS files failed to load', err);
                });
        } catch (e) {
            console.warn('Heiwa Booking Widget: ensureWidgetStylesLoaded error', e);
        }
    }

    /**
     * Analytics tracking for UX validation
     */
    function trackEvent(eventName, data = {}) {
        try {
            // Send to analytics service (Google Analytics, etc.)
            if (window.gtag) {
                window.gtag('event', eventName, {
                    event_category: 'heiwa_booking_widget',
                    ...data
                });
            }

            // Log for development
            console.log('Heiwa Widget Analytics:', eventName, data);

            // Store in localStorage for development analysis
            const events = JSON.parse(localStorage.getItem('heiwa_widget_events') || '[]');
            events.push({
                timestamp: new Date().toISOString(),
                event: eventName,
                data: data
            });

            // Keep only last 100 events
            if (events.length > 100) {
                events.shift();
            }

            localStorage.setItem('heiwa_widget_events', JSON.stringify(events));
        } catch (e) {
            console.warn('Analytics tracking failed:', e);
        }
    }

    /**
     * Error handling and resilience
     */
    function handleError(error, context = '') {
        console.error('Heiwa Widget Error:', error, context);

        // Track error for analytics
        trackEvent('error_occurred', {
            error_message: error.message || error,
            context: context,
            user_agent: navigator.userAgent,
            url: window.location.href
        });

        // Show user-friendly error message
        showErrorMessage('Something went wrong. Please try again or contact support.');

        // Attempt recovery if possible
        if (context === 'api_failure') {
            // Retry logic could go here
        }
    }

    /**
     * Show error message to user
     */
    function showErrorMessage(message) {
        const $container = $('.heiwa-step-content.active');
        if ($container.length === 0) return;

        // Remove any existing error messages
        $container.find('.heiwa-error-state').remove();

        const errorHTML = `
            <div class="heiwa-error-state" role="alert" aria-live="assertive">
                ${message}
            </div>
        `;

        $container.prepend(errorHTML);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            $container.find('.heiwa-error-state').fadeOut(() => {
                $(this).remove();
            });
        }, 5000);
    }

    /**
     * Initialize the booking widget
     */
    function initBookingWidget() {
        // Ensure styles are present before rendering
        ensureWidgetStylesLoaded();

    // Detect render mode (drawer vs inline)
    detectRenderMode();

    // Track widget initialization
    trackEvent('widget_initialized', {
        render_mode: $('.heiwa-booking-drawer').length > 0 ? 'drawer' : 'inline',
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        touch_support: 'ontouchstart' in window
    });

    // Track scroll behavior on mobile
    let scrollTimeout;
    $(window).on('scroll', function() {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollTop = $(window).scrollTop();
            const widgetVisible = $('.heiwa-booking-widget').is(':visible');

            if (widgetVisible) {
                trackEvent('widget_scroll_interaction', {
                    scroll_position: scrollTop,
                    viewport_height: window.innerHeight,
                    widget_in_view: isElementInViewport($('.heiwa-booking-widget')[0]),
                    is_mobile: window.innerWidth < 768
                });
            }
        }, 500);
    });

    // Helper function to check if element is in viewport
    function isElementInViewport(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

        // Bind event handlers
        bindEvents();

        // Initialize modal state
        resetWidget();

        // Load initial data (but don't show it until modal opens)
        loadSurfCamps();

        // If inline mode, initialize the inline container immediately
        if (renderMode === 'inline') {
            initializeInlineContainer();
        }

        // Initialize date pickers after a short delay to ensure DOM is ready
        setTimeout(function() {
            setupDatePickers();
        }, 100);
    }

    /**
     * Make API request to backend
     */
    function makeAPIRequest(endpoint, options = {}) {
        const apiConfig = getAPIConfig();
        const url = `${apiConfig.restBase}${endpoint}`;
        console.log('Heiwa Booking Widget: Making REST API request', { endpoint, url, apiConfig });

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': apiConfig.nonce
            }
        };

        const finalOptions = { ...defaultOptions, ...options };
        console.log('Heiwa Booking Widget: Request options:', finalOptions);

        return fetch(url, finalOptions)
            .then(response => {
                console.log('Heiwa Booking Widget: API response received:', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                    url: response.url,
                    headers: Object.fromEntries(response.headers.entries())
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Heiwa Booking Widget: API response data parsed:', {
                    data: data,
                    type: typeof data,
                    keys: Object.keys(data || {}),
                    success: data?.success,
                    hasData: !!data?.data
                });
                return data;
            })
            .catch(error => {
                console.error('Heiwa Booking Widget: API request failed:', {
                    error: error,
                    message: error.message,
                    stack: error.stack,
                    url: url,
                    options: finalOptions
                });
                throw error;
            });
    }

    /**
     * Show loading skeleton
     */
    function showSkeleton($container, type = 'default') {
        let skeletonHTML = '';

        if (type === 'surf-weeks') {
            skeletonHTML = `
                <div class="heiwa-skeleton-card">
                    <div class="heiwa-skeleton heiwa-skeleton-title"></div>
                    <div class="heiwa-skeleton heiwa-skeleton-text"></div>
                    <div class="heiwa-skeleton heiwa-skeleton-text" style="width: 80%;"></div>
                    <div class="heiwa-skeleton" style="height: 40px; width: 120px; margin-top: 12px;"></div>
                </div>
                <div class="heiwa-skeleton-card">
                    <div class="heiwa-skeleton heiwa-skeleton-title"></div>
                    <div class="heiwa-skeleton heiwa-skeleton-text"></div>
                    <div class="heiwa-skeleton heiwa-skeleton-text" style="width: 80%;"></div>
                    <div class="heiwa-skeleton" style="height: 40px; width: 120px; margin-top: 12px;"></div>
                </div>
                <div class="heiwa-skeleton-card">
                    <div class="heiwa-skeleton heiwa-skeleton-title"></div>
                    <div class="heiwa-skeleton heiwa-skeleton-text"></div>
                    <div class="heiwa-skeleton heiwa-skeleton-text" style="width: 80%;"></div>
                    <div class="heiwa-skeleton" style="height: 40px; width: 120px; margin-top: 12px;"></div>
                </div>
            `;
        } else {
            skeletonHTML = `
                <div class="heiwa-skeleton heiwa-skeleton-title"></div>
                <div class="heiwa-skeleton heiwa-skeleton-text"></div>
                <div class="heiwa-skeleton heiwa-skeleton-text" style="width: 80%;"></div>
                <div class="heiwa-skeleton" style="height: 40px; width: 120px; margin-top: 12px;"></div>
            `;
        }

        $container.html(`<div class="heiwa-loading-skeleton">${skeletonHTML}</div>`);
    }

    /**
     * Bind event handlers
     */
    function bindEvents() {
        console.log('Heiwa Booking Widget: Binding events...');

        // Widget toggle - use the correct class names from shortcode
        $(document).on('click', '.heiwa-booking-trigger', toggleWidget);


        // Site-wide open hooks: allow any element to open the widget safely
        $(document).on('click', '[data-heiwa-open], .heiwa-open-booking', function(e) {
            e.preventDefault();
            var $trigger = $('.heiwa-booking-trigger').first();
            if ($trigger.length) { $trigger.trigger('click'); }
        });

        // Delegated event handlers for data-action attributes
        $(document).on('click', '[data-action="heiwa-back"]', function(e) {
            e.preventDefault();
            goToPreviousStep();
        });

        $(document).on('click', '[data-action="heiwa-close"]', function(e) {
            e.preventDefault();
            closeWidget();
        });

        $(document).on('click', '[data-action="heiwa-retry"]', function(e) {
            e.preventDefault();
            retryLoadSurfWeeks();
        });

        // Accessibility: Keyboard navigation for stepper
        $(document).on('keydown', '.heiwa-booking-step', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const stepId = $(this).data('step');
                const activeSteps = getActiveSteps();
                if (stepId && activeSteps.find(s => s.id === stepId)) {
                    showStep(stepId);
                }
            }
        });

        // Focus trap for drawer
        $(document).on('keydown', function(e) {
            if (!isWidgetOpen) return;

            if (e.key === 'Escape') {
                closeWidget();
                return;
            }

            // Focus trap
            const $drawer = $('.heiwa-booking-drawer');
            const $focusable = $drawer.find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const $firstFocusable = $focusable.first();
            const $lastFocusable = $focusable.last();

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === $firstFocusable[0]) {
                        $lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === $lastFocusable[0]) {
                        $firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });

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
     * Toggle widget visibility with improved state management
     * Implements TI-003 fix: Prevent rapid state changes and animation glitches
     */
    function toggleWidget(e) {
        if (e) {
            e.preventDefault();
        }

        // Prevent rapid toggling
        if (isToggling) {
            console.log('Heiwa Booking Widget: Toggle ignored - already toggling');
            return;
        }

        // Clear any existing timeout
        if (toggleTimeout) {
            clearTimeout(toggleTimeout);
        }

        console.log('Heiwa Booking Widget: Toggle widget called, isOpen:', isWidgetOpen);

        // Set toggling state
        isToggling = true;

        // Validate current state against DOM
        const backdropExists = $('.heiwa-booking-backdrop').length > 0;
        const backdropActive = $('.heiwa-booking-backdrop').hasClass('active');

        // Sync state if inconsistent
        if (isWidgetOpen !== backdropActive) {
            console.warn('Heiwa Booking Widget: State inconsistency detected, syncing...', {
                isWidgetOpen,
                backdropActive
            });
            isWidgetOpen = backdropActive;
        }

        // Perform toggle
        if (isWidgetOpen) {
            closeWidget();
        } else {
            openWidget();
        }

        // Reset toggling state after animation completes
        toggleTimeout = setTimeout(() => {
            isToggling = false;
            toggleTimeout = null;
        }, 350); // Slightly longer than CSS transition (300ms)
    }

    /**
     * Open the widget with improved state management
     */
    function openWidget() {
        console.log('Heiwa Booking Widget: Opening widget...');

        // Prevent opening if already open
        if (isWidgetOpen) {
            console.log('Heiwa Booking Widget: Widget already open, ignoring');
            return;
        }

        // Create sidebar if it doesn't exist
        if (!$('.heiwa-booking-backdrop').length) {
            createSidebarBooking();
        }

        // Apply classes with proper timing
        const $backdrop = $('.heiwa-booking-backdrop');
        const $drawer = $('.heiwa-booking-drawer');

        if ($backdrop.length && $drawer.length) {
            $backdrop.addClass('active');
            $drawer.addClass('active');
            isWidgetOpen = true;

            // Render initial step navigation
            renderStepNavigation();

            // Show the first step (booking type selector)
            showStep('booking-type');

            // Update progress indicator
            updateProgressIndicator();

            // Prevent body scroll
            $('body').addClass('heiwa-modal-open');

            // Hide the BOOK NOW button when widget is open
            $('.heiwa-booking-trigger').addClass('heiwa-hidden');

            console.log('Heiwa Booking Widget: Widget opened successfully');
        } else {
            console.error('Heiwa Booking Widget: Failed to find widget elements');
        }
    }

    /**
     * Close the widget with improved state management
     */
    function closeWidget() {
        console.log('Heiwa Booking Widget: Closing widget...');

        // Prevent closing if already closed
        if (!isWidgetOpen) {
            console.log('Heiwa Booking Widget: Widget already closed, ignoring');
            return;
        }

        const $backdrop = $('.heiwa-booking-backdrop');
        const $drawer = $('.heiwa-booking-drawer');

        if ($backdrop.length && $drawer.length) {
            $backdrop.removeClass('active');
            $drawer.removeClass('active');
            isWidgetOpen = false;

            // Re-enable body scroll
            $('body').removeClass('heiwa-modal-open');

            // Show the BOOK NOW button when widget is closed
            $('.heiwa-booking-trigger').removeClass('heiwa-hidden');

            console.log('Heiwa Booking Widget: Widget closed successfully');
        } else {
            // Force state sync even if elements don't exist
            isWidgetOpen = false;
            $('body').removeClass('heiwa-modal-open');
            console.warn('Heiwa Booking Widget: Widget elements not found, forced state sync');
        }
    }

    /**
     * Create the sidebar booking structure
     */
    function createSidebarBooking() {
        const sidebarHTML = `
            <div class="heiwa-booking-widget">
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
                        <div class="heiwa-booking-stepper" id="heiwa-dynamic-stepper">
                            <!-- Dynamic steps will be rendered here -->
                        </div>
                    </div>

                    <div class="heiwa-booking-content">
                        ${ALL_STEPS.map(step => `
                            <div class="heiwa-booking-step-content" data-step="${step.id}">
                                <div class="heiwa-step-${step.id}"></div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="heiwa-booking-summary compact">
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
                            <span class="heiwa-summary-total-value" data-summary="total">${heiwaFmt.format(0)}</span>
                        </div>
                        <button class="heiwa-cta-button" data-action="next-step">Continue</button>
                    </div>
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
        console.log('Heiwa Booking Widget: showStep called with stepId:', stepId);
        console.log('Heiwa Booking Widget: Current availabilityData before step change:', availabilityData);

        currentStep = stepId;

        // Hide all step content
        $('.heiwa-booking-step-content').removeClass('active');

        // Show current step content
        $(`.heiwa-booking-step-content[data-step="${stepId}"]`).addClass('active');

        // Show/hide summary cart based on step
        if (stepId === 'booking-type') {
            $('.heiwa-booking-summary').hide();
        } else {
            $('.heiwa-booking-summary').show();
        }

        // Update progress indicator
        updateProgressIndicator();

        // Update modal header based on booking type
        updateModalHeader();

        // Update CTA button
        updateCTAButton();
        // Update step summaries (accordion for completed steps)
        updateStepSummaries();
        // Render step content
        renderStepContent(stepId);

        console.log('Heiwa Booking Widget: showStep completed for stepId:', stepId);
    }

    /**
     * Render dynamic step navigation based on current booking context
     * MAJOR UX IMPROVEMENT: Shows only relevant steps for current flow
     */
    function renderStepNavigation() {
        const activeSteps = getActiveSteps();
        const $stepper = $('#heiwa-dynamic-stepper');

        const stepperHTML = activeSteps.map((step, index) => `
            <div class="heiwa-booking-step ${index === 0 ? 'current' : 'upcoming'}" data-step="${step.id}">
                <div class="heiwa-booking-step-number" role="status" aria-label="Step ${index + 1}">${index + 1}</div>
                <div class="heiwa-booking-step-label">${step.label}</div>
            </div>
        `).join('');

        $stepper.html(stepperHTML);
        console.log(`Heiwa Booking Widget: Rendered ${activeSteps.length} steps for ${bookingData.bookingType || 'unknown'} flow`);
    }

    /**
     * Update progress indicator based on current step
     * Updated to work with dynamic step navigation
     */
    function updateProgressIndicator() {
        const activeSteps = getActiveSteps();
        const currentIndex = activeSteps.findIndex(step => step.id === currentStep);

        activeSteps.forEach((step, index) => {
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
     * Updated to work with dynamic step navigation
     */
    function updateCTAButton() {
        const $button = $('.heiwa-cta-button');
        const activeSteps = getActiveSteps();
        const stepIndex = activeSteps.findIndex(step => step.id === currentStep);

        if (stepIndex === activeSteps.length - 1) {
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
     * Updated to work with dynamic step navigation - logic simplified since steps are pre-filtered
     */
    function goToNextStep() {
        const activeSteps = getActiveSteps();
        const currentIndex = activeSteps.findIndex(step => step.id === currentStep);

        if (currentIndex < activeSteps.length - 1) {
            const nextStep = activeSteps[currentIndex + 1];
            showStep(nextStep.id);
        }
    }

    /**
     * Go to previous step
     * Updated to work with dynamic step navigation
     */
    function goToPreviousStep() {
        const activeSteps = getActiveSteps();
        const currentIndex = activeSteps.findIndex(step => step.id === currentStep);

        if (currentIndex > 0) {
            const previousStep = activeSteps[currentIndex - 1];
            showStep(previousStep.id);
        }
    }

    /**
     * Validate current step
     */
    function validateCurrentStep() {
        switch (currentStep) {
            case 'booking-type':
                return bookingData.bookingType !== null;
            case 'surf-weeks':
                return bookingData.selectedSurfWeek !== null;
            case 'assignment':
                // Assignment step is valid when all participants are assigned
                // For single participants, this is handled automatically
                if (bookingData.participants === 1) {
                    return true; // Single participants skip this step
                }
                const totalAssigned = bookingData.assignment?.assignments?.reduce((sum, a) => sum + a.participants, 0) || 0;
                return totalAssigned >= bookingData.participants;
            case 'room-calendar':
                return bookingData.dates.start && bookingData.dates.end;
            case 'room-selection':
                return bookingData.selectedRoom !== null;
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
            case 'booking-type':
                renderBookingTypeSelector();
                break;
            case 'surf-weeks':
                renderSurfWeekList();
                break;
            case 'assignment':
                renderAssignment();
                break;
            case 'room-calendar':
                renderRoomCalendar();
                break;
            case 'room-selection':
                renderRoomSelection();
                break;
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
     * Render booking type selector
     */
    function renderBookingTypeSelector() {
        const $container = getStepContainer('booking-type');

        const bookingTypeHTML = `
            <div class="heiwa-booking-type-selector">
                <div class="heiwa-booking-type-options" role="radiogroup" aria-label="Select booking type">
                    <!-- ROOM BOOKING CARD -->
                    <div class="heiwa-booking-option-card"
                         data-booking-type="room"
                         role="radio"
                         aria-label="Book a room - Choose your dates and accommodation"
                         aria-checked="${bookingData.bookingType === 'room' ? 'true' : 'false'}"
                         tabindex="${bookingData.bookingType === 'room' ? '0' : '-1'}">
                        <div class="heiwa-booking-option-content">
                            <div class="heiwa-booking-option-header">
                                <div class="heiwa-booking-option-title">Flexible Room Stays</div>
                                <div class="heiwa-booking-option-subtitle">Choose your own adventure</div>
                            </div>
                            <div class="heiwa-booking-option-footer">
                                <div class="heiwa-booking-option-description">Book accommodation only and create your own schedule with optional add-ons</div>
                                <button class="heiwa-booking-option-cta" type="button">
                                    Explore Rooms ${getLucideIcon('arrow-right', 16)}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- SURF WEEK BOOKING CARD -->
                    <div class="heiwa-booking-option-card"
                         data-booking-type="surf-week"
                         role="radio"
                         aria-label="Book a surf week - Choose your dates and surf lessons"
                         aria-checked="${bookingData.bookingType === 'surf-week' ? 'true' : 'false'}"
                         tabindex="${bookingData.bookingType === 'surf-week' ? '0' : '-1'}">
                        <div class="heiwa-booking-option-content">
                            <div class="heiwa-booking-option-header">
                                <div class="heiwa-booking-option-title">All-Inclusive Surf Weeks</div>
                                <div class="heiwa-booking-option-subtitle">Complete surf camp experience</div>
                            </div>
                            <div class="heiwa-booking-option-footer">
                                <div class="heiwa-booking-option-description">Join our structured programs with accommodation, meals, and professional surf instruction</div>
                                <button class="heiwa-booking-option-cta" type="button">
                                    Explore Surf Weeks ${getLucideIcon('waves', 16)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $container.html(bookingTypeHTML);

        // Bind click and keyboard events
        $('.heiwa-booking-option-card, .heiwa-booking-option-cta').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const $card = $(this).closest('.heiwa-booking-option-card');
            const bookingType = $card.data('booking-type');

            // Track booking type selection
            trackEvent('booking_type_selected', {
                booking_type: bookingType,
                step: 'type_selection',
                interaction: 'click'
            });

            selectBookingType(bookingType);
        });

        // Add keyboard navigation support
        $('.heiwa-booking-option-card').on('keydown', function(e) {
            const $current = $(this);
            const $options = $('.heiwa-booking-option-card');
            const currentIndex = $options.index($current);

            // Track keyboard navigation
            if (e.key === 'Enter' || e.key === ' ') {
                const bookingType = $current.data('booking-type');
                trackEvent('booking_type_selected', {
                    booking_type: bookingType,
                    step: 'type_selection',
                    interaction: 'keyboard'
                });
            }

            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % $options.length;
                    $options.eq(nextIndex).focus();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex === 0 ? $options.length - 1 : currentIndex - 1;
                    $options.eq(prevIndex).focus();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    const bookingType = $current.data('booking-type');
                    selectBookingType(bookingType);
                    break;
            }
        });
    }

    /**
     * Clear state when switching booking types to prevent cross-contamination
     */
    function resetStateForBookingType(type) {
        console.log('Heiwa Booking Widget: resetStateForBookingType called with type:', type);

        if (type === 'room') {
            // Clear surf week specific data
            bookingData.selectedSurfWeek = null;
            selectedSurfWeek = null;
            bookingData.assignment = null;
        } else if (type === 'surf-week') {
            // Clear room specific data
            bookingData.selectedRoom = null;
            bookingData.dates = { start: null, end: null };
            availabilityData = null;
        }

        // Clear shared state that should reset on type change
        bookingData.addons = [];
        bookingData.specialRequests = '';
        bookingData.participantDetails = [];

        // Update summary to reflect cleared state
        updateSummary();
    }

    /**
     * Update modal header based on current booking type
     */
    function updateModalHeader() {
        const type = bookingData.bookingType;
        const $header = $('.heiwa-booking-drawer-title');

        if (type === 'room') {
            $header.text('Book Your Room');
        } else if (type === 'surf-week') {
            $header.text('Book Your Surf Adventure');
        } else {
            $header.text('Book Your Surf Adventure');
        }
    }

    /**
     * Select booking type and navigate to appropriate flow
     */
    function selectBookingType(type) {
        console.log('Heiwa Booking Widget: selectBookingType called with type:', type);
        bookingData.bookingType = type;
        bookingType = type;

        // Re-render step navigation for the new booking type
        renderStepNavigation();

        // Clear state for the new booking type
        try {
            console.log('Heiwa Booking Widget: About to call resetStateForBookingType');
            resetStateForBookingType(type);
            console.log('Heiwa Booking Widget: resetStateForBookingType completed');
        } catch (error) {
            console.error('Heiwa Booking Widget: Error in resetStateForBookingType:', error);
        }

        // Update modal header
        try {
            console.log('Heiwa Booking Widget: About to call updateModalHeader');
            updateModalHeader();
            console.log('Heiwa Booking Widget: updateModalHeader completed');
        } catch (error) {
            console.error('Heiwa Booking Widget: Error in updateModalHeader:', error);
        }

        // Update ARIA attributes and visual feedback
        $('.heiwa-booking-option-card').each(function() {
            const $card = $(this);
            const cardType = $card.data('booking-type');

            if (cardType === type) {
                $card.addClass('selected')
                     .attr('aria-checked', 'true')
                     .attr('tabindex', '0');
            } else {
                $card.removeClass('selected')
                     .attr('aria-checked', 'false')
                     .attr('tabindex', '-1');
            }
        });

        // Navigate to appropriate next step
        if (type === 'room') {
            console.log('Heiwa Booking Widget: Navigating to room-calendar step');
            setTimeout(() => showStep('room-calendar'), 300);
        } else if (type === 'surf-week') {
            console.log('Heiwa Booking Widget: Navigating to surf-weeks step');
            // Load surf weeks and then show the list
            loadSurfWeeks().then(() => {
                setTimeout(() => showStep('surf-weeks'), 300);
            });
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
                        <img src="${camp.media?.featured_image || camp.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDM5NEQ5O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAyNTFBMztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0idXJsKCNncmFkKSIvPjx0ZXh0IHg9IjE1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNVUkY8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZjNmNGY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DQU1QPC90ZXh0Pjwvc3ZnPg=='}"
                             alt="${camp.name}"
                             class="heiwa-destination-card-image"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMyNTYzZWIiLz48dGV4dCB4PSIxNTAiIHk9IjY1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNVUkYgQ0FNUDU8L3RleHQ+PC9zdmc+'">
                        <div class="heiwa-destination-card-content">
                            <h4 class="heiwa-destination-card-title">
                                ${getLucideIcon('waves', 18)} ${camp.name}
                            </h4>
                            <p class="heiwa-destination-card-description">
                                ${heiwaSanitize(camp.description) || 'Amazing surf experience awaits!'}
                            </p>
                            <div class="heiwa-destination-card-footer">
                                <span class="heiwa-destination-card-price">${camp.pricing?.display_price || heiwaFmt.format(camp.price || 599)}</span>
                                <span class="heiwa-destination-card-level">${camp.details?.skill_level || camp.level || 'All Levels'}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="heiwa-express-booking">
                ${getLucideIcon('zap', 18)} Quick Book: Most Popular Camp
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

        // Track stepper interaction
        trackEvent('stepper_interaction', {
            step_number: stepNumber,
            step_name: STEPS[stepNumber - 1]?.label || 'unknown',
            action: 'navigation',
            total_steps: STEPS.length
        });

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
            <div class="heiwa-step-header">
                <button class="heiwa-back-button" data-action="heiwa-back">
                    ${getLucideIcon('arrow-left', 16)} Back
                </button>
                <h3 class="heiwa-booking-step-title">Select Dates & Participants</h3>
            </div>
            <div class="heiwa-form-group">
                <label class="heiwa-form-label">Start Date</label>
                <input type="date" class="heiwa-form-input heiwa-date-picker" id="start-date"
                       value="${bookingData.dates.start || ''}"
                       min="${new Date().toISOString().split('T')[0]}"
                       autocomplete="off">
            </div>
            <div class="heiwa-form-group">
                <label class="heiwa-form-label">End Date</label>
                <input type="date" class="heiwa-form-input heiwa-date-picker" id="end-date"
                       value="${bookingData.dates.end || ''}"
                       min="${new Date().toISOString().split('T')[0]}"
                       autocomplete="off">
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

        // Enhanced date picker functionality
        setupDatePickers();
    }

    /**
     * Setup enhanced date picker functionality
     */
    function setupDatePickers() {
        // Ensure date inputs automatically show calendar on focus/click
        $('.heiwa-date-picker').each(function() {
            const $input = $(this);

            // Make sure native inputs are visible when custom picker isn't injected
            // This avoids the "labels only" issue if a custom picker is not available.
            if (!$input.hasClass('heiwa-date-picker-native')) {
                $input.addClass('heiwa-date-picker-native');
            }

            // Auto-open calendar on click/focus (supported browsers)
            $input.on('click focus', function() {
                if (this.showPicker) {
                    try {
                        this.showPicker();
                    } catch (e) {
                        // Fallback for browsers that don't support showPicker
                        console.log('showPicker not supported, using native behavior');
                    }
                }
            });

            // Prevent manual typing and force calendar usage
            $input.on('keydown', function(e) {
                // Allow tab, escape, enter, and delete keys
                if ([9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)) {
                    return;
                }
                // Prevent all other key input to force calendar usage
                e.preventDefault();
            });

            // Remove any custom tooltip to keep it clean
            $input.removeAttr('title');
        });

        // Auto-set end date when start date is selected
        $('#start-date').on('change', function() {
            const startDate = new Date($(this).val());
            const endDate = $('#end-date').val();

            if (!endDate || new Date(endDate) <= startDate) {
                // Auto-set end date to 7 days after start date
                const suggestedEndDate = new Date(startDate);
                suggestedEndDate.setDate(suggestedEndDate.getDate() + 7);
                $('#end-date').val(suggestedEndDate.toISOString().split('T')[0]);
                updateDates();
            }
        });
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

        // Re-render step navigation since participant count affects which steps are shown
        renderStepNavigation();

        updateSummary();
        updateCTAButton();
    }

    /**
     * Render form and addons step
     */
    function renderFormAddons() {
        const $container = $('.heiwa-step-form_addons');

        // Ensure participant details array is properly initialized
        while (bookingData.participantDetails.length < bookingData.participants) {
            bookingData.participantDetails.push({ firstName: '', lastName: '', email: '' });
        }
        bookingData.participantDetails = bookingData.participantDetails.slice(0, bookingData.participants);

        const formHTML = `
            <div class="heiwa-step-header">
                <button class="heiwa-back-button" data-action="heiwa-back">
                    ${getLucideIcon('arrow-left', 16)} Back
                </button>
                <h3 class="heiwa-booking-step-title">Your Details & Add-ons</h3>
            </div>
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
        const duration = calculateDuration();
        const basePrice = bookingData.destination?.price || 599;

        const confirmationHTML = `
            <div class="heiwa-step-header">
                <button class="heiwa-back-button" data-action="heiwa-back">
                    ${getLucideIcon('arrow-left', 16)} Back
                </button>
                <h3 class="heiwa-booking-step-title">Review & Confirm</h3>
            </div>

            <div class="heiwa-confirmation-content">
                <!-- Booking Details -->
                <div class="heiwa-confirmation-section">
                    ${bookingData.bookingType === 'surf-week' ? `
                        <h4 class="heiwa-section-title">${getLucideIcon('waves', 18)} Surf Week Details</h4>
                        <div class="heiwa-destination-summary">
                            <div class="heiwa-destination-info">
                                <h5>${bookingData.selectedSurfWeek?.title || 'Not selected'}</h5>
                                <p class="heiwa-destination-description">${heiwaSanitize(bookingData.selectedSurfWeek?.description) || 'Perfect surf adventure awaits!'}</p>
                                <div class="heiwa-destination-meta">
                                    <span class="heiwa-skill-level">${bookingData.selectedSurfWeek?.category.replace('_', ' ').toUpperCase() || 'All levels'}</span>
                                    <span class="heiwa-location">${formatDateForDisplay(bookingData.selectedSurfWeek?.start_date)} - ${formatDateForDisplay(bookingData.selectedSurfWeek?.end_date)}</span>
                                </div>
                            </div>
                        </div>
                    ` : bookingData.bookingType === 'room' ? `
                        <h4 class="heiwa-section-title">${getLucideIcon('calendar', 18)} Room Details</h4>
                        <div class="heiwa-destination-summary">
                            <div class="heiwa-destination-info">
                                <h5>${bookingData.selectedRoom?.name || 'Not selected'}</h5>
                                <div class="heiwa-destination-amenities">
                                    ${bookingData.selectedRoom?.amenities ? bookingData.selectedRoom.amenities.slice(0, 6).map(amenity => {
                                        const amenityInfo = getAmenityIcon(amenity);
                                        return `<span class="heiwa-amenity-tag">
                                            ${getLucideIcon(amenityInfo.icon, 12)}
                                            ${amenityInfo.label}
                                        </span>`;
                                    }).join('') : '<p class="heiwa-destination-description">Comfortable accommodation awaits!</p>'}
                                </div>
                                <div class="heiwa-destination-meta">
                                    <span class="heiwa-skill-level">${bookingData.selectedRoom?.capacity || '2'} guests</span>
                                    <span class="heiwa-location">${heiwaFmt.format(bookingData.selectedRoom?.price_per_night || 0)}/night</span>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <h4 class="heiwa-section-title">${getLucideIcon('waves', 18)} Surf Camp Details</h4>
                        <div class="heiwa-destination-summary">
                            <div class="heiwa-destination-info">
                                <h5>${bookingData.destination?.name || 'Not selected'}</h5>
                                <p class="heiwa-destination-description">${heiwaSanitize(bookingData.destination?.description) || 'Perfect surf adventure awaits!'}</p>
                                <div class="heiwa-destination-meta">
                                    <span class="heiwa-skill-level">${bookingData.destination?.skill_level || 'All levels'}</span>
                                    <span class="heiwa-location">${bookingData.destination?.location || 'Mexico'}</span>
                                </div>
                            </div>
                        </div>
                    `}
                </div>

                <!-- Dates & Duration -->
                <div class="heiwa-confirmation-section">
                    <h4 class="heiwa-section-title">${getLucideIcon('calendar', 18)} Trip Dates</h4>
                    <div class="heiwa-dates-summary">
                        <div class="heiwa-date-range">
                            <strong>${formatDateForDisplay(bookingData.dates.start)} - ${formatDateForDisplay(bookingData.dates.end)}</strong>
                        </div>
                        <div class="heiwa-duration">
                            ${duration} days of epic surfing
                        </div>
                    </div>
                </div>

                <!-- Participants -->
                <div class="heiwa-confirmation-section">
                    <h4 class="heiwa-section-title">${getLucideIcon('users', 18)} Participants (${bookingData.participants})</h4>
                    <div class="heiwa-participants-summary">
                        ${bookingData.participantDetails.map((participant, index) => `
                            <div class="heiwa-participant-summary">
                                <div class="heiwa-participant-number">${index + 1}</div>
                                <div class="heiwa-participant-info">
                                    <div class="heiwa-participant-name">${participant.firstName} ${participant.lastName}</div>
                                    <div class="heiwa-participant-email">${participant.email}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${bookingData.specialRequests ? `
                    <!-- Special Requests -->
                    <div class="heiwa-confirmation-section">
                        <h4 class="heiwa-section-title">📝 Special Requests</h4>
                        <div class="heiwa-special-requests">
                            ${bookingData.specialRequests}
                        </div>
                    </div>
                ` : ''}

                <!-- Pricing Breakdown -->
                <div class="heiwa-confirmation-section">
                    <h4 class="heiwa-section-title">${getLucideIcon('dollar-sign', 18)} Pricing Breakdown</h4>
                    <div class="heiwa-pricing-breakdown">
                        <div class="heiwa-pricing-row">
                            <span>Base price per person</span>
                            <span>${heiwaFmt.format(basePrice)}</span>
                        </div>
                        <div class="heiwa-pricing-row">
                            <span>Number of participants</span>
                            <span>×${bookingData.participants}</span>
                        </div>
                        <div class="heiwa-pricing-row">
                            <span>Duration</span>
                            <span>${duration} days</span>
                        </div>
                        <div class="heiwa-summary-total" role="region" aria-label="Booking Total">
                            <span class="heiwa-summary-total-label">Total Amount:</span>
                            <span class="heiwa-summary-total-value">${heiwaFmt.format(total)}</span>
                        </div>
                    </div>
                </div>

                <!-- Trust Signals -->
                <div class="heiwa-confirmation-section">
                    <div class="heiwa-trust-signals">
                        <div class="heiwa-trust-item">
                            <svg class="heiwa-trust-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            <span>Secure booking with instant confirmation</span>
                        </div>
                        <div class="heiwa-trust-item">
                            <svg class="heiwa-trust-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <span>Confirmation email sent immediately</span>
                        </div>
                        <div class="heiwa-trust-item">
                            <svg class="heiwa-trust-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                            <span>Flexible payment options available</span>
                        </div>
                    </div>
                </div>

                <!-- Complete Booking CTA -->
                <div class="heiwa-confirmation-actions">
                    <button class="heiwa-cta-button heiwa-complete-booking-btn" data-action="complete-booking" type="button">
                        ${getLucideIcon('check-circle', 18)} Complete Booking
                    </button>
                    <div class="heiwa-booking-notice">
                        By completing this booking, you agree to our terms and conditions.
                    </div>
                </div>
            </div>
        `;

        $container.html(confirmationHTML);

        // Bind the complete booking button
        $container.find('.heiwa-complete-booking-btn').on('click', handleCTAClick);
    }

    /**
     * Calculate total price
     */
    function calculateTotal() {
        if (bookingData.bookingType === 'surf-week' && bookingData.selectedSurfWeek) {
            return bookingData.selectedSurfWeek.price_from * bookingData.participants;
        } else if (bookingData.bookingType === 'room' && bookingData.selectedRoom && bookingData.dates.start && bookingData.dates.end) {
            const nights = calculateDuration();
            return bookingData.selectedRoom.price_per_night * bookingData.participants * nights;
        } else if (bookingData.destination) {
            // Fallback for legacy surf camp booking
            const basePrice = bookingData.destination.price || 599;
            return basePrice * bookingData.participants;
        }

        return 0;
    }

    /**
     * Calculate trip duration in days
     */
    function calculateDuration() {
        const { start, end } = bookingData.dates || {};
        if (!start || !end) return 1;

        const s = new Date(start);
        const e = new Date(end);
        s.setHours(0, 0, 0, 0);
        e.setHours(0, 0, 0, 0);

        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff);
    }

    /**
     * Format date for display
     */
    function formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Update summary in footer
     */
    function updateSummary() {
        const $summaryContainer = getSummaryContainer();
        if ($summaryContainer.length === 0) return;

        const total = calculateTotal();

        // Build summary HTML with collapsible structure
        let summaryHTML = `
            <div class="heiwa-summary-collapsible">
                <div class="heiwa-summary-content">
        `;

        // Add summary items based on current booking state
        if (bookingData.bookingType) {
            let destinationText = 'Not selected';
            if (bookingData.bookingType === 'surf-week' && bookingData.selectedSurfWeek) {
                destinationText = bookingData.selectedSurfWeek.title;
            } else if (bookingData.bookingType === 'room' && bookingData.selectedRoom) {
                destinationText = bookingData.selectedRoom.name;
            }

            summaryHTML += `
                <div class="heiwa-summary-item">
                    <span class="heiwa-summary-label">${bookingData.bookingType === 'surf-week' ? 'Surf Week' : 'Room'}:</span>
                    <span class="heiwa-summary-value">${destinationText}</span>
                </div>
            `;
        }

        // Dates
        if (bookingData.dates.start && bookingData.dates.end) {
            const dateText = `${formatDateForDisplay(bookingData.dates.start)} to ${formatDateForDisplay(bookingData.dates.end)}`;
            summaryHTML += `
                <div class="heiwa-summary-item">
                    <span class="heiwa-summary-label">Dates:</span>
                    <span class="heiwa-summary-value">${dateText}</span>
                </div>
            `;
        }

        // Participants
        if (bookingData.participants > 0) {
            summaryHTML += `
                <div class="heiwa-summary-item">
                    <span class="heiwa-summary-label">Participants:</span>
                    <span class="heiwa-summary-value">${bookingData.participants}</span>
                </div>
            `;
        }

        // Total
        summaryHTML += `
                <div class="heiwa-summary-total">
                    <span class="heiwa-summary-total-label">Total:</span>
                    <span class="heiwa-summary-total-value">${heiwaFmt.format(total)}</span>
                </div>
            </div>
        `;

        // Add collapsible toggle for mobile
        summaryHTML += `
            <button class="heiwa-summary-toggle" type="button" aria-expanded="true">
                Show Details
            </button>
        `;

        // Close summary container (removed duplicate Continue button)
        summaryHTML += `
        </div>
        `;

        $summaryContainer.html(summaryHTML);

        // Track total visibility for UX validation
        if (total > 0) {
            trackEvent('total_displayed', {
                total_amount: total,
                formatted_total: heiwaFmt.format(total),
                has_gradient_styling: true,
                display_location: 'summary',
                booking_type: bookingData.bookingType
            });
        }

        // Bind collapsible toggle
        $summaryContainer.find('.heiwa-summary-toggle').on('click', function() {
            const $toggle = $(this);
            const $collapsible = $summaryContainer.find('.heiwa-summary-collapsible');
            const isCollapsed = $collapsible.hasClass('collapsed');

            if (isCollapsed) {
                $collapsible.removeClass('collapsed');
                $toggle.removeClass('collapsed').attr('aria-expanded', 'true').text('Hide Details');
            } else {
                $collapsible.addClass('collapsed');
                $toggle.addClass('collapsed').attr('aria-expanded', 'false').text('Show Details');
            }
        });

        // Bind CTA button
        $summaryContainer.find('.heiwa-cta-button').on('click', handleCTAClick);

        // Also refresh the step summaries when any summary data changes
        updateStepSummaries();
    }

    /**
     * Ensure step summaries container exists and return it
     */
    function ensureStepSummariesContainer() {
        const $content = $('.heiwa-booking-content');
        if (!$content.find('.heiwa-step-summaries').length) {
            $content.prepend('<div class="heiwa-step-summaries"></div>');
        }
        return $content.find('.heiwa-step-summaries');
    }

    /**
     * Update accordion-style summaries for completed steps
     * Updated to work with dynamic step navigation
     */
    function updateStepSummaries() {
        const $wrap = ensureStepSummariesContainer();
        const activeSteps = getActiveSteps();
        const currentIndex = activeSteps.findIndex(s => s.id === currentStep);
        const items = [];

        function addItem(stepId, title, detailsHtml, isExpanded = false) {
            const expandedClass = isExpanded ? 'expanded' : '';
            const contentClass = isExpanded ? '' : 'collapsed';
            const iconClass = isExpanded ? 'heiwa-accordion-expanded' : 'heiwa-accordion-collapsed';

            items.push(`
                <div class="heiwa-step-summary heiwa-accordion-item ${expandedClass}" data-step="${stepId}">
                    <div class="heiwa-step-summary-header heiwa-accordion-header">
                        <div class="heiwa-step-summary-title">
                            <span class="heiwa-accordion-icon ${iconClass}">${getLucideIcon('chevron-down', 14)}</span>
                            ${title}
                        </div>
                        <button type="button" class="heiwa-step-summary-edit" data-target-step="${stepId}">
                            ${getLucideIcon('edit', 14)} Edit
                        </button>
                    </div>
                    <div class="heiwa-step-summary-content heiwa-accordion-content ${contentClass}">
                        ${detailsHtml}
                    </div>
                </div>
            `);
        }

        // booking-type
        if (activeSteps.findIndex(s => s.id === 'booking-type') < currentIndex && bookingData.bookingType) {
            addItem('booking-type', `${getLucideIcon('check', 14)} Booking Type`,
                bookingData.bookingType === 'surf-week' ? 'All-Inclusive Surf Week' : 'Room Booking');
        }

        // surf-weeks
        if (activeSteps.findIndex(s => s.id === 'surf-weeks') < currentIndex && bookingData.selectedSurfWeek) {
            const w = bookingData.selectedSurfWeek;
            addItem('surf-weeks', `${getLucideIcon('waves', 14)} Surf Week`,
                `${w.title || ''}<br>${formatDateForDisplay(w.start_date)} – ${formatDateForDisplay(w.end_date)}`);
        }

        // assignment
        if (activeSteps.findIndex(s => s.id === 'assignment') < currentIndex && bookingData.assignment?.assignments?.length) {
            const totalAssigned = bookingData.assignment.assignments.reduce((sum, a) => sum + a.participants, 0);
            const roomCount = bookingData.assignment.assignments.length;
            addItem('assignment', `${getLucideIcon('bed', 14)} Room Assignment`,
                `${totalAssigned} participants assigned to ${roomCount} room(s)`);
        }

        // room-calendar / dates_participants (dates)
        if ((activeSteps.findIndex(s => s.id === 'room-calendar') < currentIndex ||
             activeSteps.findIndex(s => s.id === 'dates_participants') < currentIndex) &&
            bookingData.dates.start && bookingData.dates.end) {
            addItem('room-calendar', `${getLucideIcon('calendar', 14)} Dates`,
                `${formatDateForDisplay(bookingData.dates.start)} – ${formatDateForDisplay(bookingData.dates.end)}`);
        }

        // room-selection
        if (activeSteps.findIndex(s => s.id === 'room-selection') < currentIndex && bookingData.selectedRoom) {
            const r = bookingData.selectedRoom;
            addItem('room-selection', `${getLucideIcon('bed', 14)} Room`,
                `${r.name || ''}<br>${heiwaFmt.format(r.price_per_night || 0)}/night`);
        }

        // dates_participants (participants)
        if (activeSteps.findIndex(s => s.id === 'dates_participants') < currentIndex && bookingData.participants) {
            addItem('dates_participants', `${getLucideIcon('users', 14)} Participants`,
                `${bookingData.participants} traveller(s)`);
        }

        // form_addons
        if (activeSteps.findIndex(s => s.id === 'form_addons') < currentIndex && bookingData.participantDetails?.length) {
            const filled = bookingData.participantDetails.filter(p => (p.firstName||p.lastName||p.email)).length;
            addItem('form_addons', `${getLucideIcon('check', 14)} Details`, `${filled}/${bookingData.participants} completed`);
        }

        $wrap.html(items.join(''));

        // Bind accordion toggle functionality
        $wrap.find('.heiwa-accordion-header').off('click').on('click', function(e) {
            if ($(e.target).closest('.heiwa-step-summary-edit').length) {
                // Don't toggle if clicking edit button
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const $item = $(this).closest('.heiwa-accordion-item');
            const $content = $item.find('.heiwa-accordion-content');
            const $icon = $item.find('.heiwa-accordion-icon');

            // Toggle expanded state
            if ($item.hasClass('expanded')) {
                $item.removeClass('expanded');
                $content.addClass('collapsed');
                $icon.removeClass('heiwa-accordion-expanded').addClass('heiwa-accordion-collapsed');
            } else {
                $item.addClass('expanded');
                $content.removeClass('collapsed');
                $icon.removeClass('heiwa-accordion-collapsed').addClass('heiwa-accordion-expanded');
            }
        });

        // Bind navigation from summaries
        $wrap.find('.heiwa-step-summary-edit').off('click').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const target = $(this).data('target-step');
            if (target) {
                showStep(target);
            }
        });
    }


    /**
     * Complete booking
     */
    function completeBooking() {
        const $button = $('.heiwa-cta-button');
        $button.addClass('loading').prop('disabled', true);
        $button.text('Processing...');

        // Transform participant data to match API expectations
        const participants = bookingData.participantDetails.map(participant => ({
            name: `${participant.firstName} ${participant.lastName}`.trim(),
            email: participant.email,
            phone: participant.phone || '',
            surf_level: participant.surfLevel || 'beginner'
        }));

        // Prepare booking data for submission based on booking type
        let submissionData;
        let apiEndpoint;

        if (bookingData.bookingType === 'surf-week') {
            apiEndpoint = '/bookings';
            submissionData = {
                booking_type: 'surf_week',
                camp_id: bookingData.selectedSurfWeek?.id,
                start_date: bookingData.selectedSurfWeek?.start_date,
                end_date: bookingData.selectedSurfWeek?.end_date,
                participants: participants,
                special_requests: bookingData.specialRequests || '',
                total_price: calculateTotal(),
                source_url: window.location.href,
                widget_version: '1.0'
            };
        } else if (bookingData.bookingType === 'room') {
            apiEndpoint = '/bookings';
            submissionData = {
                booking_type: 'room',
                room_id: bookingData.selectedRoom?.id,
                start_date: bookingData.dates.start,
                end_date: bookingData.dates.end,
                participants: participants,
                special_requests: bookingData.specialRequests || '',
                total_price: calculateTotal(),
                source_url: window.location.href,
                widget_version: '1.0'
            };
        } else {
            // Legacy surf camp booking
            apiEndpoint = '/bookings';
            submissionData = {
                booking_type: 'surf_camp',
                camp_id: bookingData.destination?.id,
                start_date: bookingData.dates.start,
                end_date: bookingData.dates.end,
                participants: participants,
                special_requests: bookingData.specialRequests || '',
                total_price: calculateTotal(),
                source_url: window.location.href,
                widget_version: '1.0'
            };
        }

        console.log('Heiwa Booking Widget: Submitting booking data to:', apiEndpoint);
        console.log('Heiwa Booking Widget: Booking data:', submissionData);

        const apiConfig = getAPIConfig();
        makeAPIRequest(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Heiwa-API-Key': apiConfig.apiKey
            },
            body: JSON.stringify(submissionData)
        })
        .then(response => {
            console.log('Heiwa Booking Widget: Booking response:', response);

            if (response.success) {
                // Show success message with booking details
                showSuccessMessage(response.data);
            } else {
                throw new Error(response.message || response.error || 'Booking failed');
            }
        })
        .catch(error => {
            console.error('Booking error:', error);
            showErrorMessage(error.message || 'Booking failed. Please try again.');
        })
        .finally(() => {
            $button.removeClass('loading').prop('disabled', false);
            $button.text('Complete Booking');
        });
    }

    /**
     * Show success message
     */
    function showSuccessMessage(bookingData) {
        const $content = $('.heiwa-booking-content');
        const bookingNumber = bookingData?.booking?.booking_number || 'N/A';
        const paymentLink = bookingData?.payment?.payment_link;

        $content.html(`
            <div class="heiwa-success-message">
                <div class="heiwa-success-header">
                    <div class="heiwa-success-icon">${getLucideIcon('party-popper', 24)}</div>
                    <h3>Booking Confirmed!</h3>
                    <p class="heiwa-booking-number">Booking #${bookingNumber}</p>
                </div>

                <div class="heiwa-success-content">
                    <div class="heiwa-success-item">
                        <svg class="heiwa-success-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Your surf adventure is confirmed!</span>
                    </div>

                    <div class="heiwa-success-item">
                        <svg class="heiwa-success-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span>Confirmation email sent to all participants</span>
                    </div>

                    ${paymentLink ? `
                        <div class="heiwa-success-item">
                            <svg class="heiwa-success-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span>Payment link will be sent separately</span>
                        </div>
                    ` : ''}
                </div>

                <div class="heiwa-success-actions">
                    ${paymentLink ? `
                        <a href="${paymentLink}" class="heiwa-cta-button heiwa-payment-button" target="_blank">
                            Complete Payment
                        </a>
                    ` : ''}
                    <button class="heiwa-cta-button heiwa-secondary-button" data-action="heiwa-close">
                        Close
                    </button>
                </div>
            </div>
        `);
    }

    /**
     * Show error message
     */
    function showErrorMessage(message) {
        const $content = $('.heiwa-booking-content');
        $content.html(`
            <div class="heiwa-error-message">
                <div class="heiwa-error-header">
                    <div class="heiwa-error-icon">❌</div>
                    <h3>Booking Failed</h3>
                </div>

                <div class="heiwa-error-content">
                    <p>${message}</p>
                    <p>Please try again or contact support if the problem persists.</p>
                </div>

                <div class="heiwa-error-actions">
                    <button class="heiwa-cta-button" data-action="heiwa-back">
                        Try Again
                    </button>
                    <button class="heiwa-cta-button heiwa-secondary-button" data-action="heiwa-close">
                        Close
                    </button>
                </div>
            </div>
        `);
    }



    /**
     * Load surf weeks from API
     */
    function loadSurfWeeks() {
        console.log('Heiwa Booking Widget: Loading surf weeks...');

        return makeAPIRequest('/surf-camps')
            .then(response => {
                console.log('Heiwa Booking Widget: Surf weeks API response:', response);

                if (response.success && response.data) {
                    const rawCamps = response.data.surf_camps || [];
                    // Transform surf camps data to match widget expectations
                    surfWeeks = rawCamps.map(camp => ({
                        id: camp.id,
                        title: camp.name,
                        category: camp.details?.skill_level || 'all',
                        start_date: camp.dates?.start_date || camp.start_date,
                        end_date: camp.dates?.end_date || camp.end_date,
                        description: camp.description,
                        price_from: camp.pricing?.base_price || camp.price || 599,
                        available_spots: camp.details?.available_spots || camp.details?.max_participants || 12
                    }));
                    console.log('Heiwa Booking Widget: Loaded', surfWeeks.length, 'surf weeks');
                    return surfWeeks;
                } else {
                    throw new Error(response.message || 'Failed to load surf weeks');
                }
            })
            .catch(error => {
                console.error('Heiwa Booking Widget: Error loading surf weeks:', error);
                // Show error state if we're on the surf-weeks step
                if (isWidgetOpen && currentStep === 'surf-weeks') {
                    const $container = $('.heiwa-step-surf-weeks');
                    $container.html(`
                        <div class="heiwa-error-state">
                            <h4>Unable to load surf weeks</h4>
                            <p>Please check your connection and try again.</p>
                            <button class="heiwa-retry-button" data-action="heiwa-retry">Retry</button>
                        </div>
                    `);
                }
                throw error;
            });
    }

    /**
     * Get surf week thumbnail based on category and location
     */
    function getSurfWeekThumbnail(week) {
        const category = week.category.toLowerCase();
        const location = week.location?.toLowerCase() || '';

        // Generate thumbnail based on category and location
        let thumbnailClass = 'heiwa-surf-thumbnail';
        let icon = 'waves';

        if (category.includes('beginner')) {
            thumbnailClass += ' heiwa-thumbnail-beginner';
            icon = 'sun';
        } else if (category.includes('intermediate')) {
            thumbnailClass += ' heiwa-thumbnail-intermediate';
            icon = 'waves';
        } else if (category.includes('advanced')) {
            thumbnailClass += ' heiwa-thumbnail-advanced';
            icon = 'zap';
        }

        if (location.includes('sayulita')) {
            thumbnailClass += ' heiwa-thumbnail-sayulita';
        } else if (location.includes('mazatlan')) {
            thumbnailClass += ' heiwa-thumbnail-mazatlan';
        }

        return `
            <div class="${thumbnailClass}">
                ${getLucideIcon(icon, 32)}
                <div class="heiwa-thumbnail-overlay"></div>
            </div>
        `;
    }

    /**
     * Render surf week list
     */
    function renderSurfWeekList() {
        const $container = $('.heiwa-step-surf-weeks');

        if (surfWeeks.length === 0) {
            // Show skeleton loading
            showSkeleton($container, 'surf-weeks');
            return;
        }

        const surfWeeksHTML = `
            <div class="heiwa-surf-week-list">
                <div class="heiwa-surf-week-header">
                    <button class="heiwa-back-button" data-action="heiwa-back">
                        ← Back to Booking Type
                    </button>
                    <h3 class="heiwa-surf-week-title">Available Surf Weeks</h3>
                </div>

                <div class="heiwa-surf-week-grid">
                    ${surfWeeks.map(week => `
                        <div class="heiwa-surf-week-item ${bookingData.selectedSurfWeek?.id === week.id ? 'selected' : ''}"
                             data-week-id="${week.id}">
                            <div class="heiwa-surf-week-thumbnail">
                                ${getSurfWeekThumbnail(week)}
                            </div>
                            <div class="heiwa-surf-week-content">
                                <div class="heiwa-surf-week-header">
                                    <h4 class="heiwa-surf-week-name">${week.title}</h4>
                                    <span class="heiwa-surf-week-category heiwa-category-${week.category.toLowerCase().replace('_', '-')}">
                                        ${week.category.replace('_', ' ')}
                                    </span>
                                </div>
                                <div class="heiwa-surf-week-meta">
                                    <div class="heiwa-surf-week-dates">
                                        ${getLucideIcon('calendar', 14)} ${formatDateForDisplay(week.start_date)} - ${formatDateForDisplay(week.end_date)}
                                    </div>
                                    <div class="heiwa-surf-week-description">
                                        ${heiwaSanitize(week.description)}
                                    </div>
                                </div>
                                <div class="heiwa-surf-week-footer">
                                    <div class="heiwa-surf-week-price">
                                        <span class="heiwa-price-amount">${heiwaFmt.format(week.price_from)}</span>
                                        <span class="heiwa-price-label">per person</span>
                                    </div>
                                    <div class="heiwa-surf-week-spots">
                                        ${getLucideIcon('users', 14)} ${week.available_spots} spots left
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        $container.html(surfWeeksHTML);

        // Bind click events
        $('.heiwa-surf-week-item').on('click', function() {
            const weekId = $(this).data('week-id');
            selectSurfWeek(weekId);
        });
    }

    /**
     * Select surf week
     */
    function selectSurfWeek(weekId) {
        const week = surfWeeks.find(w => w.id === weekId);
        if (week) {
            bookingData.selectedSurfWeek = week;
            selectedSurfWeek = week;

            // Update UI
            $('.heiwa-surf-week-item').removeClass('selected');
            $(`.heiwa-surf-week-item[data-week-id="${weekId}"]`).addClass('selected');

            // Set the surf week dates in booking data
            bookingData.dates.start = week.start_date;
            bookingData.dates.end = week.end_date;

            // Update summary
            updateSummary();

            // Auto-advance logic: skip assignment for single participants
            setTimeout(() => {
                if (bookingData.participants === 1) {
                    // Single participant: auto-assign to best value room and skip to details
                    autoAssignSingleParticipant();
                    showStep('form_addons');
                } else {
                    // Multiple participants: proceed to assignment step
                    showStep('assignment');
                }
            }, 500);
        }
    }

    /**
     * Render assignment step for surf camp booking
     */
    function renderAssignment() {
        const $container = getStepContainer('assignment');

        if (!bookingData.selectedSurfWeek) {
            $container.html('<div class="heiwa-error-state"><h4>No surf week selected</h4><p>Please go back and select a surf week first.</p></div>');
            return;
        }

        // Initialize assignment data if not exists
        if (!bookingData.assignment) {
            bookingData.assignment = {
                assignments: [],
                suggestions: generateAssignmentSuggestions(),
                selectedSuggestion: null
            };
        }


        // Ensure room availability is loaded for this week
        if (!availabilityData || !Array.isArray(availabilityData.available_rooms)) {
            const week = bookingData.selectedSurfWeek;
            const start = week?.start_date || week?.startDate;
            const end = week?.end_date || week?.endDate;
            const participants = bookingData.participants || 1;

            if (start && end) {
                // Show lightweight loading while we fetch
                $container.html('<div class="heiwa-assignment-container"><div class="heiwa-loading">Loading rooms...</div></div>');
                const params = new URLSearchParams({ start_date: start, end_date: end, participants });
                makeAPIRequest(`/rooms/availability?${params}`)
                    .then((resp) => {
                        if (resp && resp.success && resp.data && Array.isArray(resp.data.available_rooms)) {
                            availabilityData = resp.data;
                            // Re-render now that we have room data
                            renderAssignment();
                        } else {
                            console.warn('Heiwa Booking Widget: No rooms returned for assignment fetch', resp);
                            $container.html('<div class="heiwa-error-state"><h4>No rooms available</h4><p>Please try different dates or adjust participants.</p></div>');
                        }
                    })
                    .catch((err) => {
                        console.error('Heiwa Booking Widget: Error fetching rooms for assignment', err);
                        $container.html('<div class="heiwa-error-state"><h4>Could not load rooms</h4><p>Please check your connection and try again.</p></div>');
                    });
                return; // Stop here; we'll re-enter once data is ready
            }
        }

        // Refresh backend-driven suggestions now that availabilityData is loaded
        try {
            bookingData.assignment.suggestions = generateAssignmentSuggestions();
        } catch (e) {
            console.warn('Heiwa Booking Widget: Could not refresh suggestions', e);
        }

        const assignmentHTML = `
            <div class="heiwa-assignment-container">
                <div class="heiwa-step-header">
                    <button class="heiwa-back-button" data-action="heiwa-back">
                        ${getLucideIcon('arrow-left', 16)} Back
                    </button>
                    <h3 class="heiwa-booking-step-title">Assign Rooms & Beds</h3>
                    <div class="heiwa-assignment-progress">
                        <span class="heiwa-assignment-count">
                            ${bookingData.assignment.assignments.length}/${bookingData.participants} assigned
                        </span>
                    </div>
                </div>

                <div class="heiwa-assignment-content">
                    ${renderAssignmentSuggestions()}

                    <div class="heiwa-assignment-participants">
                        <h4 class="heiwa-assignment-section-title">Assign Participants</h4>
                        <div class="heiwa-participant-stepper">
                            ${renderParticipantStepper()}
                        </div>
                    </div>

                    <div class="heiwa-assignment-rooms">
                        <h4 class="heiwa-assignment-section-title">Available Rooms</h4>
                        <div class="heiwa-room-picker-grid">
                            ${renderRoomPicker()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        $container.html(assignmentHTML);

        // Bind events
        bindAssignmentEvents();
    }

    /**
     * Generate intelligent assignment suggestions (backend-driven)
     */
    function generateAssignmentSuggestions() {
        try {
            const participants = bookingData?.participants || 1;

            // Source rooms from backend availability when present; fall back to simple mocks
            const apiRooms = (availabilityData && Array.isArray(availabilityData.available_rooms))
                ? availabilityData.available_rooms
                : null;

            const availableRooms = (apiRooms
                ? apiRooms.map(r => {
                    const cap = (typeof r.free === 'number') ? r.free : (r.capacity || 0);
                    return {
                        id: r.id,
                        type: (r.booking_type === 'bed' || r.type === 'dorm') ? 'dorm' : 'private',
                        capacity: cap,
                        price: (typeof r.price_per_night === 'number') ? r.price_per_night : (r.price || 0),
                        available: cap > 0
                    };
                })
                : [
                    { id: 1, type: 'private', capacity: 2, price: 150, available: true },
                    { id: 2, type: 'private', capacity: 3, price: 210, available: true },
                    { id: 3, type: 'dorm', capacity: 6, price: 85, available: true },
                    { id: 4, type: 'dorm', capacity: 8, price: 75, available: true }
                ]
            ).filter(r => r.available && r.capacity > 0);

            if (!availableRooms.length) return [];

            const suggestions = [];

            const valueAssignments = generateOptimalAssignments(participants, availableRooms, 'value');
            const privacyAssignments = generateOptimalAssignments(participants, availableRooms, 'privacy');
            const costAssignments = generateOptimalAssignments(participants, availableRooms, 'cost');

            // Best Value suggestion
            suggestions.push({
                id: 'best-value',
                title: 'Best Value',
                description: 'Optimal balance of cost and comfort',
                assignments: valueAssignments,
                totalPrice: calculateSuggestionPrice(valueAssignments, availableRooms)
            });

            // Most Privacy suggestion
            suggestions.push({
                id: 'most-privacy',
                title: 'Most Privacy',
                description: 'Private rooms for maximum comfort',
                assignments: privacyAssignments,
                totalPrice: calculateSuggestionPrice(privacyAssignments, availableRooms)
            });

            // Lowest Cost suggestion
            suggestions.push({
                id: 'lowest-cost',
                title: 'Lowest Cost',
                description: 'Most economical option',
                assignments: costAssignments,
                totalPrice: calculateSuggestionPrice(costAssignments, availableRooms)
            });

            return suggestions;
        } catch (e) {
            console.warn('Heiwa Booking Widget: Failed to generate suggestions', e);
            return [];
        }
    }

    /**
     * Generate optimal assignments based on criteria
     */
    function generateOptimalAssignments(participants, rooms, criteria) {
        const assignments = [];

        if (criteria === 'privacy') {
            // Assign to private rooms first
            const privateRooms = rooms.filter(r => r.type === 'private').sort((a, b) => a.capacity - b.capacity);

            let remainingParticipants = participants;
            for (const room of privateRooms) {
                if (remainingParticipants <= 0) break;

                const assignCount = Math.min(remainingParticipants, room.capacity);
                assignments.push({
                    roomId: room.id,
                    participants: assignCount
                });
                remainingParticipants -= assignCount;
            }

            // If still have participants, use dorms
            if (remainingParticipants > 0) {
                const dorms = rooms.filter(r => r.type === 'dorm').sort((a, b) => a.price - b.price);
                for (const room of dorms) {
                    if (remainingParticipants <= 0) break;

                    const assignCount = Math.min(remainingParticipants, room.capacity);
                    assignments.push({
                        roomId: room.id,
                        participants: assignCount
                    });
                    remainingParticipants -= assignCount;
                }
            }
        } else if (criteria === 'cost') {
            // Use cheapest rooms first
            const sortedRooms = rooms.sort((a, b) => a.price - b.price);

            let remainingParticipants = participants;
            for (const room of sortedRooms) {
                if (remainingParticipants <= 0) break;

                const assignCount = Math.min(remainingParticipants, room.capacity);
                assignments.push({
                    roomId: room.id,
                    participants: assignCount
                });
                remainingParticipants -= assignCount;
            }
        } else {
            // Value optimization - balance cost and comfort
            let remainingParticipants = participants;

            // First try to fill private rooms optimally
            const privateRooms = rooms.filter(r => r.type === 'private').sort((a, b) => a.price / a.capacity - b.price / b.capacity);

            for (const room of privateRooms) {
                if (remainingParticipants <= 0) break;

                // Only assign if room utilization would be good (at least 60%)
                const utilization = Math.min(remainingParticipants, room.capacity) / room.capacity;
                if (utilization >= 0.6) {
                    const assignCount = Math.min(remainingParticipants, room.capacity);
                    assignments.push({
                        roomId: room.id,
                        participants: assignCount
                    });
                    remainingParticipants -= assignCount;
                }
            }

            // Fill remaining with dorms
            const dorms = rooms.filter(r => r.type === 'dorm').sort((a, b) => a.price - b.price);
            for (const room of dorms) {
                if (remainingParticipants <= 0) break;

                const assignCount = Math.min(remainingParticipants, room.capacity);
                assignments.push({
                    roomId: room.id,
                    participants: assignCount
                });
                remainingParticipants -= assignCount;
            }
        }

        return assignments;
    }

    /**
     * Calculate total price for a suggestion
     */
    function calculateSuggestionPrice(assignments, rooms) {
        return assignments.reduce((total, assignment) => {
            const room = rooms.find(r => r.id === assignment.roomId);
            return total + (room.price * assignment.participants);
        }, 0);
    }

    /**
     * Render assignment suggestions
     */
    function renderAssignmentSuggestions() {
        const suggestions = bookingData.assignment.suggestions;

        return `
            <div class="heiwa-assignment-suggestions">
                <h4 class="heiwa-assignment-section-title">Recommended Assignments</h4>
                <div class="heiwa-suggestions-grid">
                    ${suggestions.map(suggestion => `
                        <div class="heiwa-suggestion-card ${bookingData.assignment.selectedSuggestion === suggestion.id ? 'selected' : ''}"
                             data-suggestion-id="${suggestion.id}">
                            <div class="heiwa-suggestion-header">
                                <h5 class="heiwa-suggestion-title">${suggestion.title}</h5>
                                <span class="heiwa-suggestion-badge">${suggestion.description}</span>
                            </div>
                            <div class="heiwa-suggestion-details">
                                <div class="heiwa-suggestion-price">${heiwaFmt.format(suggestion.totalPrice)}</div>
                                <button class="heiwa-suggestion-apply" data-suggestion-id="${suggestion.id}">
                                    Apply This
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Auto-assign best room for single participant in room booking flow
     * Implements BL-001 fix: Skip room selection step for single participants
     */
    function autoAssignBestRoom() {
        console.log('Heiwa Booking Widget: Auto-assigning best room for single participant');

        if (!availabilityData || !availabilityData.available_rooms || availabilityData.available_rooms.length === 0) {
            console.warn('Heiwa Booking Widget: No available rooms for auto-assignment');
            return;
        }

        // Find the best value room (lowest price per night for single occupancy)
        const bestRoom = availabilityData.available_rooms
            .filter(room => room.capacity >= 1) // Can accommodate single participant
            .sort((a, b) => a.price_per_night - b.price_per_night)[0]; // Cheapest first

        if (bestRoom) {
            bookingData.selectedRoom = bestRoom;
            console.log('Heiwa Booking Widget: Auto-assigned room:', bestRoom);
            updateSummary();
        } else {
            console.warn('Heiwa Booking Widget: No suitable room found for auto-assignment');
        }
    }

    /**
     * Auto-assign single participant to best value room
     * Implements BL-001 fix: Skip assignment step for single participants
     */
    function autoAssignSingleParticipant() {
        console.log('Heiwa Booking Widget: Auto-assigning single participant');

        // Initialize assignment data structure
        if (!bookingData.assignment) {
            bookingData.assignment = {
                assignments: [],
                suggestions: []
            };
        }

        // Generate room suggestions using existing logic
        const suggestions = generateAssignmentSuggestions();

        if (suggestions.length > 0) {
            // Select the "value" suggestion (best balance of cost and comfort)
            const bestSuggestion = suggestions.find(s => s.criteria === 'value') || suggestions[0];

            // Apply the best suggestion automatically
            bookingData.assignment.assignments = bestSuggestion.assignments;

            console.log('Heiwa Booking Widget: Single participant auto-assigned:', {
                suggestion: bestSuggestion.criteria,
                assignments: bookingData.assignment.assignments
            });

            // Show success message
            showToast('Room automatically assigned for single participant!', 'success');
        } else {
            console.warn('Heiwa Booking Widget: No room suggestions available for auto-assignment');
            // Fallback: create a basic assignment to the first available room
            bookingData.assignment.assignments = [{
                roomId: 1, // Default to first room
                participants: 1
            }];
        }

        // Update summary to reflect the assignment
        updateSummary();
    }

    /**
     * Render participant stepper
     */
    function renderParticipantStepper() {
        const participants = bookingData.participants;
        const assignments = bookingData.assignment.assignments;

        let stepperHTML = '<div class="heiwa-participants-list">';

        for (let i = 0; i < participants; i++) {
            const participant = bookingData.participantDetails[i] || { firstName: '', lastName: '' };
            const isAssigned = assignments.some(a => a.participants > i);
            const assignedRoom = assignments.find(a => a.participants > i);

            stepperHTML += `
                <div class="heiwa-participant-item ${isAssigned ? 'assigned' : 'unassigned'}">
                    <div class="heiwa-participant-header">
                        <div class="heiwa-participant-avatar">
                            ${participant.firstName && participant.lastName ?
                                participant.firstName.charAt(0).toUpperCase() + participant.lastName.charAt(0).toUpperCase() :
                                (i + 1).toString()}
                        </div>
                        <div class="heiwa-participant-info">
                            <span class="heiwa-participant-name">
                                ${participant.firstName && participant.lastName ?
                                    `${participant.firstName} ${participant.lastName}` :
                                    `Participant ${i + 1}`}
                            </span>
                            ${assignedRoom ? `<span class="heiwa-participant-room">Room ${assignedRoom.roomId}</span>` : ''}
                        </div>
                        <div class="heiwa-participant-status">
                            ${isAssigned ? '✓' : '○'}
                        </div>
                    </div>
                </div>
            `;
        }

        stepperHTML += '</div>';
        return stepperHTML;
    }

    /**
     * Render room picker grid (backend-driven)
     */
    function renderRoomPicker() {
        // Always use backend-provided availability data
        const rooms = (availabilityData && Array.isArray(availabilityData.available_rooms))
            ? availabilityData.available_rooms
            : [];

        if (!rooms.length) {
            return `<div class="heiwa-empty-state"><h5>No rooms available</h5><p>Try different dates or reduce participants.</p></div>`;
        }

        return rooms.map((r) => roomCardFromBackend(r)).join('');
    }

    /**
     * Build a compact, high-signal room card from backend data
     */
    function roomCardFromBackend(r) {
        const typeLabel = (r.booking_type === 'bed' || r.booking_type === 'perBed' || r.type === 'dorm') ? 'dorm' : 'private';
        const price = (typeof r.price_per_night === 'number') ? r.price_per_night : (r.price || 0);
        const img = r.featured_image || (Array.isArray(r.images) && r.images[0]) || '';
        const amenities = Array.isArray(r.amenities) ? r.amenities : [];
        const spotsLeft = (typeof r.free === 'number') ? r.free : (r.capacity || 0);
        const priceLabel = (typeLabel === 'dorm') ? 'per person' : 'per room';

        return `
        <div class="heiwa-room-card ${typeLabel}" data-room-id="${r.id}">
            <div class="heiwa-room-thumb" style="background-image:url('${img}')">
                <span class="heiwa-badge heiwa-badge-type">${typeLabel}</span>
                <span class="heiwa-badge heiwa-badge-cap">${getLucideIcon('users',14)} ${spotsLeft} left</span>
            </div>
            <div class="heiwa-room-main">
                <h5 class="heiwa-room-name">${(r.name || 'Room')}</h5>
                <div class="heiwa-amenity-chips">${amenityChips(amenities)}</div>
            </div>
            <div class="heiwa-room-price">
                <div class="heiwa-price-amount">${heiwaFmt.format(price)}</div>
                <div class="heiwa-price-label">${priceLabel}</div>
                <button class="heiwa-assign-cta" data-room-id="${r.id}">${getLucideIcon('check',16)} Assign to ${currentParticipantLabel()}</button>
            </div>
        </div>`;
    }

    /**
     * Map backend amenities -> compact chips with Lucide icons
     */
    function amenityChips(list) {
        const AMENITY_MAP = {
            ensuite: { icon: 'bath', label: 'Ensuite' },
            shared_bathroom: { icon: 'bath', label: 'Shared bath' },
            ac: { icon: 'snowflake', label: 'AC' },
            fan: { icon: 'wind', label: 'Fan' },
            wifi: { icon: 'wifi', label: 'Wi‑Fi' },
            ocean_view: { icon: 'waves', label: 'Ocean view' },
            garden_view: { icon: 'mountain', label: 'Garden view' },
            bunk_beds: { icon: 'bed', label: 'Bunk beds' },
            queen: { icon: 'bed', label: 'Queen bed' },
            double: { icon: 'bed', label: 'Double bed' }
        };
        if (!Array.isArray(list) || !list.length) return '';
        return list.slice(0, 6).map(key => {
            const m = AMENITY_MAP[key] || { icon: 'dot', label: String(key).replace(/_/g, ' ') };
            return `<span class="heiwa-chip">${getLucideIcon(m.icon, 14)} ${m.label}</span>`;
        }).join('');
    }

    function currentParticipantLabel() {
        const p = (bookingData && Array.isArray(bookingData.participantDetails) && bookingData.participantDetails[0]) || null;
        if (p && (p.firstName || p.lastName)) {
            return (p.firstName || '').trim() || (p.lastName || '').trim() || 'traveler';
        }
        return 'traveler';
    }

    /**
     * Bind assignment events
     */
    function bindAssignmentEvents() {
        // Suggestion selection
        $('.heiwa-suggestion-apply').on('click', function(e) {
            e.stopPropagation();
            const suggestionId = $(this).data('suggestion-id');
            applySuggestion(suggestionId);
        });

        // Room assignment (legacy button)
        $('.heiwa-room-assign-btn').on('click', function(e) {
            e.stopPropagation();
            const roomId = $(this).data('room-id');
            assignToRoom(roomId);
        });

        // Room assignment (new compact card CTA)
        $('.heiwa-assign-cta').on('click', function(e) {
            e.stopPropagation();
            const roomId = $(this).data('room-id');
            assignToRoom(roomId);
        });
    }

    /**
     * Apply assignment suggestion
     */
    function applySuggestion(suggestionId) {
        const suggestion = bookingData.assignment.suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
            bookingData.assignment.selectedSuggestion = suggestionId;
            bookingData.assignment.assignments = suggestion.assignments;

            // Update UI
            $('.heiwa-suggestion-card').removeClass('selected');
            $(`.heiwa-suggestion-card[data-suggestion-id="${suggestionId}"]`).addClass('selected');

            // Re-render assignment
            renderAssignment();

            // Update summary
            updateSummary();

            // Show success toast
            showToast('Assignment applied successfully!', 'success');
        }
    }

    /**
     * Assign participants to room
     */
    function assignToRoom(roomId) {
        // Find unassigned participants
        const unassignedCount = bookingData.participants - bookingData.assignment.assignments.reduce((sum, a) => sum + a.participants, 0);

        if (unassignedCount > 0) {
            const newAssignment = {
                roomId: parseInt(roomId),
                participants: Math.min(unassignedCount, 2) // Simple logic - assign 1-2 participants
            };

            bookingData.assignment.assignments.push(newAssignment);

            // Re-render assignment
            renderAssignment();

            // Update summary
            updateSummary();

            // Check if all assigned
            const totalAssigned = bookingData.assignment.assignments.reduce((sum, a) => sum + a.participants, 0);
            if (totalAssigned >= bookingData.participants) {
                showToast('All participants assigned! Ready to continue.', 'success');

                // Auto-advance after a delay
                setTimeout(() => {
                    showStep('form_addons');
                }, 1500);
            } else {
                showToast(`Assigned ${newAssignment.participants} participant(s) to room`, 'info');
            }
        } else {
            showToast('All participants are already assigned!', 'warning');
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        const toastHTML = `
            <div class="heiwa-toast heiwa-toast-${type}" style="position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 12px 16px; background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#6b7280'}; color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: heiwa-slide-down 0.3s ease-out;">
                ${message}
            </div>
        `;

        $('body').append(toastHTML);

        // Remove after 3 seconds
        setTimeout(() => {
            $('.heiwa-toast').fadeOut(300, function() {
                $(this).remove();
            });
        }, 3000);
    }

    /**
     * Render room calendar for room booking
     */
    function renderRoomCalendar() {
        console.log('Heiwa Booking Widget: renderRoomCalendar called');
        const $container = $('.heiwa-step-room-calendar');
        console.log('Heiwa Booking Widget: Room calendar container found:', $container.length);

        const roomCalendarHTML = `
            <div class="heiwa-room-calendar">
                <div class="heiwa-step-header">
                    <button class="heiwa-back-button" data-action="heiwa-back">
                        ← Back to Booking Type
                    </button>
                    <h3 class="heiwa-booking-step-title">Select Your Dates</h3>
                </div>

                <div class="heiwa-calendar-section">
                    <div class="heiwa-form-group">
                        <label class="heiwa-form-label">Check-in Date</label>
                        <input type="date" class="heiwa-form-input heiwa-date-picker" id="room-checkin-date"
                               value="${bookingData.dates.start || ''}"
                               min="${new Date().toISOString().split('T')[0]}"
                               autocomplete="off">
                    </div>

                    <div class="heiwa-form-group">
                        <label class="heiwa-form-label">Check-out Date</label>
                        <input type="date" class="heiwa-form-input heiwa-date-picker" id="room-checkout-date"
                               value="${bookingData.dates.end || ''}"
                               min="${new Date().toISOString().split('T')[0]}"
                               autocomplete="off">
                    </div>

                    <div class="heiwa-form-group">
                        <label class="heiwa-form-label">Number of Participants</label>
                        <div class="heiwa-participant-counter">
                            <button type="button" class="heiwa-counter-button" data-action="decrease" ${bookingData.participants <= 1 ? 'disabled' : ''}>−</button>
                            <span class="heiwa-counter-value">${bookingData.participants}</span>
                            <button type="button" class="heiwa-counter-button" data-action="increase" ${bookingData.participants >= 8 ? 'disabled' : ''}>+</button>
                        </div>
                    </div>

                    <button class="heiwa-cta-button heiwa-check-availability-btn" id="check-room-availability">
                        Check Room Availability
                    </button>
                </div>
            </div>
        `;

        $container.html(roomCalendarHTML);

        // Bind events
        $('#room-checkin-date, #room-checkout-date').on('change', updateRoomDates);
        $('.heiwa-counter-button').on('click', updateParticipantCount);
        $('#check-room-availability').on('click', checkRoomAvailability);

        // Setup date pickers
        setupDatePickers();
    }

    /**
     * Update room booking dates
     */
    function updateRoomDates() {
        bookingData.dates.start = $('#room-checkin-date').val();
        bookingData.dates.end = $('#room-checkout-date').val();

        updateSummary();
        updateCTAButton();
    }

    /**
     * Check room availability
     */
    function checkRoomAvailability() {
        console.log('Heiwa Booking Widget: checkRoomAvailability called');

        const startDate = $('#room-checkin-date').val();
        const endDate = $('#room-checkout-date').val();

        console.log('Heiwa Booking Widget: Selected dates:', { startDate, endDate });

        if (!startDate || !endDate) {
            console.error('Heiwa Booking Widget: Missing dates');
            showError('Please select both check-in and check-out dates.');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            console.error('Heiwa Booking Widget: Invalid date range');
            showError('Check-out date must be after check-in date.');
            return;
        }

        // Show loading state
        const $button = $('#check-room-availability');
        $button.text('Checking...').prop('disabled', true);

        // Make API request for room availability
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            participants: bookingData.participants || 1
        });

        const apiUrl = `/rooms/availability?${params}`;
        console.log('Heiwa Booking Widget: Making API request to:', apiUrl);

        makeAPIRequest(apiUrl)
            .then(response => {
                console.log('Heiwa Booking Widget: Room availability API response:', response);
                console.log('Heiwa Booking Widget: Response type:', typeof response);
                console.log('Heiwa Booking Widget: Response keys:', Object.keys(response || {}));
                console.log('Heiwa Booking Widget: Response.success:', response?.success);
                console.log('Heiwa Booking Widget: Response.data:', response?.data);
                console.log('Heiwa Booking Widget: Available rooms:', response?.data?.available_rooms);
                console.log('Heiwa Booking Widget: Available rooms length:', response?.data?.available_rooms?.length);

                $button.text('Check Room Availability').prop('disabled', false);

                if (response && response.success && response.data && response.data.available_rooms) {
                    console.log('Heiwa Booking Widget: SUCCESS - Available rooms found:', response.data.available_rooms.length);

                    // Store availability data
                    availabilityData = response.data;
                    console.log('Heiwa Booking Widget: Stored availabilityData:', availabilityData);

                    // Update booking data with selected dates
                    bookingData.dates.start = startDate;
                    bookingData.dates.end = endDate;
                    console.log('Heiwa Booking Widget: Updated bookingData with dates:', bookingData);

                    // Auto-assign room for single participants, otherwise go to room selection
                    if (bookingData.participants === 1) {
                        autoAssignBestRoom();
                        showToast('Room automatically assigned for single participant!', 'success');
                        setTimeout(() => showStep('form_addons'), 1000);
                    } else {
                        showStep('room-selection');
                    }
                } else {
                    console.error('Heiwa Booking Widget: API response indicates failure or missing data:', {
                        response: response,
                        hasResponse: !!response,
                        hasSuccess: !!(response && response.success),
                        hasData: !!(response && response.data),
                        hasAvailableRooms: !!(response && response.data && response.data.available_rooms)
                    });
                    throw new Error(response.message || 'No rooms available for selected dates');
                }
            })
            .catch(error => {
                console.error('Heiwa Booking Widget: Room availability API error:', error);
                $button.text('Check Room Availability').prop('disabled', false);
                showError(error.message || 'Failed to check room availability. Please try again.');
            });
    }

    /**
     * Render room selection
     */
    function renderRoomSelection() {
        console.log('Heiwa Booking Widget: renderRoomSelection called');
        console.log('Heiwa Booking Widget: Current availabilityData:', availabilityData);

        const $container = $('.heiwa-step-room-selection');

        if (!availabilityData || !availabilityData.available_rooms) {
            console.warn('Heiwa Booking Widget: No room data in memory. Attempting fallback fetch using bookingData.dates...', {
                bookingDates: bookingData.dates,
                participants: bookingData.participants
            });

            // Fallback: if we have dates, try fetching availability again
            if (bookingData.dates.start && bookingData.dates.end) {
                $container.html('<div class="heiwa-loading">Loading rooms...</div>');
                const params = new URLSearchParams({
                    start_date: bookingData.dates.start,
                    end_date: bookingData.dates.end,
                    participants: bookingData.participants || 1
                });
                const url = `/rooms/availability?${params}`;
                makeAPIRequest(url)
                  .then((resp) => {
                      console.log('Heiwa Booking Widget: Fallback availability fetch response:', resp);
                      if (resp && resp.success && resp.data && Array.isArray(resp.data.available_rooms) && resp.data.available_rooms.length > 0) {
                          availabilityData = resp.data;
                          console.log('Heiwa Booking Widget: Fallback fetch succeeded. availabilityData restored:', availabilityData);
                          // Re-render now that we have data
                          renderRoomSelection();
                      } else {
                          console.error('Heiwa Booking Widget: Fallback fetch returned no rooms. Showing error.', resp);
                          $container.html('<div class="heiwa-error-state"><h4>No room data available</h4><p>Please go back and check availability again.</p></div>');
                      }
                  })
                  .catch((err) => {
                      console.error('Heiwa Booking Widget: Fallback availability fetch failed:', err);
                      $container.html('<div class="heiwa-error-state"><h4>No room data available</h4><p>Please go back and check availability again.</p></div>');
                  });
                return;
            }

            // No dates either: show error
            $container.html('<div class="heiwa-error-state"><h4>No room data available</h4><p>Please go back and check availability again.</p></div>');
            return;
        }

        console.log('Heiwa Booking Widget: Rendering', availabilityData.available_rooms.length, 'rooms');

        const roomSelectionHTML = `
            <div class="heiwa-room-selection">
                <div class="heiwa-step-header">
                    <button class="heiwa-back-button" data-action="heiwa-back">
                        ${getLucideIcon('arrow-left', 16)} Back to Dates
                    </button>
                    <h3 class="heiwa-booking-step-title">Choose Your Room</h3>
                </div>

                <div class="heiwa-room-grid">
                    ${availabilityData.available_rooms.map(room => `
                        <div class="heiwa-room-card ${bookingData.selectedRoom?.id === room.id ? 'selected' : ''}"
                             data-room-id="${room.id}">
                            <div class="heiwa-room-image">
                                ${room.featured_image ? `
                                    <img src="${room.featured_image}" alt="${room.name}" class="heiwa-room-img"
                                         onerror="this.style.display='none';this.parentElement.querySelector('.heiwa-room-image-placeholder').style.display='flex';" />
                                ` : ''}
                                <div class="heiwa-room-image-placeholder" style="${room.featured_image ? 'display:none;' : ''}">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="heiwa-room-content">
                                <h4 class="heiwa-room-name">${room.name}</h4>
                                <div class="heiwa-room-details">
                                    <span class="heiwa-room-capacity">${getLucideIcon('users', 14)} ${room.capacity} guests</span>
                                    <span class="heiwa-room-price">${heiwaFmt.format(room.price_per_night)}/night</span>
                                </div>
                                <div class="heiwa-room-amenities">
                                    ${room.amenities ? room.amenities.slice(0, 4).map(amenity => {
                                        const amenityInfo = getAmenityIcon(amenity);
                                        return `<span class="heiwa-amenity">
                                            ${getLucideIcon(amenityInfo.icon, 14)}
                                            ${amenityInfo.label}
                                        </span>`;
                                    }).join('') : ''}
                                    ${room.amenities && room.amenities.length > 4 ? `<span class="heiwa-amenity-more">+${room.amenities.length - 4} more</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        $container.html(roomSelectionHTML);

        // Bind click events
        $('.heiwa-room-card').on('click', function() {
            const roomId = $(this).data('room-id');
            selectRoom(roomId);
        });
    }

    /**
     * Select room
     */
    function selectRoom(roomId) {
        const room = availabilityData.available_rooms.find(r => r.id === roomId);
        if (room) {
            bookingData.selectedRoom = room;

            // Update UI
            $('.heiwa-room-card').removeClass('selected');
            $(`.heiwa-room-card[data-room-id="${roomId}"]`).addClass('selected');

            // Update summary
            updateSummary();

            // Auto-advance to next step
            setTimeout(() => {
                showStep('form_addons');
            }, 500);
        }
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

        makeAPIRequest('/surf-camps')
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

        makeAPIRequest(`/rooms/availability?${params}`)
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

        makeAPIRequest('/bookings', {
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
        console.log('Heiwa Booking Widget: resetWidget called');
        currentStep = 'booking-type';
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

    /**
     * Validation functions for hardening
     */
    function validateConfirmationStepVisibility() {
        if (currentStep === 'confirmation') {
            const $stepContent = $(`.heiwa-booking-step-content[data-step="confirmation"]`);
            const $confirmationContainer = $('.heiwa-step-confirmation');

            const isStepVisible = $stepContent.hasClass('active') && $stepContent.is(':visible');
            const hasContent = $confirmationContainer.children().length > 0;

            if (!isStepVisible) {
                console.warn('Heiwa Booking Widget: Confirmation step container is not visible');
                return false;
            }

            if (!hasContent) {
                console.warn('Heiwa Booking Widget: Confirmation step has no content');
                return false;
            }

            console.log('Heiwa Booking Widget: Confirmation step validation passed');
            return true;
        }
        return true;
    }

    function preventStepHidingConflicts() {
        // Check for CSS rules that might hide step containers
        const $confirmationStep = $('.heiwa-step-confirmation');
        if ($confirmationStep.length > 0) {
            const computedStyle = window.getComputedStyle($confirmationStep[0]);

            if (computedStyle.display === 'none' && currentStep === 'confirmation') {
                console.error('Heiwa Booking Widget: CSS conflict detected - confirmation step is hidden by display:none');
                // Force show the step
                $confirmationStep.css('display', 'block');
            }
        }
    }

    // Global widget object for external access
    window.HeiwaBookingWidget = {
        init: function(widgetId, settings) {
            // Initialize specific widget instance
            initBookingWidget();
        },
        retryLoadSurfCamps: function() {
            loadSurfCamps();
        },
        retryLoadSurfWeeks: function() {
            loadSurfWeeks();
        },
        goToPreviousStep: function() {
            goToPreviousStep();
        },
        // Validation methods for testing
        validateConfirmationStepVisibility: validateConfirmationStepVisibility,
        preventStepHidingConflicts: preventStepHidingConflicts
    };

    // Initialize when document is ready - multiple fallbacks for WordPress compatibility
    function initializeWidget() {
        if (typeof jQuery !== 'undefined') {
            console.log('Heiwa Booking Widget: Initializing...');
            initBookingWidget();
        } else {
            console.error('Heiwa Booking Widget: jQuery not available');
        }

        // Runtime version badge for debugging
        if (typeof window.heiwa_booking_ajax !== 'undefined' && window.heiwa_booking_ajax.build_id) {
            console.info('[Heiwa Widget] build=%s src=%s',
                window.heiwa_booking_ajax.build_id,
                (document.currentScript && document.currentScript.src) || 'unknown'
            );
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
