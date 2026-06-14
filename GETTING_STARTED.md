# Getting Started with Inventory Management SaaS

## Quick Start

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Database

### Current Setup
- PostgreSQL (configured but not required for initial testing)
- Environment variables in `backend/.env`
- Database URL: `postgresql://postgres:password@localhost:5432/inventory_db`

### Connection
To use PostgreSQL:
1. Install PostgreSQL locally or via Docker
2. Update `backend/.env` with your database URL
3. Create the database: `createdb inventory_db`

## Authentication

### Demo Accounts
```
Email: admin@demo.com
Password: admin123

Email: manager@demo.com
Password: manager123

Email: staff@demo.com
Password: staff123
```

### Or Register New Account
- Create new account on the registration page
- New users get "user" role by default

## Seed Data

### View Available Seed Data
```bash
# Show summary
curl http://localhost:8000/api/seed/seed-summary

# Load all seed data
curl -X POST http://localhost:8000/api/seed/load-seed-data
```

### Contents
- 5 Product Categories
- 3 Warehouses
- 10 Sample Products
- 4 Suppliers
- 5 Customers

See `backend/SEED_DATA.md` for details.

## API Structure

### Base URL
`http://localhost:8000/api`

### Main Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /products` - List products
- `GET /customers` - List customers
- `GET /suppliers` - List suppliers
- `GET /sales` - List sales orders
- `GET /purchases` - List purchase orders
- `GET /quotes` - List quotes
- `GET /seed/seed-summary` - Seed data summary
- `POST /seed/load-seed-data` - Load all seed data

## Project Structure

### Backend
```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py         # Authentication
│   │   │   ├── products.py     # Products
│   │   │   ├── customers.py    # Customers
│   │   │   ├── suppliers.py    # Suppliers
│   │   │   ├── sales.py        # Sales orders
│   │   │   ├── purchases.py    # Purchase orders
│   │   │   ├── quotes.py       # Quotes
│   │   │   └── seed.py         # Seed data
│   │   └── __init__.py
│   ├── core/
│   │   ├── auth.py            # Auth logic
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database setup
│   │   └── security.py        # Security utilities
│   ├── seeds/
│   │   ├── seed_data.py       # Seed data definitions
│   │   └── __init__.py
│   ├── main.py                # FastAPI app
│   └── __init__.py
├── prisma/
│   └── schema.prisma          # Database schema (Prisma)
├── seed.py                    # Seed script
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── SEED_DATA.md             # Seed data documentation
```

### Frontend
```
frontend/
├── src/
│   ├── components/            # React components
│   ├── pages/                # Page components
│   ├── services/             # API services
│   │   ├── api.js            # API definitions
│   │   ├── apiClient.js      # HTTP client
│   │   └── store.js          # Data store
│   ├── context/              # React contexts
│   │   ├── AuthContext.jsx   # Authentication
│   │   └── ToastContext.jsx  # Notifications
│   ├── App.jsx               # Main app
│   └── main.jsx              # Entry point
├── package.json              # Dependencies
├── vite.config.js            # Build config
└── tailwind.config.js        # Styling
```

## Development

### Running Tests
```bash
# Frontend
npm run lint

# Backend (if tests exist)
pytest
```

### Building for Production
```bash
# Frontend
npm run build
# Output: frontend/dist/

# Backend
# Use Docker or deployment platform
```

## Environment Configuration

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_API_AUDIENCE=your-api-identifier
AUTH0_ISSUER=https://your-auth0-domain.auth0.com/
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api
```

## Troubleshooting

### Backend Issues

**Port 8000 already in use**
```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>
```

**Database connection error**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify credentials

### Frontend Issues

**Port 5173 already in use**
```bash
npm run dev -- --port 3000
```

**Module not found**
```bash
npm install
```

## Next Steps

1. ✅ Start backend and frontend servers
2. ✅ Log in with demo account
3. ✅ Explore the application
4. ✅ Load seed data for testing
5. ✅ Create custom products and customers
6. ✅ Generate sales and purchase orders
7. ✅ Review analytics and reports

## Support

- Check API documentation: `http://localhost:8000/docs`
- Review backend logs in terminal
- Check browser console for frontend errors
- See `backend/SEED_DATA.md` for seed data details

## Production Deployment

Before deploying to production:

1. **Security**
   - Change SECRET_KEY in .env
   - Update CORS origins in main.py
   - Use secure database connection
   - Enable HTTPS

2. **Database**
   - Run database migrations
   - Set up backups
   - Configure security groups

3. **Frontend**
   - Run `npm run build`
   - Deploy dist folder
   - Update API_URL to production backend

4. **Monitoring**
   - Set up logging
   - Add error tracking
   - Monitor database performance

---

Happy coding! 🚀
