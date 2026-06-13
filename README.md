# InventoryPro - Inventory Management SaaS

A comprehensive inventory management SaaS application built with React 19, Vite, and TailwindCSS.

## Features

### Core Features
- **Dashboard**: Real-time analytics with charts and KPIs
- **Products**: Full CRUD operations with barcode support, variants, and inventory tracking
- **Categories**: Organize products into categories
- **Warehouses**: Multi-warehouse support with location management
- **Suppliers**: Manage supplier relationships
- **Customers**: Customer relationship management
- **Inventory**: Stock movements, adjustments, and low stock alerts
- **Purchases**: Purchase order management
- **Sales**: Sales order processing
- **Reports**: Analytics with CSV/PDF export

### Advanced Features
- **Serial Number Tracking**: Track individual items by serial number
- **Batch/Expiration Tracking**: Track product batches and expiration dates
- **Product Variants**: Support for size, color, and other product variants
- **Quotes & Estimates**: Create and convert quotes to sales
- **Returns & Refunds**: Manage product returns and refunds
- **Invoicing**: Generate and manage invoices with payment tracking
- **Payment Processing**: Stripe and PayPal integration settings
- **Tax Management**: Configurable tax rates and VAT numbers
- **Role-Based Access Control (RBAC)**: User roles and permissions
- **Audit Logs**: Track all system activities

## Tech Stack

- **Frontend**: React 19.2.7
- **Build Tool**: Vite 5.3.5
- **Styling**: TailwindCSS 3.4.19
- **Routing**: React Router DOM 6.30.4
- **Forms**: React Hook Form 7.79.0
- **Charts**: Recharts 2.15.4
- **Icons**: Lucide React 1.18.0
- **HTTP Client**: Axios 1.17.0
- **State Management**: React Context API
- **Code Quality**: ESLint 9.7.0, Prettier 3.3.2

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Barento999/inventory-management.git
cd inventory-management-SaaS
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Demo Credentials

- **Admin**: admin@demo.com / admin123
- **Manager**: manager@demo.com / manager123
- **Staff**: staff@demo.com / staff123

## Project Structure

```
src/
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
│   └── useApi.js
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── products/        # Product management
│   ├── categories/      # Category management
│   ├── warehouses/      # Warehouse management
│   ├── serial-numbers/  # Serial number tracking
│   ├── batches/         # Batch management
│   ├── quotes/          # Quote management
│   ├── returns/         # Return management
│   ├── invoices/        # Invoice management
│   ├── users/           # User management
│   ├── audit-logs/      # Audit log viewing
│   ├── dashboard/       # Dashboard
│   ├── inventory/       # Inventory management
│   ├── purchases/       # Purchase orders
│   ├── sales/           # Sales orders
│   ├── reports/         # Reports and analytics
│   └── settings/        # Application settings
├── routes/              # Route configuration
├── services/            # API layer (mock with localStorage)
│   ├── api.js           # API functions
│   └── store.js         # Data store
└── utils/               # Utility functions
    ├── format.js        # Formatting utilities
    └── status.js        # Status utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Data Storage

This application uses localStorage for data persistence in demo mode. The data is stored under the key `inventory_saas_data` and includes:

- Products with variants, barcodes, and tracking options
- Categories
- Warehouses
- Suppliers
- Customers
- Stock movements
- Serial numbers
- Batches
- Purchase orders
- Sales orders
- Quotes
- Returns
- Invoices
- Users and roles
- Audit logs
- Settings

## Features Overview

### Inventory Management
- Multi-warehouse support
- Serial number tracking for high-value items
- Batch/expiration date tracking
- Low stock alerts
- Stock movements with reasons
- Product variants (size, color, etc.)

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
- CSV/PDF export

### User Management
- Role-based access control (Admin, Manager, Staff, Viewer)
- Custom permissions
- User status management
- Audit logging

### Settings
- Company information
- Tax configuration
- Payment gateway setup (Stripe, PayPal)
- Currency and timezone
- Theme selection (dark/light mode)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue in the GitHub repository.
