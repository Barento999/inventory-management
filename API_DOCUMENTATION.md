# API Documentation

## Overview

Inventory Management SaaS REST API with role-based access control, audit logging, and comprehensive permission system.

**Base URL**: `http://localhost:8000/api`
**API Version**: 1.0.0
**Authentication**: JWT Bearer Token

---

## Authentication

### Register
Create new user account

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Rate Limit**: 5/minute per IP

---

### Login
Authenticate and get JWT token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK): Same as register

**Errors**:
- 401: Invalid credentials
- 429: Too many attempts (rate limited)

**Rate Limit**: 5/minute per IP

---

### Get Current User
Get authenticated user details

```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

**Errors**:
- 401: Invalid/missing token
- 404: User not found

---

## Products

### List Products
Get all products with pagination and filtering

```http
GET /api/products/?page=1&pageSize=10&search=laptop&category_id=1&status=Active
Authorization: Bearer {token}
```

**Query Parameters**:
- `page` (int): Page number, default 1
- `pageSize` (int): Items per page, default 10, max 100
- `search` (string): Search by name or SKU
- `category_id` (int): Filter by category
- `status` (string): Filter by status (Active, Inactive)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "sku": "LAP-001",
      "price": 999.99,
      "cost": 600.00,
      "stock": 50,
      "reorder_level": 10,
      "status": "Active",
      "category_id": 1,
      "warehouse_id": 1,
      "description": "High-performance laptop"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10
}
```

**Permissions Required**: `products_view`

**Rate Limit**: 30/minute

---

### Create Product
Create new product

```http
POST /api/products/
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Laptop",
  "sku": "LAP-001",
  "price": 999.99,
  "cost": 600.00,
  "stock": 50,
  "reorder_level": 10,
  "status": "Active",
  "category_id": 1,
  "warehouse_id": 1,
  "description": "High-performance laptop"
}
```

**Permissions Required**: `products_create`

---

### Get Product
Get product by ID

```http
GET /api/products/{id}
Authorization: Bearer {token}
```

**Permissions Required**: `products_view`

---

### Update Product
Update product details

```http
PUT /api/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 1099.99,
  "stock": 45
}
```

**Permissions Required**: `products_update`

---

### Delete Product
Delete product

```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

**Permissions Required**: `products_delete`

**Response** (204 No Content)

---

## Customers

### List Customers
```http
GET /api/customers/?page=1&pageSize=10&search=acme
Authorization: Bearer {token}
```

**Permissions Required**: `customers_view`

---

### Create Customer
```http
POST /api/customers/
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "ACME Corp",
  "email": "contact@acme.com",
  "phone": "+1-555-0100",
  "address": "123 Business Ave, City, State 12345"
}
```

**Permissions Required**: `customers_create`

---

## Sales

### List Sales
```http
GET /api/sales/?page=1&pageSize=10
Authorization: Bearer {token}
```

**Permissions Required**: `sales_view`

---

### Create Sale
```http
POST /api/sales/
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": 1,
  "total": 2499.99,
  "status": "completed"
}
```

**Permissions Required**: `sales_create`

---

## Dashboard

### Get Summary
Get dashboard statistics

```http
GET /api/dashboard/summary
Authorization: Bearer {token}
```

**Permissions Required**: `reports_view`

**Response** (200 OK):
```json
{
  "totalProducts": 100,
  "totalSales": 250,
  "totalRevenue": 125000.00,
  "lowStockItems": 5,
  "totalCustomers": 50,
  "totalSuppliers": 20,
  "inventoryValue": 50000.00,
  "chartData": [...],
  "recentSales": [...]
}
```

**Rate Limit**: 30/minute

---

## Audit Logs

### List Audit Logs
```http
GET /api/audit-logs/?page=1&pageSize=50
Authorization: Bearer {token}
```

**Permissions Required**: `audit_logs_view`

---

### Get Permission Denials
View recent permission denials

```http
GET /api/audit-logs/permission-denials?days=7
Authorization: Bearer {token}
```

**Permissions Required**: `audit_logs_view`

---

### Get Auth Failures
View authentication failures

```http
GET /api/audit-logs/auth-failures?hours=24
Authorization: Bearer {token}
```

**Permissions Required**: `audit_logs_view`

---

## Error Handling

### Standard Error Response
```json
{
  "detail": "Error message"
}
```

### Common Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden (Permission Denied)
- **404**: Not Found
- **422**: Validation Error
- **429**: Too Many Requests (Rate Limited)
- **500**: Server Error

---

## Rate Limiting

Global rate limits per IP address:

| Endpoint | Limit |
|----------|-------|
| Auth (login/register) | 5/minute |
| Dashboard | 30/minute |
| Other endpoints | 30/minute |

**Headers**:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1655000000
```

---

## Security

### Authentication
All protected endpoints require Bearer token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Permissions
User permissions are role-based:

| Role | Level | Capabilities |
|------|-------|--------------|
| Admin | 5 | All permissions |
| Manager | 4 | Management & creation |
| Staff | 3 | View & limited creation |
| User | 2 | Self-service |
| Viewer | 1 | Read-only |

### HTTPS
Always use HTTPS in production. HTTP will be automatically redirected.

---

## Pagination

Standard pagination format:

```http
GET /api/products/?page=1&pageSize=10
```

**Parameters**:
- `page`: Page number (minimum 1)
- `pageSize`: Items per page (1-100, default 10)

**Response**:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "page_size": 10,
  "total_pages": 10
}
```

---

## Search & Filtering

### Search
Search by text (name, email, SKU, etc):

```http
GET /api/products/?search=laptop
```

### Filtering
Filter by specific field:

```http
GET /api/products/?status=Active&category_id=1
```

### Sorting
Sort by field (default: created_at DESC):

```http
GET /api/products/?sort=-price
GET /api/products/?sort=name
```

---

## Webhook Events

Webhooks notify external services of events:

```json
{
  "event": "product.created",
  "timestamp": "2024-06-16T10:30:00Z",
  "data": {...}
}
```

**Events**:
- `product.created`
- `product.updated`
- `product.deleted`
- `sale.created`
- `purchase.created`
- `permission.denied`

---

## Versioning

API versioning via URL:

```http
GET /api/v1/products/  # Version 1 (current)
GET /api/v2/products/  # Version 2 (future)
```

Current version: **v1**

---

## Testing

### cURL Examples

**Register**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123","name":"User"}'
```

**List Products**:
```bash
curl -X GET "http://localhost:8000/api/products/?page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Product**:
```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","sku":"LAP-001","price":999.99,"cost":600,"stock":50}'
```

### Postman Collection
Import collection from `/postman-collection.json` (if available)

---

## Support

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **Issues**: GitHub Issues
- **Email**: support@example.com

---

**Last Updated**: June 2026
**Version**: 1.0.0
