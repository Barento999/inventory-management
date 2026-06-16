# 🚀 Quick Start Guide - Inventory Management SaaS

## System Overview

This is a full-stack inventory management SaaS application with:
- **Backend**: Python FastAPI with RBAC (Role-Based Access Control)
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **Authorization**: 5 role levels × 90+ permissions

---

## Prerequisites

### Backend Requirements
- Python 3.14+
- PostgreSQL 12+
- pip or virtual environment manager

### Frontend Requirements
- Node.js 18+
- npm or yarn

---

## Backend Setup

### 1. Start the Backend Server

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the development server
uvicorn app.main:app --reload

# Server will run on http://localhost:8000
```

### 2. API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Verify Backend

```bash
# Check server is running
curl http://localhost:8000/api/auth/me

# Should return 401 Unauthorized (expected - no token)
```

---

## Frontend Setup

### 1. Start the Frontend Development Server

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm start

# Frontend will run on http://localhost:3000
```

### 2. Environment Configuration

Create `.env` file in frontend directory:
```
REACT_APP_API_URL=http://localhost:8000/api
```

---

## First Time Usage

### 1. Register a User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

**Response** (save the `access_token`):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "user"
  }
}
```

### 2. Login from Frontend

- Open http://localhost:3000
- Click "Sign Up" or "Login"
- Use credentials from above
- Token is automatically saved to localStorage

### 3. Access Protected Resources

```bash
# Using token from registration
TOKEN="your_token_here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/products/
```

---

## User Roles & Permissions

### 5 Role Levels

1. **Admin** - Full system access
2. **Manager** - Can create/update/view data
3. **Staff** - Can view and create some items
4. **User** - Can view and perform self-service
5. **Viewer** - Read-only access

### Common Operations

| Operation | Admin | Manager | Staff | User | Viewer |
|-----------|-------|---------|-------|------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Products | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Product | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## API Endpoints Quick Reference

### Authentication (No auth required)
```
POST   /api/auth/register      - Create new account
POST   /api/auth/login         - Login with email/password
POST   /api/auth/logout        - Logout
GET    /api/auth/me            - Get current user (requires token)
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Products (Requires auth + products_view permission)
```
GET    /api/products/          - List all products
GET    /api/products/{id}      - Get product details
POST   /api/products/          - Create product
PUT    /api/products/{id}      - Update product
DELETE /api/products/{id}      - Delete product
```

### Dashboard (Requires auth + reports_view permission)
```
GET    /api/dashboard/summary  - Get dashboard statistics
GET    /api/dashboard/top-products
```

### Other Resources
```
/api/categories/     - Manage categories
/api/customers/      - Manage customers
/api/suppliers/      - Manage suppliers
/api/sales/          - Manage sales
/api/purchases/      - Manage purchases
/api/warehouses/     - Manage warehouses
/api/users/          - Manage users (admin only)
/api/audit-logs/     - View audit logs
/api/settings/       - Manage settings
```

---

## Common Tasks

### Change User Role to Admin

```bash
# Using database (PostgreSQL)
# First, get the user ID from the users table

UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Get Dashboard Summary

```bash
TOKEN="your_token"

curl -X GET http://localhost:8000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Create a New Product

```bash
TOKEN="your_token"

curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "sku": "PROD-001",
    "price": 99.99,
    "cost": 50.00,
    "stock": 100,
    "reorder_level": 10,
    "status": "Active",
    "description": "Product description"
  }'
```

### List Products with Pagination

```bash
TOKEN="your_token"

curl -X GET "http://localhost:8000/api/products/?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Troubleshooting

### Backend won't start

```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill the process if needed
kill -9 <PID>

# Check database connection
# Verify PostgreSQL is running and .env has correct credentials
```

### Frontend shows blank page

```bash
# Check console for errors (F12)
# Verify backend is running on http://localhost:8000
# Clear browser cache and localStorage
# Restart frontend: npm start
```

### Getting 401 Unauthorized

```bash
# Possible causes:
# 1. Token expired - Register/login again
# 2. Token format wrong - Use: Authorization: Bearer <token>
# 3. Missing Authorization header - Add it to request
# 4. Invalid token - Generate new one by logging in
```

### Getting 403 Forbidden

```bash
# Possible causes:
# 1. User doesn't have required permission - Change user role
# 2. User role is "viewer" - Update to manager/staff/user/admin
# 3. Permission not granted for endpoint - Check role permissions
```

### Database connection failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials in backend/.env
# Verify database exists and user has access

# Check logs
tail -f backend/app.log
```

---

## Development Workflow

### 1. Make Changes

**Backend**:
```bash
# Edit Python files in backend/app/
# Changes auto-reload with --reload flag
# Check console for errors
```

**Frontend**:
```bash
# Edit React files in frontend/src/
# Changes auto-reload with npm start
# Check console (F12) for errors
```

### 2. Test Changes

```bash
# Backend: Call API with curl
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/your-endpoint/

# Frontend: Test in browser at http://localhost:3000
```

### 3. Commit Changes

```bash
# Backend
cd backend
git add .
git commit -m "Description of changes"

# Frontend
cd frontend
git add .
git commit -m "Description of changes"
```

---

## Key Files

### Backend
- `backend/app/main.py` - Application entry point
- `backend/app/core/rbac.py` - Authorization system
- `backend/app/core/auth.py` - Authentication system
- `backend/app/api/endpoints/` - API route handlers
- `backend/app/models/` - Database models
- `backend/.env` - Configuration file

### Frontend
- `frontend/src/main.jsx` - Application entry point
- `frontend/src/context/AuthContext.jsx` - Auth state management
- `frontend/src/hooks/usePermissions.js` - Permission checking
- `frontend/src/pages/` - Page components
- `frontend/src/components/` - Reusable components
- `frontend/.env` - Configuration file

---

## Additional Resources

### Documentation Files
- `RBAC_IMPLEMENTATION_COMPLETE.md` - Complete RBAC guide
- `RBAC_QUICK_START.md` - RBAC code examples
- `BACKEND_FULLY_FIXED.md` - Backend status
- `FINAL_VERIFICATION_REPORT.md` - Test results

### API Testing
- **Postman**: Import from `/api/postman-collection.json` (if available)
- **Swagger**: http://localhost:8000/docs
- **curl**: Command line examples above

### Database
- Default: PostgreSQL on localhost:5432
- Credentials: See `backend/.env`
- Connect: `psql -U postgres -d inventory_saas`

---

## Support

### Quick Checklist
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can register a user
- [ ] Can login with credentials
- [ ] Can access protected endpoints with token
- [ ] API returns correct status codes (200, 401, 403)

### Getting Help
1. Check error logs (backend console or browser F12)
2. Review documentation files above
3. Verify database connection
4. Ensure both servers are running
5. Clear cache and restart servers

---

## Performance Tips

### Backend
```bash
# Use production settings for deployment
gunicorn app.main:app -w 4 -b 0.0.0.0:8000
```

### Frontend
```bash
# Build for production
npm run build

# Result in frontend/build/ directory
```

### Database
```bash
# Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);
```

---

**Happy coding!** 🎉

For more details, see the comprehensive documentation files in the project root.
