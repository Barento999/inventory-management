# Backend Technology Stack

## Core Framework & Server

### 1. **FastAPI** (v0.115.0)
- **Purpose**: Modern Python web framework for building REST APIs
- **What it does**: 
  - Routes HTTP requests to endpoint handlers
  - Automatically generates OpenAPI/Swagger documentation
  - Type hints for request/response validation
  - Built-in CORS support
- **Why chosen**: Fast, easy to use, great developer experience
- **Usage**: All `/api/` endpoints (auth, products, customers, sales, etc.)

### 2. **Uvicorn** (v0.32.0)
- **Purpose**: ASGI web server
- **What it does**:
  - Runs the FastAPI application
  - Handles incoming HTTP requests
  - Manages application lifecycle
  - Supports async/await operations
- **Why chosen**: Fast, lightweight, industry standard for FastAPI
- **Usage**: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

---

## Data Validation & Configuration

### 3. **Pydantic** (v2.9.0+)
- **Purpose**: Data validation and settings management
- **What it does**:
  - Validates request/response data with type hints
  - Converts data types automatically
  - Generates validation error messages
  - Used for API request bodies
- **Usage Examples**:
  - `UserLogin`, `UserRegister` in auth endpoints
  - Request validation before processing
  - Response serialization

### 4. **Pydantic-Settings** (v2.6.1+)
- **Purpose**: Configuration management from environment variables
- **What it does**:
  - Reads `.env` file variables
  - Type-checks configuration values
  - Provides defaults
- **Usage**: 
  - `DATABASE_URL` configuration
  - `SECRET_KEY`, `ALGORITHM` for JWT tokens
  - `ACCESS_TOKEN_EXPIRE_MINUTES` setting

### 5. **python-dotenv** (v1.0.0)
- **Purpose**: Load environment variables from `.env` file
- **What it does**:
  - Reads `.env` file in project root
  - Makes variables available to Python
  - Keeps secrets out of source code
- **Usage**: 
  - Loads `backend/.env` at startup
  - Provides database credentials, API keys, secrets

---

## Authentication & Security

### 6. **Python-JOSE** (v3.3.0) with Cryptography
- **Purpose**: JWT token creation and validation
- **What it does**:
  - Creates signed JWT tokens for authenticated sessions
  - Verifies token signatures
  - Decodes token payloads
  - Uses cryptographic algorithms
- **Usage**:
  - `create_access_token()` - generates tokens on login
  - `verify_token()` - validates tokens on protected endpoints
  - Token includes user ID, email, role, expiration time

### 7. **Passlib** (v1.7.4) with bcrypt
- **Purpose**: Password hashing and verification
- **What it does**:
  - Securely hashes user passwords
  - Verifies passwords on login
  - One-way encryption (can't reverse)
- **Usage**:
  - Currently using SHA256 for demo
  - Can be upgraded to bcrypt for production
  - `hash_password()` and `verify_password()` functions

### 8. **Authlib** (v1.2.1)
- **Purpose**: OAuth and authorization library
- **What it does**:
  - Handles OAuth flows
  - JWT token management
  - User authorization
- **Usage**:
  - Can integrate with Auth0 or other OAuth providers
  - Currently used for extensibility

---

## Database

### 9. **PostgreSQL** (via psycopg2)
- **Purpose**: Relational database for data persistence
- **What it does**:
  - Stores all application data (users, products, orders, etc.)
  - Provides data consistency and ACID compliance
  - Supports complex queries and relationships
- **Usage**: Direct SQL queries with psycopg2 driver

### 10. **psycopg2-binary** (v2.9.0+)
- **Purpose**: PostgreSQL database driver for Python
- **What it does**:
  - Connects Python to PostgreSQL database
  - Executes raw SQL queries
  - Manages connection pooling
- **Usage**: 
  - Direct database connection via `DATABASE_URL`
  - No ORM - full SQL control
  - Better performance for complex queries

---

## HTTP & Networking

### 11. **httpx** (v0.27.0)
- **Purpose**: Async HTTP client
- **What it does**:
  - Makes HTTP requests from backend to external services
  - Supports async/await
  - Similar to requests library but async-friendly
- **Usage**: 
  - Could be used for calling external APIs
  - Payment gateways, shipping providers
  - Email services via HTTP webhooks

### 12. **python-multipart** (v0.0.6)
- **Purpose**: Parsing multipart form data
- **What it does**:
  - Handles file uploads via HTTP
  - Parses form data with files
- **Usage**:
  - File uploads (product images, documents)
  - Form submissions with attachments

---

## Project Structure Created

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── products.py      # Product CRUD
│   │   │   ├── customers.py     # Customer CRUD
│   │   │   ├── suppliers.py     # Supplier CRUD
│   │   │   ├── sales.py         # Sales orders
│   │   │   ├── purchases.py     # Purchase orders
│   │   │   ├── quotes.py        # Quotes management
│   │   │   └── seed.py          # Seed data endpoints
│   │   └── __init__.py          # Router setup
│   ├── core/
│   │   ├── auth.py              # Auth logic
│   │   ├── config.py            # Config with Pydantic
│   │   ├── database.py          # DB connection (SQLAlchemy)
│   │   └── security.py          # JWT & password functions
│   ├── seeds/
│   │   ├── seed_data.py         # Seed data definitions
│   │   └── __init__.py
│   ├── models/                  # SQLAlchemy models (future)
│   ├── schemas/                 # Pydantic schemas (future)
│   ├── services/                # Business logic (future)
│   ├── crud/                    # Database operations (future)
│   ├── main.py                  # FastAPI app & routes
│   └── __init__.py
├── prisma/
│   └── schema.prisma            # Prisma schema (alternative ORM)
├── seed.py                      # Seed script
├── requirements.txt             # Dependencies
├── .env                         # Environment variables
├── .env.example                 # Template
├── Dockerfile                   # Container config
└── README.md                    # Documentation
```

---

## Architecture Pattern

### API Layer (FastAPI)
```
HTTP Request
    ↓
FastAPI Route Handler
    ↓
Pydantic Validation (Request)
    ↓
Business Logic / Database Query (SQLAlchemy)
    ↓
Pydantic Serialization (Response)
    ↓
HTTP Response (JSON)
```

### Authentication Flow
```
User Login
    ↓
POST /auth/login with credentials
    ↓
Verify password (passlib)
    ↓
Create JWT token (python-jose)
    ↓
Return token + user info
    ↓
Client stores token
    ↓
Include token in Authorization header for protected routes
    ↓
Verify token (python-jose)
    ↓
Allow/Deny access
```

---

## Key Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.115.0 | Web framework |
| Uvicorn | 0.32.0 | ASGI server |
| Pydantic | 2.9.0+ | Data validation |
| psycopg2 | 2.9.0+ | PostgreSQL driver |
| python-jose | 3.3.0 | JWT tokens |
| passlib | 1.7.4 | Password hashing |
| authlib | 1.2.1 | OAuth/authorization |
| python-dotenv | 1.0.0 | Environment config |
| httpx | 0.27.0 | HTTP client |
| python-multipart | 0.0.6 | File uploads |

---

## Python Version Compatibility

- **Running on**: Python 3.14
- **Compatibility**: Requires Python 3.8+
- **Dependencies**: Updated for Python 3.14 compatibility

---

## Current Implementation Status

✅ **Implemented**:
- FastAPI framework setup
- Authentication system (JWT + password hashing)
- API route structure
- Seed data system
- CORS configuration
- Environment configuration

⏳ **Ready for Implementation**:
- SQLAlchemy ORM models
- Database migrations
- Full CRUD operations
- Business logic layer
- Caching layer
- Rate limiting
- Logging system

❌ **Not Yet Implemented**:
- Database persistence (currently in-memory for demo)
- Advanced authorization/RBAC
- WebSocket support
- Real-time notifications
- Background tasks (Celery)

---

## Running the Backend

### Development
```bash
# Activate virtual environment
source venv/bin/activate

# Start server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
# Run without reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Or with Docker
docker build -t inventory-api .
docker run -p 8000:8000 inventory-api
```

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## Next Steps for Production

1. **Implement SQLAlchemy Models**
   - Create models for all entities
   - Set up relationships

2. **Database Setup**
   - Create PostgreSQL database
   - Run migrations

3. **Advanced Features**
   - Add caching with Redis
   - Set up background jobs
   - Add WebSocket support

4. **Security Hardening**
   - Rate limiting
   - Advanced RBAC
   - Input sanitization
   - SQL injection prevention

5. **Monitoring**
   - Application logging
   - Error tracking (Sentry)
   - Performance monitoring
   - Database query logging
