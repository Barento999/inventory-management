# Inventory Management Backend

FastAPI backend for Inventory Management SaaS with PostgreSQL, Prisma, and Auth0.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database URL and Auth0 credentials

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Run the server:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

- `/api/products` - Product management
- `/api/customers` - Customer management
- `/api/suppliers` - Supplier management
- `/api/sales` - Sales orders
- `/api/purchases` - Purchase orders
- `/api/quotes` - Quotes

## Tech Stack

- FastAPI
- PostgreSQL
- Prisma ORM
- Auth0 Authentication
