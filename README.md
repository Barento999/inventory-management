# Inventory Management SaaS

Complete role-based inventory management system with advanced RBAC, audit logging, and production-ready security.

## Features

✅ **Role-Based Access Control (RBAC)**
- 5 role levels (Admin, Manager, Staff, User, Viewer)
- 90+ granular permissions
- Permission-based API endpoints
- Audit trail logging

✅ **Security**
- JWT token authentication
- Rate limiting on auth endpoints
- Input validation & sanitization
- Security headers (CSP, X-Frame-Options, etc.)
- Password hashing with Argon2

✅ **API**
- RESTful API with 60+ endpoints
- OpenAPI/Swagger documentation
- Comprehensive error handling
- Request/response logging
- Rate limiting

✅ **Frontend**
- React + TypeScript
- Permission-based UI visibility
- Protected routes
- Responsive design
- Real-time updates

✅ **Database**
- PostgreSQL with SQLAlchemy ORM
- Automated migrations
- Relationship management
- Audit log tracking

✅ **DevOps**
- Docker containerization
- Docker Compose setup
- GitHub Actions CI/CD
- Health checks & monitoring

## Quick Start

### Prerequisites
- Python 3.13+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 12+ (or use Docker)

### Development

1. **Clone & Setup**
```bash
git clone https://github.com/yourusername/inventory-management.git
cd inventory-management
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --reload
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

4. **Access**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# Initialize database
docker-compose exec backend python seed.py

# View logs
docker-compose logs -f
```

---

## Test Credentials

After seeding database:

| Email | Password | Role |
|-------|----------|------|
| admin@inventory.com | Admin@123 | Admin |
| manager@inventory.com | Manager@123 | Manager |
| staff@inventory.com | Staff@123 | Staff |
| user@inventory.com | User@123 | User |
| viewer@inventory.com | Viewer@123 | Viewer |

---

## Architecture

```
inventory-management/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/              # API endpoints (60+)
│   │   ├── models/           # SQLAlchemy models
│   │   ├── core/             # Authentication, RBAC, validation
│   │   └── seeds/            # Database seeding
│   ├── Dockerfile            # Backend container
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom hooks (permissions, etc.)
│   │   ├── context/          # Auth context
│   │   └── services/         # API client
│   ├── Dockerfile            # Frontend container
│   └── package.json          # Node dependencies
│
├── docker-compose.yml        # Multi-container setup
├── .github/workflows/        # CI/CD pipeline
└── docs/                     # Documentation
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login & get token
- `GET /api/auth/me` - Get current user

### Products (60+ endpoints total)
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Other Resources
- Customers, Suppliers, Sales, Purchases, Quotes
- Invoices, Returns, Warehouses, Categories
- Inventory, Audit Logs, Users, Roles
- Dashboard & Reports

**Full API docs**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## Permissions System

### Role Hierarchy
```
Admin (all permissions)
 ↓
Manager (management + creation)
 ↓
Staff (view + limited creation)
 ↓
User (self-service)
 ↓
Viewer (read-only)
```

### Permission Examples
- `products_view` - View products
- `products_create` - Create products
- `products_update` - Update products
- `products_delete` - Delete products
- `users_view` - View users
- `audit_logs_view` - View audit logs
- `reports_view` - View dashboard/reports

---

## Security Features

✅ **Authentication**
- JWT token-based
- Token expiration (30 min default)
- Secure password hashing

✅ **Authorization**
- Role-based access control
- Permission validation on every endpoint
- Audit logging for denials

✅ **Rate Limiting**
- 5/minute on auth endpoints
- 30/minute on other endpoints
- Per-IP tracking

✅ **Input Validation**
- Email format validation
- Password strength requirements
- String length validation
- XSS prevention

✅ **Security Headers**
- X-Content-Type-Options
- X-Frame-Options
- Content-Security-Policy
- Strict-Transport-Security

---

## Monitoring & Logging

### Logs Location
- Backend: stdout (JSON format)
- Errors: `backend/error.log`
- Audit trail: Database `audit_log` table

### Audit Events
- User login/logout
- Permission denied attempts
- Authentication failures
- Resource CRUD operations
- Admin actions

### Endpoints
- `GET /api/audit-logs` - View all logs
- `GET /api/audit-logs/permission-denials` - View permission denials
- `GET /api/audit-logs/auth-failures` - View auth failures

---

## Database Schema

### Key Tables
- `users` - User accounts with roles
- `roles` - Role definitions
- `products` - Inventory items
- `customers` - Customer database
- `sales` - Sales transactions
- `purchases` - Purchase orders
- `audit_log` - Action audit trail
- 10+ other business tables

**Relationships**:
- Products → Categories, Warehouses
- Sales → Customers, Users
- Purchases → Suppliers, Users
- AuditLog → Users

---

## Deployment

### Production Checklist
- [ ] Update SECRET_KEY
- [ ] Set ENVIRONMENT=production
- [ ] Configure database backup
- [ ] Set up monitoring/alerting
- [ ] Configure HTTPS/SSL
- [ ] Review security headers
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Test all endpoints
- [ ] Document deployment steps

**Deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Performance

### Optimizations
- Database indexes on frequently queried fields
- Pagination on all list endpoints
- Connection pooling for database
- Rate limiting for abuse prevention
- JSON logging for efficient monitoring

### Scalability
- Stateless API design
- Horizontal scaling ready
- Load balancer compatible
- Container orchestration ready (Kubernetes)

---

## Testing

### Manual Testing
1. Start backend & frontend
2. Register new user
3. Login with credentials
4. Access different resource pages based on role
5. Verify permission denials
6. Check audit logs

### API Testing
```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123","name":"Test"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123"}'

# Test protected endpoint
curl -X GET http://localhost:8000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Frontend Integration](FRONTEND_INTEGRATION_TEST.md) - Testing guide
- [RBAC Implementation](RBAC_IMPLEMENTATION_COMPLETE.md) - Permission system
- [Quick Start](QUICK_START_GUIDE.md) - Getting started

---

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Auth**: JWT + Argon2
- **Validation**: Pydantic
- **Rate Limiting**: SlowAPI
- **Logging**: Python logging + JSON

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **State**: Context API
- **HTTP**: Axios
- **UI**: Tailwind CSS
- **Routing**: React Router

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Database**: PostgreSQL
- **Monitoring**: Built-in logging

---

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- Python: PEP 8 (Black formatter)
- JavaScript: ESLint + Prettier
- Follow existing patterns

---

## License

MIT License - see LICENSE file

---

## Support

- **Issues**: GitHub Issues
- **Docs**: See documentation folder
- **Email**: support@example.com
- **API Docs**: http://localhost:8000/docs

---

## Roadmap

- [ ] Two-factor authentication
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] GraphQL API
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] Integration marketplace

---

## Stats

- **API Endpoints**: 60+
- **Permissions**: 90+
- **Roles**: 5
- **Tables**: 15+
- **Code Files**: 100+
- **Test Coverage**: TBD
- **Documentation**: Complete

---

**Version**: 1.0.0  
**Last Updated**: June 2026  
**Status**: Production Ready ✅

---

Made with ❤️ for inventory management professionals
