# PostgreSQL Database Setup

## Architecture

This backend uses **raw PostgreSQL** with **psycopg2** driver. No ORM is used.

### Why This Approach?
- ✅ Direct control over SQL queries
- ✅ Better performance for complex queries
- ✅ Simpler debugging
- ✅ Easier to understand database structure
- ✅ Lighter dependencies

## Database Structure

### Tables

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### categories
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### warehouses
```sql
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### products
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    description TEXT,
    warehouse_id INTEGER REFERENCES warehouses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### suppliers
```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(500),
    contact_person VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### customers
```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### sales
```sql
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### purchases
```sql
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    expected_date DATE,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### quotes
```sql
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Installation

### 1. Install PostgreSQL

**macOS (Homebrew)**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows**
- Download from https://www.postgresql.org/download/windows/
- Follow installation wizard

**Docker**
```bash
docker run --name inventory-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=inventory_db \
  -p 5432:5432 \
  -d postgres:latest
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE inventory_db;

# Exit
\q
```

### 3. Update .env

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
```

### 4. Start Backend

```bash
cd backend
./venv/bin/uvicorn app.main:app --reload
```

The backend will automatically create all tables on startup.

## Database Operations

### Using the Database Class

The `app/core/database.py` provides a `Database` class with methods:

```python
from app.core.database import db

# Execute query (INSERT, UPDATE, DELETE)
db.execute(
    "INSERT INTO categories (name, description) VALUES (%s, %s)",
    ("Electronics", "Electronic devices")
)

# Fetch single row
category = db.fetch_one(
    "SELECT * FROM categories WHERE id = %s",
    (1,)
)

# Fetch multiple rows
categories = db.fetch_all(
    "SELECT * FROM categories"
)
```

### SQL Examples

**Insert**
```python
db.execute(
    """INSERT INTO products 
       (name, sku, category_id, price, cost, stock, warehouse_id)
       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
    ("Mouse", "WM-001", 1, 29.99, 15.00, 100, 1)
)
```

**Update**
```python
db.execute(
    "UPDATE products SET stock = stock + %s WHERE id = %s",
    (50, 1)
)
```

**Delete**
```python
db.execute(
    "DELETE FROM categories WHERE id = %s",
    (1,)
)
```

**Select**
```python
products = db.fetch_all(
    """SELECT p.*, c.name as category_name, w.name as warehouse_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN warehouses w ON p.warehouse_id = w.id
       WHERE p.status = %s""",
    ("Active",)
)
```

## Data Types

| PostgreSQL | Python | Description |
|-----------|--------|-------------|
| SERIAL | int | Auto-incrementing integer |
| VARCHAR | str | Variable-length string |
| TEXT | str | Large text |
| INTEGER | int | Integer number |
| DECIMAL | float | Decimal number (money) |
| BOOLEAN | bool | True/False |
| DATE | str | Date (YYYY-MM-DD) |
| TIMESTAMP | str | Date and time |
| REFERENCES | Foreign Key | Link to another table |

## Parameterized Queries

**Always use %s placeholders for security:**

```python
# ✅ GOOD - SQL injection safe
db.fetch_one(
    "SELECT * FROM users WHERE email = %s",
    (user_email,)
)

# ❌ BAD - SQL injection risk
db.fetch_one(f"SELECT * FROM users WHERE email = '{user_email}'")
```

## Connection Management

The database connection is managed globally:

```python
# Connection created on app startup
@app.on_event("startup")
async def startup_event():
    db.connect()
    db.create_tables()

# Connection closed on app shutdown
@app.on_event("shutdown")
async def shutdown_event():
    db.disconnect()
```

## Backup & Restore

### Backup Database
```bash
pg_dump -U postgres -d inventory_db > backup.sql
```

### Restore Database
```bash
psql -U postgres -d inventory_db < backup.sql
```

## Monitoring

### Connect to Database
```bash
psql -U postgres -d inventory_db
```

### List Tables
```sql
\dt
```

### Describe Table
```sql
\d products
```

### Run Queries
```sql
SELECT * FROM products;
SELECT COUNT(*) FROM customers;
```

## Performance Optimization

### Add Indexes
```sql
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_customers_email ON customers(email);
```

### Query Analysis
```sql
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 1;
```

## Migration from SQLAlchemy

If you were using SQLAlchemy before, migration is simple:

**Before (SQLAlchemy):**
```python
products = session.query(Product).filter(Product.status == 'Active').all()
```

**After (Raw SQL):**
```python
products = db.fetch_all(
    "SELECT * FROM products WHERE status = %s",
    ("Active",)
)
```

## Troubleshooting

### Connection Refused
```
Error: Connection refused
```
- PostgreSQL is not running
- Wrong host/port in DATABASE_URL
- Try: `psql -U postgres -h localhost`

### Table Already Exists
```
Error: Relation "products" already exists
```
- Tables are created automatically
- Safe to ignore on subsequent starts

### Permission Denied
```
Error: Permission denied for schema public
```
- Check PostgreSQL user permissions
- May need to run as superuser

## Next Steps

1. ✅ Set up PostgreSQL
2. ✅ Configure DATABASE_URL
3. ✅ Start backend (tables auto-created)
4. ✅ Test with seed data
5. ✅ Implement CRUD endpoints using `db.fetch_*()` and `db.execute()`

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [psycopg2 Documentation](https://www.psycopg.org/psycopg2/docs/)
- [SQL Tutorial](https://www.w3schools.com/sql/)
