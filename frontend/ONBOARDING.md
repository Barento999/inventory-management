# InventoryPro - User Guide

## Getting Started

### First Steps

1. **Login to the System**
   - Use your credentials to log in
   - Demo credentials:
     - Admin: admin@demo.com / admin123
     - Manager: manager@demo.com / manager123
     - Staff: staff@demo.com / staff123

2. **Configure Your Company Settings**
   - Navigate to Settings
   - Update company name, email, phone, and address
   - Set your currency and timezone
   - Configure tax rate for your region

### Dashboard Overview

The dashboard provides a quick overview of your inventory:
- **Total Products**: Number of products in your catalog
- **Total Stock**: Total quantity across all products
- **Low Stock Items**: Products below reorder level
- **Total Value**: Inventory valuation
- **Monthly Sales**: Sales chart showing revenue trends
- **Recent Activities**: Latest stock movements and sales

## Product Management

### Adding Products

1. Navigate to Products
2. Click "Add Product"
3. Fill in the required fields:
   - Product Name
   - SKU (Stock Keeping Unit)
   - Category
   - Price and Cost
   - Initial Stock
   - Reorder Level
4. Click "Create Product"

### Advanced Product Features

**Barcode Support**
- Enter or scan barcode numbers for easy product identification

**Serial Number Tracking**
- Enable "Track Serial Numbers" for high-value items
- Manage individual serial numbers in the Serial Numbers section

**Expiration Date Tracking**
- Enable "Track Expiration Dates" for perishable items
- Set expiration days and manage batches

**Product Variants**
- Add variants like size, color, etc.
- Define variant options (e.g., Color: Red, Blue, Green)

## Inventory Management

### Stock Movements

1. Navigate to Inventory
2. View all stock movements with reasons
3. Filter by movement type (in, out, adjustment)

### Warehouses

1. Navigate to Warehouses
2. Add multiple warehouse locations
3. Assign products to specific warehouses
4. Set a default warehouse

### Serial Numbers

1. Navigate to Serial Numbers
2. Add serial numbers for tracked products
3. Track status (in_stock, sold, reserved)
4. View purchase history

### Batches

1. Navigate to Batches
2. Create batches for products with expiration dates
3. Track batch numbers and quantities
4. Monitor expiration dates

## Sales Management

### Creating Sales

1. Navigate to Sales
2. Click "New Sale"
3. Select customer
4. Add products and quantities
5. Save the sale

### Quotes & Estimates

1. Navigate to Quotes
2. Create a quote for a customer
3. Set valid until date
4. Convert quote to sale when accepted

### Returns & Refunds

1. Navigate to Returns
2. Create a return request
3. Specify items and reasons
4. Approve returns to restock inventory

### Invoicing

1. Navigate to Invoices
2. Generate invoices from sales
3. Track payment status
4. Export invoices as PDF

## Purchasing

### Creating Purchase Orders

1. Navigate to Purchases
2. Click "New Purchase"
3. Select supplier
4. Add products and quantities
5. Set expected delivery date
6. Submit for approval

### Purchase Approvals

- Purchase orders require approval before ordering
- Managers can approve or reject purchases
- Approved orders are marked as "ordered"
- Received orders update inventory automatically

## Shipping

### Shipping Tracking

1. Navigate to Shipping
2. View all shipments with tracking numbers
3. Update shipping information
4. Track delivery status
5. Click tracking numbers to view carrier tracking

## Reporting

### Available Reports

1. **Monthly Sales**: Revenue trends over time
2. **Top Products**: Best-selling items
3. **Inventory Valuation**: Total value of stock
4. **Low Stock**: Products needing reorder

### Exporting Reports

1. Navigate to Reports
2. Select the report tab
3. Click "Export CSV" or "Export PDF"
4. Download the file

## User Management

### Managing Users

1. Navigate to Users
2. Click "Add User"
3. Enter user details
4. Assign role (Admin, Manager, Staff, Viewer)
5. Set user status

### Roles and Permissions

- **Admin**: Full system access
- **Manager**: Manage inventory, sales, purchases, reports
- **Staff**: View and edit products, inventory
- **Viewer**: Read-only access

### Audit Logs

1. Navigate to Audit Logs
2. View all system activities
3. Filter by user, action, or entity
4. Track changes for compliance

## Settings

### Company Information

- Update company name, email, phone, address
- Set currency and timezone
- Configure tax rate and tax ID

### Payment Settings

- Enable Stripe payments
- Enter Stripe public and secret keys
- Enable PayPal integration
- Enter PayPal client ID

### Appearance

- Toggle dark/light mode
- Customize your viewing experience

### Demo Data

- Reset to default demo data
- Useful for testing and training

## Tips & Best Practices

### Inventory Management

- Set appropriate reorder levels to avoid stockouts
- Use serial number tracking for high-value items
- Track expiration dates for perishable goods
- Regularly review low stock reports

### Sales & Purchases

- Use quotes for price negotiations
- Convert quotes to sales when confirmed
- Require purchase approvals for better control
- Track shipping for customer satisfaction

### Reporting

- Regularly review sales reports
- Monitor inventory valuation
- Export reports for analysis
- Use data to make informed decisions

## Support

For additional help or questions:
- Check the README.md for technical details
- Review the demo credentials for testing
- Contact support for issues

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Quick search (when available)
- `Esc`: Close modals and dialogs
- `Enter`: Submit forms
- `Tab`: Navigate between form fields
