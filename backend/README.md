# Inventory Management Backend

FastAPI backend for Inventory Management SaaS with PostgreSQL and SQLAlchemy ORM.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT tokens
- **Python Version**: 3.14+

## Setup

1. **Install dependencies**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Copy environment variables**:
```bash
cp .env.example .env
```

3. **Update `.env` with your database credentials**:
```env
DATABASE_URL=postgresql://user:password@localhost/inventory_management
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. **Create database tables**:
```bash
python create_new_tables.py
```

5. **Seed database with sample data**:
```bash
python seed.py
```

6. **Run the server**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/     # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── customers.py
│   │   │   ├── suppliers.py
│   │   │   ├── sales.py
│   │   │   ├── purchases.py
│   │   │   ├── quotes.py
│   │   │   ├── categories.py
│   │   │   ├── warehouses.py
│   │   │   ├── users.py
│   │   │   ├── dashboard.py
│   │   │   ├── inventory.py
│   │   │   ├── settings.py
│   │   │   ├── notifications.py
│   │   │   ├── roles.py
│   │   │   ├── audit_logs.py
│   │   │   ├── serial_numbers.py
│   │   │   ├── batches.py
│   │   │   ├── returns.py
│   │   │   └── invoices.py
│   │   └── __init__.py     # API router configuration
│   ├── core/
│   │   ├── database.py     # Database configuration
│   │   └── config.py       # Application settings
│   ├── models/             # SQLAlchemy models
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── warehouse.py
│   │   ├── product.py
│   │   ├── supplier.py
│   │   ├── customer.py
│   │   ├── sale.py
│   │   ├── purchase.py
│   │   ├── quote.py
│   │   ├── stock_movement.py
│   │   ├── settings.py
│   │   ├── notification.py
│   │   ├── role.py
│   │   ├── audit_log.py
│   │   ├── serial_number.py
│   │   ├── batch.py
│   │   ├── product_return.py
│   │   └── invoice.py
│   └── main.py             # FastAPI application
├── seed.py                 # Database seeding script
├── seed_new_tables.py      # Seed new tables
├── check_db.py             # Database verification
├── create_new_tables.py    # Create new database tables
├── requirements.txt        # Python dependencies
└── .env                   # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - List all products (with pagination)
- `GET /api/products/{id}` - Get specific product
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Categories
- `GET /api/categories` - List all categories (with pagination)
- `GET /api/categories/{id}` - Get specific category
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Warehouses
- `GET /api/warehouses` - List all warehouses (with pagination)
- `GET /api/warehouses/{id}` - Get specific warehouse
- `POST /api/warehouses` - Create new warehouse
- `PUT /api/warehouses/{id}` - Update warehouse
- `DELETE /api/warehouses/{id}` - Delete warehouse

### Customers
- `GET /api/customers` - List all customers (with pagination)
- `GET /api/customers/{id}` - Get specific customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Suppliers
- `GET /api/suppliers` - List all suppliers (with pagination)
- `GET /api/suppliers/{id}` - Get specific supplier
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Sales
- `GET /api/sales` - List all sales (with pagination)
- `GET /api/sales/{id}` - Get specific sale
- `POST /api/sales` - Create new sale
- `PUT /api/sales/{id}` - Update sale
- `DELETE /api/sales/{id}` - Delete sale

### Purchases
- `GET /api/purchases` - List all purchases (with pagination)
- `GET /api/purchases/{id}` - Get specific purchase
- `POST /api/purchases` - Create new purchase
- `PUT /api/purchases/{id}` - Update purchase
- `DELETE /api/purchases/{id}` - Delete purchase

### Quotes
- `GET /api/quotes` - List all quotes (with pagination)
- `GET /api/quotes/{id}` - Get specific quote
- `POST /api/quotes` - Create new quote
- `PUT /api/quotes/{id}` - Update quote
- `DELETE /api/quotes/{id}` - Delete quote

### Inventory
- `GET /api/inventory/stock-levels` - Get stock levels
- `GET /api/inventory/stock-levels?low_stock=true` - Get low stock items
- `GET /api/inventory/movements` - Get stock movements (with pagination)
- `POST /api/inventory/adjust` - Adjust stock for a product

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard statistics
- `GET /api/dashboard/top-products` - Get top products

### Settings
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update application settings
- `POST /api/settings/reset` - Reset application data

### Notifications
- `GET /api/notifications` - List all notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Roles
- `GET /api/roles` - List all roles
- `GET /api/roles/{id}` - Get specific role
- `POST /api/roles` - Create new role
- `PUT /api/roles/{id}` - Update role
- `DELETE /api/roles/{id}` - Delete role

### Audit Logs
- `GET /api/audit-logs` - List audit logs (with pagination)
- `POST /api/audit-logs` - Create audit log entry

### Serial Numbers
- `GET /api/serial-numbers` - List serial numbers (with pagination)
- `POST /api/serial-numbers` - Create serial number
- `PUT /api/serial-numbers/{id}` - Update serial number
- `DELETE /api/serial-numbers/{id}` - Delete serial number

### Batches
- `GET /api/batches` - List batches (with pagination)
- `POST /api/batches` - Create batch
- `PUT /api/batches/{id}` - Update batch
- `DELETE /api/batches/{id}` - Delete batch

### Returns
- `GET /api/returns` - List returns (with pagination)
- `GET /api/returns/{id}` - Get specific return
- `POST /api/returns` - Create return
- `PUT /api/returns/{id}` - Update return
- `DELETE /api/returns/{id}` - Delete return

### Invoices
- `GET /api/invoices` - List invoices (with pagination)
- `GET /api/invoices/{id}` - Get specific invoice
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice

### Users
- `GET /api/users` - List all users (with pagination)
- `GET /api/users/{id}` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Database Models

### Core Models
- **User**: User accounts with email, name, and role
- **Category**: Product categorization
- **Warehouse**: Storage locations
- **Product**: Product catalog with stock tracking
- **Supplier**: Vendor management
- **Customer**: Customer management

### Transaction Models
- **Sale**: Sales transactions
- **Purchase**: Purchase orders
- **Quote**: Price quotes
- **Return**: Product returns
- **Invoice**: Invoice management

### Inventory Models
- **StockMovement**: Inventory change history
- **SerialNumber**: Individual item tracking
- **Batch**: Product batch management

### System Models
- **Settings**: Application configuration
- **Notification**: System notifications
- **Role**: User roles and permissions
- **AuditLog**: System activity logs

## Authentication

The API uses JWT token-based authentication:

1. **Login**: Send POST request to `/api/auth/login` with email and password
2. **Token**: Receive JWT token in response
3. **Usage**: Include token in Authorization header: `Bearer <token>`
4. **Protected Routes**: Most endpoints require authentication

### Example
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@inventory.com", "password": "password"}'

# Use token
curl http://localhost:8000/api/products \
  -H "Authorization: Bearer <your-token>"
```

## Pagination

Most list endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10)

Response format:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Database Management
```bash
# Check database contents
python check_db.py

# Seed database with sample data
python seed.py

# Create new tables
python create_new_tables.py

# Seed new tables
python seed_new_tables.py
```

### Code Style
```bash
# Format code with black
pip install black
black app/

# Lint with flake8
pip install flake8
flake8 app/
```

## Deployment

### Production Server
```bash
# Use Gunicorn with Uvicorn workers
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Environment Variables
Set the following environment variables in production:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (use strong random value)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `sudo -u postgres psql -l`

### Import Errors
- Ensure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

### CORS Issues
- Check CORS configuration in `app/main.py`
- Ensure frontend URL is allowed

## Default Users

The seed script creates these default users:
- **Admin**: admin@inventory.com (full access)
- **Manager**: manager@inventory.com (manage inventory and sales)
- **User**: user@inventory.com (limited access)

Default password for all users: `password123` (change in production)

