# Inventory Management Frontend

React frontend for Inventory Management SaaS with Vite, TailwindCSS, and backend API integration.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Custom fetch-based API client
- **Icons**: Lucide React
- **Node Version**: 18+

## Features

### Core Features
- **Dashboard**: Real-time analytics with charts and KPIs
- **Products**: Full CRUD operations with barcode support and inventory tracking
- **Categories**: Organize products into categories
- **Warehouses**: Multi-warehouse support with location management
- **Suppliers**: Manage supplier relationships
- **Customers**: Customer relationship management
- **Inventory**: Stock movements, adjustments, and low stock alerts
- **Purchases**: Purchase order management
- **Sales**: Sales order processing
- **Reports**: Analytics and reporting

### Advanced Features
- **Serial Number Tracking**: Track individual items by serial number
- **Batch/Expiration Tracking**: Track product batches and expiration dates
- **Quotes & Estimates**: Create and convert quotes to sales
- **Returns & Refunds**: Manage product returns and refunds
- **Invoicing**: Generate and manage invoices with payment tracking
- **Role-Based Access Control (RBAC)**: User roles and permissions
- **Audit Logs**: Track all system activities
- **Notifications**: System notifications for important events
- **Settings**: Configure company settings, currency, tax rates
- **Global Search**: Search across products, customers, suppliers, sales, and purchases

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Barento999/inventory-management.git
cd inventory-management-SaaS/frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

4. **Update `.env` with your API URL**:
```env
VITE_API_URL=http://localhost:8000/api
```

5. **Start the development server**:
```bash
npm run dev
```

6. **Open your browser** and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── assets/              # Static assets (images, icons)
├── components/          # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, Navbar)
│   ├── shared/          # Shared components (PageHeader, FilterBar)
│   └── ui/              # UI components (Button, Input, Table, etc.)
├── context/             # React Context providers
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   ├── ToastContext.jsx
│   └── DataRefreshContext.jsx
├── hooks/               # Custom React hooks
│   └── useApi.js        # API data fetching hook
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── products/        # Product management
│   ├── categories/      # Category management
│   ├── warehouses/      # Warehouse management
│   ├── suppliers/       # Supplier management
│   ├── customers/       # Customer management
│   ├── serial-numbers/  # Serial number tracking
│   ├── batches/         # Batch management
│   ├── quotes/          # Quote management
│   ├── returns/         # Return management
│   ├── invoices/        # Invoice management
│   ├── users/           # User management
│   ├── roles/           # Role management
│   ├── audit-logs/      # Audit log viewing
│   ├── dashboard/       # Dashboard
│   ├── inventory/       # Inventory management
│   ├── purchases/       # Purchase orders
│   ├── sales/           # Sales orders
│   ├── reports/         # Reports and analytics
│   └── settings/        # Application settings
├── services/            # API layer
│   ├── api.js           # API client and service functions
│   └── store.js         # Legacy data store (deprecated)
├── App.jsx              # Main App component
├── main.jsx             # Application entry point
└── index.css            # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend is connected to the backend API through a custom API client (`src/services/api.js`). All data is fetched from the PostgreSQL database via the backend API.

### API Client

The API client provides a consistent interface for making HTTP requests:

```javascript
import { apiClient } from './services/api';

// GET request
const data = await apiClient.get('/products');

// POST request
const result = await apiClient.post('/products', productData);

// PUT request
const result = await apiClient.put('/products/1', productData);

// DELETE request
await apiClient.delete('/products/1');
```

### Authentication

The frontend uses JWT token-based authentication:

1. **Login**: User credentials sent to `/api/auth/login`
2. **Token Storage**: JWT token stored in localStorage
3. **Token Usage**: Token included in Authorization header for all API requests
4. **Token Refresh**: Automatic token refresh on expiration

### Default Users

- **Admin**: admin@inventory.com (full access)
- **Manager**: manager@inventory.com (manage inventory and sales)
- **User**: user@inventory.com (limited access)

Default password: `password123` (change in production)

## Features Overview

### Inventory Management
- Multi-warehouse support
- Serial number tracking for high-value items
- Batch/expiration date tracking
- Low stock alerts
- Stock movements with reasons
- Real-time stock level updates

### Sales & Purchases
- Quote to sale conversion
- Purchase order management
- Invoice generation
- Payment tracking
- Return/refund processing

### Reporting
- Monthly sales charts
- Top products analysis
- Inventory valuation
- Low stock reports
- Dashboard statistics

### User Management
- Role-based access control (Admin, Manager, Staff, Viewer)
- Custom permissions
- User status management
- Audit logging

### Settings
- Company information
- Tax configuration
- Currency and timezone
- Low stock threshold configuration

## Components

### Layout Components
- **Sidebar**: Navigation menu with role-based menu items
- **Navbar**: Top navigation with user menu and notifications
- **PageHeader**: Page title with breadcrumbs and actions

### Shared Components
- **FilterBar**: Search and filter controls
- **DataTable**: Reusable data table with pagination
- **Modal**: Modal dialog component
- **Form**: Form component with validation

### UI Components
- **Button**: Button component with variants
- **Input**: Input component with validation
- **Select**: Select dropdown component
- **Badge**: Badge component for status display
- **Card**: Card component for content grouping

## State Management

The application uses React Context API for state management:

- **AuthContext**: User authentication state
- **ThemeContext**: Theme (dark/light mode)
- **ToastContext**: Toast notifications
- **DataRefreshContext**: Data refresh triggers

## Custom Hooks

### useApi Hook

Custom hook for API data fetching with loading and error states:

```javascript
const { data, loading, error, refetch } = useApi(
  () => productsApi.list({ page: 1, pageSize: 10 }),
  []
);
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Code Style

```bash
# Run linter
npm run lint
```

### Troubleshooting

#### API Connection Issues
- Ensure backend is running on http://localhost:8000
- Check VITE_API_URL in .env file
- Verify backend CORS configuration

#### Build Issues
- Clear node_modules: `rm -rf node_modules`
- Reinstall dependencies: `npm install`
- Clear Vite cache: `rm -rf .vite`

## Deployment

### Production Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Serve with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Environment Variables in Production

Set the API URL to your production backend:

```env
VITE_API_URL=https://api.your-domain.com/api
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue in the GitHub repository.
