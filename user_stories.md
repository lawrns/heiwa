# Heiwa House Admin Dashboard - User Stories

## Overview
Heiwa House is a surf camp and accommodation business operating under two brands: "Heiwa House" and "Freedom Routes". This admin dashboard manages all aspects of the business including client relationships, bookings, room inventory, surf camp sessions, and additional services.

## Epic 1: Authentication & Security

### User Story 1.1: Admin Login
**As an** administrator  
**I want to** securely log into the admin dashboard  
**So that** I can access business management tools  

**Acceptance Criteria:**
- Login form with email and password fields
- Firebase authentication integration
- Admin email whitelist validation
- Automatic redirect after successful login
- Clear error messages for invalid credentials
- Session management with automatic logout after inactivity
- Responsive design for mobile login

### User Story 1.2: Session Management
**As an** administrator  
**I want to** stay logged in during my work session  
**So that** I don't have to repeatedly authenticate  

**Acceptance Criteria:**
- Automatic token refresh every 30 minutes
- Cookie-based session persistence
- Automatic logout on session expiry
- Clear session timeout warnings
- Secure logout functionality

### User Story 1.3: Security Access Control
**As a** system administrator  
**I want to** control who can access the admin dashboard  
**So that** only authorized personnel can manage business data  

**Acceptance Criteria:**
- Admin email whitelist in configuration
- Firebase Auth integration with custom claims
- Middleware validation on all admin routes
- Audit logging of admin access
- Secure API endpoints with authentication checks

## Epic 2: Client Management

### User Story 2.1: View Client List
**As an** administrator  
**I want to** view all clients in a searchable, filterable table  
**So that** I can quickly find and manage client information  

**Acceptance Criteria:**
- Paginated client list with key information (name, email, phone, brand, status)
- Real-time search by name, email, or phone
- Filter by brand (Heiwa House, Freedom Routes)
- Filter by status (Active, Inactive)
- Sort by name, registration date, last booking date
- Responsive table design for mobile devices
- Loading states and error handling

### User Story 2.2: Add New Client
**As an** administrator  
**I want to** add new clients to the system  
**So that** I can maintain accurate client records  

**Acceptance Criteria:**
- Client creation form with validation
- Required fields: name, email, phone, brand
- Optional fields: notes
- Email format validation
- Duplicate email prevention
- Success confirmation with toast notification
- Form reset after successful creation
- Keyboard shortcuts for quick entry

### User Story 2.3: Edit Client Information
**As an** administrator  
**I want to** update client information  
**So that** I can keep records current and accurate  

**Acceptance Criteria:**
- Edit form pre-populated with existing data
- Partial update capability (only changed fields)
- Validation on all updated fields
- Confirmation dialog for sensitive changes
- Audit trail of changes
- Real-time updates in the client list

### User Story 2.4: Client Statistics Dashboard
**As an** administrator  
**I want to** see client statistics and metrics  
**So that** I can understand client base growth and engagement  

**Acceptance Criteria:**
- Total client count
- Active vs inactive client breakdown
- New clients this month
- Clients with booking history
- Brand distribution (Heiwa House vs Freedom Routes)
- Client retention metrics
- Visual charts and progress indicators

### User Story 2.5: CSV Import/Export
**As an** administrator  
**I want to** import clients from CSV files and export client data  
**So that** I can migrate data and backup client information  

**Acceptance Criteria:**
- CSV import with validation
- Error reporting for invalid rows
- Duplicate detection during import
- Export filtered or all client data
- CSV format with proper headers
- Progress indicators for large imports
- Import history and rollback capability

### User Story 2.6: Bulk Client Operations
**As an** administrator  
**I want to** perform bulk operations on multiple clients  
**So that** I can efficiently manage client records  

**Acceptance Criteria:**
- Multi-select clients with checkboxes
- Bulk status updates (activate/deactivate)
- Bulk export of selected clients
- Bulk archive/delete with confirmation
- Clear selection and operation feedback
- Undo capability for accidental operations

## Epic 3: Booking Management

### User Story 3.1: View Booking List
**As an** administrator  
**I want to** view all bookings in a comprehensive list  
**So that** I can track reservations and manage schedules  

**Acceptance Criteria:**
- Booking list with key details (ID, client count, items, total, status, dates)
- Search by booking ID or client name
- Filter by status (pending, confirmed, cancelled)
- Filter by date range
- Sort by creation date, check-in date, total amount
- Real-time status updates
- Mobile-responsive design

### User Story 3.2: Create New Booking
**As an** administrator  
**I want to** create bookings for clients  
**So that** I can manage reservations efficiently  

**Acceptance Criteria:**
- Booking creation wizard
- Client selection (existing or new client creation)
- Room/surf camp selection with availability checking
- Add-on selection and quantity management
- Pricing calculation with tax handling
- Payment method tracking
- Notes and special requests
- Confirmation step with booking summary

### User Story 3.3: Booking Status Management
**As an** administrator  
**I want to** update booking statuses  
**So that** I can track booking lifecycle and communicate with clients  

**Acceptance Criteria:**
- Status updates (pending → confirmed → completed)
- Cancellation with reason tracking
- Automatic email notifications to clients
- Status change history and audit trail
- Bulk status updates for multiple bookings
- Status-based filtering and reporting

### User Story 3.4: Booking Financial Tracking
**As an** administrator  
**I want to** track booking revenue and payments  
**So that** I can monitor business financial performance  

**Acceptance Criteria:**
- Revenue tracking by booking status
- Payment method breakdown
- Outstanding payment identification
- Refund tracking and processing
- Financial reporting dashboard
- Integration with accounting systems

### User Story 3.5: Booking Calendar Integration
**As an** administrator  
**I want to** view bookings on a calendar  
**So that** I can visualize occupancy and schedule conflicts  

**Acceptance Criteria:**
- Calendar view with booking blocks
- Color coding by booking status
- Click to view booking details
- Drag and drop for date changes
- Conflict detection and warnings
- Month/week/day view options
- Export calendar data

## Epic 4: Room Management

### User Story 4.1: Room Inventory Management
**As an** administrator  
**I want to** manage room inventory and details  
**So that** I can maintain accurate accommodation listings  

**Acceptance Criteria:**
- Room creation with detailed information
- Room types (standard, premium, dorm)
- Capacity and bedding configuration
- Amenity management (WiFi, AC, kitchen, etc.)
- Image upload and gallery
- Room status (active, maintenance, inactive)
- Bulk room operations

### User Story 4.2: Dynamic Pricing Configuration
**As an** administrator  
**I want to** set up flexible pricing for rooms  
**So that** I can optimize revenue based on seasons and demand  

**Acceptance Criteria:**
- Base pricing configuration
- Seasonal pricing (peak, off-season, special events)
- Dynamic pricing based on occupancy
- Per-bed vs whole room pricing models
- Minimum stay requirements
- Early bird and last-minute discounts
- Currency and tax handling

### User Story 4.3: Room Availability Management
**As an** administrator  
**I want to** manage room availability and block dates  
**So that** I can prevent overbooking and manage maintenance  

**Acceptance Criteria:**
- Real-time availability checking
- Block dates for maintenance or special events
- Availability calendar view
- Bulk availability updates
- Integration with booking system
- Automatic availability updates on booking changes

### User Story 4.4: Room Analytics
**As an** administrator  
**I want to** analyze room performance and utilization  
**So that** I can make data-driven decisions about pricing and inventory  

**Acceptance Criteria:**
- Occupancy rate tracking
- Revenue per room analysis
- Popular room types identification
- Seasonal demand patterns
- Booking lead time analysis
- Comparative performance metrics

## Epic 5: Surf Camp Management

### User Story 5.1: Surf Camp Session Creation
**As an** administrator  
**I want to** create and manage surf camp sessions  
**So that** I can organize group surfing activities  

**Acceptance Criteria:**
- Session creation with date ranges
- Instructor assignment
- Skill level targeting (beginner, intermediate, advanced)
- Maximum participant limits
- Pricing per session or package
- Equipment requirements tracking
- Session status management

### User Story 5.2: Surf Camp Registration
**As an** administrator  
**I want to** manage participant registration for surf camps  
**So that** I can track enrollment and capacity  

**Acceptance Criteria:**
- Participant registration system
- Waitlist management for full sessions
- Registration deadlines and policies
- Group booking discounts
- Cancellation and refund policies
- Equipment rental integration
- Skill assessment and placement

### User Story 5.3: Surf Camp Scheduling
**As an** administrator  
**I want to** schedule surf camp activities and logistics  
**So that** I can ensure smooth operations  

**Acceptance Criteria:**
- Daily activity scheduling
- Instructor availability management
- Equipment distribution planning
- Transportation coordination
- Weather contingency planning
- Emergency contact management
- Session progress tracking

### User Story 5.4: Surf Camp Performance Tracking
**As an** administrator  
**I want to** track surf camp performance and feedback  
**So that** I can improve future sessions  

**Acceptance Criteria:**
- Participant satisfaction surveys
- Skill progression tracking
- Revenue and profitability analysis
- Instructor performance metrics
- Equipment utilization tracking
- Repeat business analysis
- Marketing campaign effectiveness

## Epic 6: Add-on Services Management

### User Story 6.1: Service Catalog Management
**As an** administrator  
**I want to** manage additional services and equipment  
**So that** I can offer comprehensive packages to clients  

**Acceptance Criteria:**
- Service creation and categorization
- Equipment rental management
- Food and beverage options
- Transportation services
- Activity add-ons (surf lessons, yoga, etc.)
- Pricing and availability management
- Image and description management

### User Story 6.2: Add-on Inventory Tracking
**As an** administrator  
**I want to** track add-on inventory and availability  
**So that** I can manage stock levels and prevent overselling  

**Acceptance Criteria:**
- Inventory level monitoring
- Low stock alerts
- Automatic availability updates
- Equipment maintenance scheduling
- Seasonal inventory adjustments
- Supplier management integration

### User Story 6.3: Dynamic Add-on Pricing
**As an** administrator  
**I want to** set flexible pricing for add-on services  
**So that** I can optimize revenue from additional services  

**Acceptance Criteria:**
- Base pricing configuration
- Volume discounts for multiple items
- Package deal pricing
- Seasonal pricing adjustments
- Tax and fee calculations
- Currency conversion for international clients

### User Story 6.4: Add-on Analytics
**As an** administrator  
**I want to** analyze add-on service performance  
**So that** I can optimize service offerings  

**Acceptance Criteria:**
- Popular add-on identification
- Revenue contribution analysis
- Customer preference tracking
- Seasonal demand patterns
- Profit margin analysis
- Cross-selling opportunity identification

## Epic 7: Calendar & Scheduling

### User Story 7.1: Integrated Calendar View
**As an** administrator  
**I want to** view all bookings and events on a calendar  
**So that** I can manage schedules efficiently  

**Acceptance Criteria:**
- Comprehensive calendar interface
- Multiple view options (month, week, day)
- Color-coded events by type
- Booking blocks with key information
- Surf camp session visualization
- Maintenance and blocked date indication
- Real-time updates

### User Story 7.2: Schedule Conflict Detection
**As an** administrator  
**I want to** detect and prevent scheduling conflicts  
**So that** I can avoid overbooking and operational issues  

**Acceptance Criteria:**
- Automatic conflict detection
- Visual conflict warnings
- Alternative suggestion system
- Manual conflict override capability
- Conflict history tracking
- Proactive conflict prevention

### User Story 7.3: Calendar Export and Sharing
**As an** administrator  
**I want to** export calendar data and share schedules  
**So that** I can coordinate with staff and clients  

**Acceptance Criteria:**
- Calendar export in multiple formats (ICS, PDF)
- Shareable calendar links
- Staff-specific calendar views
- Client booking confirmations
- Integration with external calendars
- Automated schedule updates

### User Story 7.4: Resource Scheduling
**As an** administrator  
**I want to** schedule resources and staff  
**So that** I can optimize operations and staffing  

**Acceptance Criteria:**
- Staff scheduling and availability
- Equipment allocation tracking
- Room cleaning schedule management
- Maintenance schedule coordination
- Automated scheduling suggestions
- Resource utilization analytics

## Epic 8: Analytics & Reporting

### User Story 8.1: Business Performance Dashboard
**As an** administrator  
**I want to** view key business metrics on a dashboard  
**So that** I can monitor overall business health  

**Acceptance Criteria:**
- Revenue tracking and forecasting
- Occupancy rate monitoring
- Client acquisition and retention metrics
- Popular service identification
- Seasonal trend analysis
- Goal vs actual performance tracking
- Customizable dashboard widgets

### User Story 8.2: Financial Reporting
**As an** administrator  
**I want to** generate financial reports  
**So that** I can track profitability and cash flow  

**Acceptance Criteria:**
- Revenue reports by period
- Expense tracking and categorization
- Profit and loss statements
- Payment method analysis
- Outstanding receivable tracking
- Tax preparation support
- Accounting software integration

### User Story 8.3: Operational Reports
**As an** administrator  
**I want to** analyze operational efficiency  
**So that** I can optimize business processes  

**Acceptance Criteria:**
- Occupancy and utilization reports
- Staff productivity metrics
- Equipment maintenance tracking
- Customer satisfaction analysis
- Process bottleneck identification
- Quality control metrics
- Continuous improvement tracking

### User Story 8.4: Marketing Analytics
**As an** administrator  
**I want to** track marketing campaign effectiveness  
**So that** I can optimize marketing spend  

**Acceptance Criteria:**
- Campaign ROI tracking
- Customer acquisition cost analysis
- Brand performance comparison
- Seasonal marketing effectiveness
- Customer lifetime value analysis
- Referral and repeat business tracking
- Marketing channel optimization

## Epic 9: System Administration

### User Story 9.1: User Management
**As a** system administrator  
**I want to** manage admin user accounts  
**So that** I can control system access and permissions  

**Acceptance Criteria:**
- Admin user creation and deactivation
- Role-based access control
- Permission management
- User activity monitoring
- Password policy enforcement
- Two-factor authentication setup
- Access audit logging

### User Story 9.2: Data Backup and Recovery
**As a** system administrator  
**I want to** backup and restore system data  
**So that** I can protect against data loss  

**Acceptance Criteria:**
- Automated daily backups
- Manual backup creation
- Data restoration procedures
- Backup integrity verification
- Offsite backup storage
- Recovery time objective compliance
- Backup testing procedures

### User Story 9.3: System Monitoring
**As a** system administrator  
**I want to** monitor system health and performance  
**So that** I can ensure reliable operation  

**Acceptance Criteria:**
- System uptime monitoring
- Performance metric tracking
- Error logging and alerting
- Database health monitoring
- Security threat detection
- Automated maintenance scheduling
- Incident response procedures

### User Story 9.4: Integration Management
**As a** system administrator  
**I want to** manage third-party integrations  
**So that** I can extend system capabilities  

**Acceptance Criteria:**
- Payment processor integration
- Email service provider setup
- Calendar system synchronization
- Accounting software connection
- CRM system integration
- API key and credential management
- Integration monitoring and error handling

## Epic 10: Mobile Responsiveness

### User Story 10.1: Mobile Dashboard Access
**As an** administrator using a mobile device  
**I want to** access the dashboard on my phone  
**So that** I can manage the business while on the go  

**Acceptance Criteria:**
- Responsive design for all screen sizes
- Touch-friendly interface elements
- Optimized navigation for mobile
- Readable text and data tables on small screens
- Fast loading on mobile networks
- Offline capability for critical functions

### User Story 10.2: Mobile Booking Management
**As an** administrator using a mobile device  
**I want to** manage bookings from my phone  
**So that** I can handle urgent booking requests anywhere  

**Acceptance Criteria:**
- Mobile-optimized booking forms
- Quick status updates
- Emergency contact access
- Client information on the go
- Mobile payment processing
- SMS notification integration

### User Story 10.3: Mobile Calendar Access
**As an** administrator using a mobile device  
**I want to** view and manage the calendar on my phone  
**So that** I can check schedules and availability while traveling  

**Acceptance Criteria:**
- Mobile calendar interface
- Touch-based navigation
- Quick booking creation
- Schedule conflict alerts
- Mobile-optimized event details
- Calendar sharing via mobile

## Epic 11: Data Privacy & Compliance

### User Story 11.1: GDPR Compliance
**As a** business owner  
**I want to** comply with data privacy regulations  
**So that** I can legally collect and process client data  

**Acceptance Criteria:**
- Consent management for data collection
- Data subject access request handling
- Right to erasure implementation
- Data processing documentation
- Privacy policy integration
- Cookie consent management
- Data breach notification procedures

### User Story 11.2: Data Security
**As a** business owner  
**I want to** protect sensitive client and business data  
**So that** I can maintain trust and comply with security standards  

**Acceptance Criteria:**
- Data encryption at rest and in transit
- Secure authentication mechanisms
- Regular security audits
- Access control and permission management
- Secure data backup procedures
- Incident response planning
- Employee data handling training

### User Story 11.3: Audit Trail
**As a** business owner  
**I want to** track all data changes and access  
**So that** I can maintain accountability and detect unauthorized access  

**Acceptance Criteria:**
- Comprehensive audit logging
- User action tracking
- Data change history
- Access attempt logging
- Automated anomaly detection
- Audit report generation
- Compliance reporting tools

## Epic 12: Customer Experience

### User Story 12.1: Client Portal Integration
**As a** client  
**I want to** access my booking information  
**So that** I can manage my reservations and preferences  

**Acceptance Criteria:**
- Client login system
- Booking history access
- Upcoming booking management
- Preference profile management
- Communication preferences
- Payment method storage
- Booking modification requests

### User Story 12.2: Automated Communications
**As a** client  
**I want to** receive timely updates about my bookings  
**So that** I can stay informed and prepared  

**Acceptance Criteria:**
- Booking confirmation emails
- Check-in reminders
- Payment reminders
- Cancellation notifications
- Special offer communications
- Survey and feedback requests
- Emergency communication system

### User Story 12.3: Self-Service Options
**As a** client  
**I want to** manage my bookings independently  
**So that** I can make changes without contacting staff  

**Acceptance Criteria:**
- Online booking modifications
- Cancellation requests
- Add-on service purchases
- Payment processing
- Document upload (waivers, IDs)
- Communication preferences
- Account management

This comprehensive set of user stories covers all aspects of the Heiwa House admin dashboard, from basic CRUD operations to advanced analytics, mobile responsiveness, and regulatory compliance. Each user story includes clear acceptance criteria to guide development and testing.

