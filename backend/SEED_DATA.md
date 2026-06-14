# Seed Data Guide

This document explains the seed data structure and how to use it.

## Seed Data Overview

The application includes comprehensive seed data with realistic inventory management scenarios:

### Categories (5 total)
- **Electronics**: Electronic devices and accessories
- **Office Supplies**: Stationery and office equipment
- **Furniture**: Office and warehouse furniture
- **Packaging**: Boxes, labels, and shipping materials
- **Tools**: Maintenance and repair tools

### Warehouses (3 total)
1. **Main Warehouse** (Austin, TX) - Default warehouse
2. **West Coast Storage** (Los Angeles, CA)
3. **Regional Distribution** (Dallas, TX)

### Products (10 total)
| SKU | Product | Price | Cost | Stock | Reorder Level |
|-----|---------|-------|------|-------|---------------|
| WM-001 | Wireless Mouse | $29.99 | $15.00 | 150 | 20 |
| UH-002 | USB-C Hub | $49.99 | $28.00 | 75 | 15 |
| AP-003 | A4 Paper Ream | $8.99 | $4.50 | 300 | 50 |
| OC-004 | Office Chair | $249.99 | $140.00 | 24 | 5 |
| SB-005 | Shipping Box (Medium) | $2.49 | $0.80 | 1,200 | 200 |
| MK-006 | Mechanical Keyboard | $89.99 | $52.00 | 45 | 10 |
| MS-007 | Monitor Stand | $39.99 | $18.00 | 32 | 8 |
| DL-008 | Desk Lamp | $59.99 | $28.00 | 18 | 5 |
| PT-009 | Packing Tape | $3.99 | $1.20 | 500 | 100 |
| WC-010 | Webcam HD | $69.99 | $35.00 | 28 | 8 |

### Suppliers (4 total)
1. **TechSupply Co.** - Electronics supplier (Austin, TX)
2. **Office Depot Wholesale** - Office supplies (Dallas, TX)
3. **FurniPro Ltd** - Furniture supplier (Houston, TX)
4. **PackagePro Solutions** - Packaging materials (Los Angeles, CA)

### Customers (5 total)
1. **Acme Corp** - New York, NY
2. **StartupHub Inc** - San Francisco, CA
3. **Retail Plus** - Chicago, IL
4. **Global Enterprises** - Boston, MA
5. **SmallBiz Solutions** - Seattle, WA

## Using Seed Data

### 1. Via Python Script
Run the seed script to display available seed data:
```bash
python seed.py
```

### 2. Via API Endpoints

#### Get Seed Data Summary
```bash
curl http://localhost:8000/api/seed/seed-summary
```

Response includes counts and a summary of all seed data.

#### Load Full Seed Data
```bash
curl -X POST http://localhost:8000/api/seed/load-seed-data
```

Returns all seed data in JSON format for loading into the application.

### 3. In Frontend/Application

The frontend can use the seed endpoints to:
1. Display seed data statistics on the dashboard
2. Allow users to initialize the system with seed data
3. Provide sample data for testing and demonstrations

Example usage in JavaScript:
```javascript
// Load seed data summary
const summary = await fetch('/api/seed/seed-summary').then(r => r.json());

// Load full seed data
const seedData = await fetch('/api/seed/load-seed-data', {
  method: 'POST'
}).then(r => r.json());
```

## Data Structure Format

### Categories
```json
{
  "name": "Category Name",
  "description": "Category Description"
}
```

### Warehouses
```json
{
  "name": "Warehouse Name",
  "location": "Full Address",
  "isDefault": true
}
```

### Products
```json
{
  "name": "Product Name",
  "sku": "SKU-001",
  "barcode": "1234567890123",
  "categoryId": 1,
  "price": 29.99,
  "cost": 15.00,
  "stock": 150,
  "reorderLevel": 20,
  "status": "Active",
  "description": "Product description",
  "warehouseId": 1
}
```

### Suppliers
```json
{
  "name": "Supplier Name",
  "email": "email@example.com",
  "phone": "+1-555-0101",
  "address": "Full Address",
  "contactPerson": "Contact Name"
}
```

### Customers
```json
{
  "name": "Customer Name",
  "email": "email@example.com",
  "phone": "+1-555-0201",
  "address": "Full Address"
}
```

## Database Integration

Once SQLAlchemy ORM models are created, the seed script can be updated to:
1. Create actual database records from seed data
2. Set up relationships between entities
3. Initialize audit logs and historical data

Current state: Seed data is available via API endpoints for import into the frontend.

## Future Enhancements

- [ ] Add sample purchases and sales transactions
- [ ] Add stock movement history
- [ ] Add invoice and quote examples
- [ ] Add user and role permissions data
- [ ] Create database migration that loads seed data automatically
- [ ] Add options to reset database to seed data state
