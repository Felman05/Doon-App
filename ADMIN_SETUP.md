# Admin Panel Setup & Integration Guide

## Installation & Setup

### Step 1: Verify File Structure
Ensure all admin panel files exist:

```
resources/js/pages/admin/
├── AdminLayout.jsx              # Main layout container
├── AdminDashboard.jsx           # Router component
├── DashboardPage.jsx            # Statistics & analytics
├── UsersPage.jsx                # User management
├── BookingsPage.jsx             # Booking management
├── DestinationsPage.jsx         # Destination management
├── CategoriesPage.jsx           # Category management
├── ReviewsPage.jsx              # Review moderation
├── PromoCodesPage.jsx           # Promotional codes
├── MediaManagementPage.jsx      # File management
├── NotificationsPage.jsx        # Push notifications
├── ReportsPage.jsx              # Analytics & reports
├── ActivityLogsPage.jsx         # Audit logs
└── SystemHealthPage.jsx         # System monitoring

app/Http/Controllers/
└── AdminController.php          # API logic

routes/
├── api.php                      # API routes (updated)
└── admin.php                    # Admin routes (created)

app/Http/Middleware/
└── AdminMiddleware.php          # Admin authorization
```

### Step 2: Verify Dependencies
The admin panel requires these npm packages (already installed):
- `react` & `react-dom`
- `react-router-dom`
- `@tanstack/react-query`
- `recharts` (for charts)
- `axios` (for API calls)

If missing, install:
```bash
npm install @tanstack/react-query recharts axios
```

### Step 3: API Configuration
The admin API automatically uses the axios instance from `src/lib/axios.js`. Ensure it's configured correctly:

```javascript
// resources/js/lib/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    }
});

// Add auth token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

### Step 4: Context Setup
Verify Toast and Auth contexts exist in:
- `context/ToastContext.jsx`
- `context/AuthContext.jsx`

The admin pages use:
```javascript
const { addToast } = useContext(ToastContext);
const { user, logout } = useAuth();
```

### Step 5: Routing
Admin routes are already configured in `routes/AppRouter.jsx`:

```javascript
<Route
    path="/admin/*"
    element={
        <ProtectedRoute>
            <RoleRoute role="admin">
                <AdminDashboard />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
```

The frontend router handles these paths automatically.

## Database Setup

### Create Required Tables
If not already created, run these migrations:

```bash
php artisan make:migration create_activity_logs_table
php artisan make:migration create_categories_table
php artisan make:migration create_promo_codes_table
php artisan make:migration create_notifications_table
```

### Sample Migrations

#### Activity Logs
```php
Schema::create('activity_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->string('action');
    $table->string('resource_type');
    $table->unsignedBigInteger('resource_id');
    $table->string('ip_address')->nullable();
    $table->timestamps();
});
```

#### Categories
```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

#### Promo Codes
```php
Schema::create('promo_codes', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique();
    $table->enum('discount_type', ['percentage', 'fixed']);
    $table->decimal('discount_value', 10, 2);
    $table->integer('max_uses')->nullable();
    $table->integer('uses_count')->default(0);
    $table->timestamp('expiry_date')->nullable();
    $table->timestamps();
});
```

## Environment Configuration

### .env Settings
```
APP_NAME="Doon"
APP_MAINTENANCE_MODE=false
CACHE_DRIVER=redis  # For admin cache operations
QUEUE_CONNECTION=redis  # For notifications
```

## Testing Admin Access

### 1. Create Admin User
```php
// In tinker or seeder
User::create([
    'name' => 'Admin User',
    'email' => 'admin@doon.app',
    'password' => Hash::make('password'),
    'role' => 'admin',
    'email_verified_at' => now(),
]);
```

### 2. Login & Access
1. Go to `/signin`
2. Log in with admin credentials
3. Navigate to `/admin` or after login, you'll be redirected

### 3. Verify Access
- Sidebar should show all admin menu items
- Dashboard loads with stats
- Can navigate between pages

## Customization

### Adding New Admin Page

1. Create new component in `resources/js/pages/admin/NewPage.jsx`:
```jsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';

export default function NewPage() {
    const { addToast } = useContext(ToastContext);
    // Your page logic
    return <div>{/* Page content */}</div>;
}
```

2. Add route to `AdminDashboard.jsx`:
```jsx
import NewPage from './NewPage';

const adminRoutes = [
    // ... existing routes
    { path: 'new-page', label: 'New Page', icon: '🆕' },
];

// In Routes
<Route path="/new-page" element={<NewPage />} />
```

3. Add API endpoint to `routes/api.php`:
```php
Route::get('/new-page', [AdminController::class, 'getNewPage']);
```

4. Add controller method:
```php
public function getNewPage() {
    return response()->json(['data' => []]);
}
```

### Styling Customization
All components use CSS variables defined in `resources/css/app.css`. Modify these variables to change colors:

```css
:root {
    --pr: #3b82f6;      /* Primary */
    --bg: #f8fafc;      /* Background */
    --wh: #ffffff;      /* White */
    --bd: #e2e8f0;      /* Border */
    --tx: #1e293b;      /* Text */
    --tx2: #64748b;     /* Text secondary */
    --tx3: #94a3b8;     /* Text tertiary */
    --er: #ef4444;      /* Error */
}
```

## Troubleshooting

### Admin Routes not Loading
- Check `AdminMiddleware` in `app/Http/Middleware/AdminMiddleware.php`
- Verify user has `role == 'admin'`
- Check auth token is being sent in request headers

### API 403 Forbidden
- Ensure user is authenticated
- Verify `admin` middleware is applied to routes
- Check `AdminMiddleware.php` allows access

### Data not Displaying
- Open browser DevTools → Network tab
- Check if API requests are returning 200 status
- Look for error responses in Console
- Verify API endpoints match frontend requests

### Styling Issues
- Clear browser cache (Ctrl+Shift+Del)
- Rebuild assets: `npm run build`
- Check CSS variable definitions

### Toast Notifications Not Showing
- Verify `ToastContext` is provided in app root
- Check `<Toast />` component is rendered
- Test: `addToast?.('Test message', 'success')`

## Performance Optimization

### Query Caching
React Query automatically caches queries. Cache times can be adjusted:

```jsx
useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users'),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Pagination
All list pages use pagination to reduce data:
```jsx
const { data: { data: items = [], last_page = 1 } } = useQuery({
    queryKey: ['admin-items', page],
    queryFn: async () => {
        const { data } = await api.get('/items', { params: { page } });
        return data.data;
    },
});
```

### Lazy Loading
Charts and heavy components:
```jsx
const Chart = lazy(() => import('../../components/ui/Chart'));

<Suspense fallback={<div>Loading...</div>}>
    <Chart data={data} />
</Suspense>
```

## Security Considerations

1. **Role-Based Access**: Only users with `role == 'admin'` can access admin routes
2. **Middleware Protection**: `AdminMiddleware` checks user role on each request
3. **CSRF Protection**: Laravel automatically handles CSRF tokens
4. **Sanitization**: User inputs are validated on backend
5. **Audit Logs**: Track all admin actions in activity logs

## Backup & Migration

### Export Data
Use Reports page to export data as CSV:
- Go to Reports section
- Select data type and date range
- Click "Export CSV"

### Database Backup
```bash
php artisan backup:run
```

## Monitoring

Use System Health page to monitor:
- Database connectivity and performance
- Server resources (CPU, memory, disk)
- Cache hit rates
- Queue status
- Email service status

## Support & Documentation

- Frontend: See `ADMIN_PANEL.md` for feature documentation
- API: Check `routes/api.php` for all available endpoints
- Models: Review model relationships in `app/Models/`
- Styling: Reference CSS variables in `resources/css/app.css`
