# Inventory Management SaaS

A comprehensive inventory management system built with modern web technologies, designed for businesses to track products, manage stock, handle sales and purchases, and generate reports.

## 🚀 Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT tokens
- **Python Version**: 3.14+

### Frontend
- **Framework**: React with Vite
- **UI Components**: Custom components with TailwindCSS
- **State Management**: React Context API
- **API Client**: Custom fetch-based client
- **Node Version**: 18+

## 📋 Features

### Core Functionality
- **Product Management**: Create, read, update, delete products with categories, SKUs, and stock tracking
- **Inventory Control**: Real-time stock levels, low stock alerts, stock movements, and batch tracking
- **Sales Management**: Complete sales workflow with customer management and invoice generation
- **Purchase Management**: Supplier management, purchase orders, and receiving
- **Warehouse Management**: Multiple warehouse support with location tracking
- **Reporting**: Sales reports, inventory valuation, low stock alerts, and top products analysis
- **User Management**: Role-based access control (Admin, Manager, Staff, Viewer)
- **Audit Logging**: Track all system changes for compliance and security

### Advanced Features
- **Serial Number Tracking**: Track individual items with unique serial numbers
- **Batch Management**: Track product batches with expiration dates
- **Returns Management**: Handle product returns with refund processing
- **Invoice Generation**: Create and manage invoices with payment tracking
- **Notifications**: System notifications for important events
- **Global Search**: Search across products, customers, suppliers, sales, and purchases
- **Settings Management**: Configure company settings, currency, tax rates, and thresholds

## 🛠️ Installation

### Prerequisites
- Docker and Docker Compose
- Python 3.14+
- Node.js 18+
- PostgreSQL (or use Docker)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone https://github.com/Barento999/inventory-management.git
cd inventory-management-SaaS
```

2. **Start PostgreSQL with Docker**
```bash
docker-compose up -d postgres
```

3. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
python seed.py  # Seed database with sample data
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL (default: http://localhost:8000/api)
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup (Without Docker)

1. **Install PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

2. **Create Database**
```bash
sudo -u postgres psql
CREATE DATABASE inventory_management;
CREATE USER inventory_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inventory_management TO inventory_user;
\q
```

3. **Configure Backend**
```bash
cd backend
# Edit .env with your database credentials
DATABASE_URL=postgresql://inventory_user:your_password@localhost/inventory_management
```

4. **Follow steps 3-5 from Quick Start above**

## 📁 Project Structure

```
inventory-management-SaaS/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/     # API route handlers
│   │   │   └── __init__.py     # API router configuration
│   │   ├── core/
│   │   │   ├── database.py     # Database configuration
│   │   │   └── config.py       # Application settings
│   │   ├── models/             # SQLAlchemy models
│   │   └── main.py             # FastAPI application
│   ├── seed.py                 # Database seeding script
│   ├── check_db.py             # Database verification
│   ├── requirements.txt        # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API client and services
│   │   ├── App.jsx             # Main App component
│   │   └── main.jsx            # Application entry point
│   ├── public/                 # Static assets
│   ├── package.json            # Node dependencies
│   └── .env                    # Environment variables
├── docker-compose.yml          # Docker services
└── README.md                   # This file
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## 📊 Database Schema

### Main Tables
- **users**: User accounts with role-based access
- **categories**: Product categorization
- **warehouses**: Storage locations
- **products**: Product catalog with stock tracking
- **suppliers**: Vendor management
- **customers**: Customer management
- **sales**: Sales transactions
- **purchases**: Purchase orders
- **quotes**: Price quotes
- **stock_movements**: Inventory change history
- **settings**: Application configuration
- **notifications**: System notifications
- **roles**: User roles and permissions
- **audit_logs**: System activity logs
- **serial_numbers**: Individual item tracking
- **batches**: Product batch management
- **returns**: Product returns
- **invoices**: Invoice management

## 🔐 Authentication

The system uses JWT token-based authentication:

1. **Login**: Users authenticate with email and password
2. **Token Generation**: Server returns JWT token on successful login
3. **Token Storage**: Frontend stores token in localStorage
4. **Token Usage**: Frontend includes token in API request headers
5. **Token Validation**: Backend validates token on protected routes

### Default Users
- **Admin**: admin@inventory.com (full access)
- **Manager**: manager@inventory.com (manage inventory and sales)
- **User**: user@inventory.com (limited access)

## 🧪 Testing

### Backend Testing
```bash
cd backend
# Run with pytest (if tests are implemented)
pytest

# Manual API testing
curl http://localhost:8000/api/products
curl http://localhost:8000/api/categories
```

### Frontend Testing
```bash
cd frontend
# Run tests (if implemented)
npm test
```

## 📈 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main API Endpoints
- `/api/auth` - Authentication
- `/api/products` - Product management
- `/api/categories` - Category management
- `/api/warehouses` - Warehouse management
- `/api/customers` - Customer management
- `/api/suppliers` - Supplier management
- `/api/sales` - Sales management
- `/api/purchases` - Purchase management
- `/api/quotes` - Quote management
- `/api/inventory` - Inventory management
- `/api/dashboard` - Dashboard statistics
- `/api/settings` - Application settings
- `/api/notifications` - System notifications
- `/api/roles` - Role management
- `/api/audit-logs` - Audit logs
- `/api/serial-numbers` - Serial number tracking
- `/api/batches` - Batch management
- `/api/returns` - Returns management
- `/api/invoices` - Invoice management

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations (if using Alembic)
4. Start with production server: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Use Gunicorn for production: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

### Frontend Deployment
1. Set environment variables
2. Install dependencies: `npm install`
3. Build for production: `npm run build`
4. Serve with Nginx or any static file server

### Docker Deployment
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the API documentation at `/docs`
- Review the database schema in `DATABASE.md`

## 🎯 Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Barcode scanning integration
- [ ] Multi-tenant support
- [ ] Advanced permissions system
- [ ] Email notifications
- [ ] File attachments for products
- [ ] API rate limiting
- [ ] Caching layer with Redis
- [ ] Automated backups
