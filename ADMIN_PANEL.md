# Admin Panel Documentation

## Overview
The Doon App admin panel provides comprehensive management tools for administrators to oversee the platform operations, including user management, bookings, destinations, reviews, reports, and system health monitoring.

## Features

### 1. Dashboard
- Real-time statistics (total users, bookings, revenue, ratings)
- Booking trends visualization
- Quick stats overview

**Files:**
- `resources/js/pages/admin/DashboardPage.jsx`
- Backend: `app/Http/Controllers/AdminController.php::dashboardStats()`

### 2. Users Management
- List all users with search functionality
- View user details (name, email, role, join date, booking count)
- Change user roles (user/admin)
- Delete users

**Files:**
- `resources/js/pages/admin/UsersPage.jsx`
- Routes: `/admin/users`, `/admin/users/{id}`

### 3. Bookings Management
- View all bookings with filters (all, confirmed, pending, cancelled)
- See booking details (ID, user, destination, dates, status, amount)
- Update booking status
- Pagination support

**Files:**
- `resources/js/pages/admin/BookingsPage.jsx`
- Routes: `/admin/bookings`, `/admin/bookings/{id}`

### 4. Destinations Management
- List all destinations
- View destination info (name, province, category, status)
- Add/Edit destinations
- Delete destinations with confirmation

**Files:**
- `resources/js/pages/admin/DestinationsPage.jsx`
- Routes: `/admin/destinations`, `/admin/destinations/{id}`

### 5. Categories Management
- List all categories
- Create new categories with name and description
- Edit existing categories
- Delete categories with confirmation
- Form-based management

**Files:**
- `resources/js/pages/admin/CategoriesPage.jsx`
- Routes: `/admin/categories`, `/admin/categories/{id}`

### 6. Reviews Moderation
- View all reviews with approval status
- Filter reviews (all, pending, approved)
- Approve pending reviews
- Delete inappropriate reviews
- See review details (destination, author, rating, comment)

**Files:**
- `resources/js/pages/admin/ReviewsPage.jsx`
- Routes: `/admin/reviews`, `/admin/reviews/{id}`

### 7. Promo Codes Management
- Create promotional codes
- Set discount types (percentage/fixed amount)
- Limit code usage
- Set expiration dates
- View usage statistics
- Delete codes

**Files:**
- `resources/js/pages/admin/PromoCodesPage.jsx`
- Routes: `/admin/promo-codes`, `/admin/promo-codes/{id}`

### 8. Media Management
- Upload files (images)
- Gallery view of uploaded files
- Delete media files
- Storage management

**Files:**
- `resources/js/pages/admin/MediaManagementPage.jsx`
- Routes: `/admin/media`, `/admin/media/{id}`

### 9. Notifications
- Send notifications to users
- Target recipients (all users, admins, regular users)
- Option to send via email
- View notification history
- Track sent count

**Files:**
- `resources/js/pages/admin/NotificationsPage.jsx`
- Routes: `/admin/notifications`, `/admin/notifications/send`

### 10. Reports & Analytics
- Generate custom reports
- Filter by date range
- Report types: Bookings, Revenue, Users
- Export reports as CSV
- View detailed statistics

**Files:**
- `resources/js/pages/admin/ReportsPage.jsx`
- Routes: `/admin/reports`, `/admin/reports/export`

### 11. Activity Logs
- Track admin actions
- Filter by activity type (login, create, update, delete)
- View timestamp and IP address
- User action history
- Audit trail

**Files:**
- `resources/js/pages/admin/ActivityLogsPage.jsx`
- Routes: `/admin/activity-logs`

### 12. System Health Monitoring
- Real-time system status
- Database health and response time
- Server metrics (CPU, memory, disk)
- Cache performance
- Queue status
- Email service status
- Storage usage
- Auto-refresh every 5 seconds

**Files:**
- `resources/js/pages/admin/SystemHealthPage.jsx`
- Routes: `/admin/system/health`

### 13. Settings
- Configure app information
- Update app name, email, phone, address
- Maintenance mode toggle
- Global configuration

**Files:**
- `resources/js/pages/admin/SettingsPage.jsx`
- Routes: `/admin/settings`

## Architecture

### Frontend Components

#### AdminLayout (AdminLayout.jsx)
Main layout component with:
- Collapsible sidebar with navigation
- Top bar with page title and status
- Menu items with icons
- Logout button
- Role verification

#### Page Components
Each feature has a dedicated page component that handles:
- Data fetching with React Query
- User interactions
- Mutations for create/update/delete
- Toast notifications
- Pagination

#### Shared UI Components
- `Pagination.jsx` - Page navigation with results counter
- `EmptyState.jsx` - Placeholder for empty lists
- `StatCard.jsx` - Dashboard statistics display
- `Chart.jsx` - Data visualization using Recharts
- `ConfirmationDialog.jsx` - Delete confirmations

### Backend Structure

#### Routes (routes/admin.php)
Protected admin API endpoints using `AdminMiddleware`

#### Controller (app/Http/Controllers/AdminController.php)
Handles all admin operations:
- Dashboard stats and charts
- User management
- Booking operations
- Destination management
- Review moderation
- Settings management
- Report generation
- System health checks

#### Middleware (app/Http/Middleware/AdminMiddleware.php)
Ensures only admins can access admin routes

## API Endpoints

### Dashboard
- `GET /api/admin/dashboard/stats` - Statistics
- `GET /api/admin/dashboard/chart` - Chart data

### Users
- `GET /api/admin/users` - List users (paginated, searchable)
- `PATCH /api/admin/users/{id}` - Update user role
- `DELETE /api/admin/users/{id}` - Delete user

### Bookings
- `GET /api/admin/bookings` - List bookings with optional status filter
- `PATCH /api/admin/bookings/{id}` - Update booking status

### Destinations
- `GET /api/admin/destinations` - List destinations
- `DELETE /api/admin/destinations/{id}` - Delete destination

### Reviews
- `GET /api/admin/reviews` - List reviews with optional status filter
- `PATCH /api/admin/reviews/{id}` - Approve review
- `DELETE /api/admin/reviews/{id}` - Delete review

### Categories
- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create category
- `PATCH /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category

### Promo Codes
- `GET /api/admin/promo-codes` - List codes (paginated)
- `POST /api/admin/promo-codes` - Create code
- `DELETE /api/admin/promo-codes/{id}` - Delete code

### Media
- `GET /api/admin/media` - List files (paginated)
- `POST /api/admin/media/upload` - Upload files
- `DELETE /api/admin/media/{id}` - Delete file

### Notifications
- `GET /api/admin/notifications` - List notifications
- `POST /api/admin/notifications/send` - Send notification

### Reports
- `GET /api/admin/reports` - Generate report (queryable by type, date range)
- `GET /api/admin/reports/export` - Export as CSV

### Activity Logs
- `GET /api/admin/activity-logs` - Get activity history (filterable)

### Settings
- `GET /api/admin/settings` - Get app settings
- `POST /api/admin/settings` - Update settings

### System Health
- `GET /api/admin/system/health` - System status

## Usage

### Access Admin Panel
1. Log in with admin account
2. Navigate to `/admin` route
3. Admin role is verified via middleware

### Navigation
- Use sidebar to navigate between sections
- Click menu items with icons for quick access
- Top bar shows current page title
- Collapse sidebar for more content space

### Common Operations

#### Adding a Category
1. Go to Categories section
2. Fill in category name and description
3. Click "Create"

#### Approving a Review
1. Go to Reviews section
2. Filter by "Pending" if needed
3. Click "Approve" button
4. Review moves to approved status

#### Generating a Report
1. Go to Reports section
2. Select report type
3. Choose start and end dates
4. Click "Generate Report"
5. Optionally export as CSV

## Styling

All components use CSS variables:
- `--pr` - Primary color
- `--bg` - Background
- `--wh` - White/Card background
- `--bd` - Border
- `--tx` - Text primary
- `--tx2` - Text secondary
- `--tx3` - Text tertiary
- `--er` - Error color
- `--r1` - Border radius small
- `--r2` - Border radius medium

Utility classes:
- `.s-btn` - Standard button
- `.pill` - Pill-shaped badge
- `.p-g`, `.p-y`, `.p-r` - Pill colors (green, yellow, red)
- `.form-input` - Input styling
- `.form-label` - Label styling

## Authentication

Admin routes are protected by:
1. Authentication check (logged in)
2. Role verification (role === 'admin')
3. AdminMiddleware on backend

Attempting to access without proper permissions redirects to home page.

## React Query Setup

All data fetching uses React Query for:
- Automatic caching
- Query invalidation
- Deferred mutations
- Loading states
- Error handling

Example query key pattern: `['admin-{feature}', page, filters]`

## Future Enhancements

- Advanced analytics and charts
- Bulk actions (delete multiple items)
- Scheduled reports
- Real-time notifications
- User activity tracking
- Advanced search filters
- Data export to multiple formats
- API key management
- Admin versioning/audit logs
- Custom dashboard widgets
