from app.core.database import SessionLocal
from app.models import Settings, Notification, Role, AuditLog, SerialNumber, Batch, Return, Invoice, Product, Sale
from datetime import datetime, date

db = SessionLocal()

try:
    # Seed Roles
    if db.query(Role).count() == 0:
        roles = [
            Role(name="Admin", description="Full system access", permissions='["all"]'),
            Role(name="Manager", description="Manage inventory and sales", permissions='["products", "inventory", "sales", "purchases", "reports"]'),
            Role(name="Staff", description="View and edit products", permissions='["products", "inventory"]'),
            Role(name="Viewer", description="Read-only access", permissions='["view"]'),
        ]
        for role in roles:
            db.add(role)
        print("✅ Seeded 4 roles")
    
    # Seed Notifications
    if db.query(Notification).count() == 0:
        notifications = [
            Notification(title="Welcome", message="Welcome to Inventory Management System", type="info"),
            Notification(title="Low Stock Alert", message="Some products are running low on stock", type="warning"),
            Notification(title="System Update", message="System has been updated successfully", type="success"),
        ]
        for notification in notifications:
            db.add(notification)
        print("✅ Seeded 3 notifications")
    
    # Seed Audit Logs
    if db.query(AuditLog).count() == 0:
        audit_logs = [
            AuditLog(user_id=8, action="CREATE", entity_type="Product", entity_id=21, details="Created product Wireless Mouse"),
            AuditLog(user_id=8, action="UPDATE", entity_type="Product", entity_id=21, details="Updated product Wireless Mouse"),
            AuditLog(user_id=9, action="CREATE", entity_type="Sale", entity_id=11, details="Created sale #11"),
        ]
        for log in audit_logs:
            db.add(log)
        print("✅ Seeded 3 audit logs")
    
    # Seed Serial Numbers
    if db.query(SerialNumber).count() == 0:
        products = db.query(Product).limit(5).all()
        serial_numbers = []
        for i, product in enumerate(products):
            for j in range(3):
                serial_numbers.append(
                    SerialNumber(
                        product_id=product.id,
                        serial=f"SN-{product.sku}-{j+1:03d}",
                        status="available"
                    )
                )
        for serial in serial_numbers:
            db.add(serial)
        print(f"✅ Seeded {len(serial_numbers)} serial numbers")
    
    # Seed Batches
    if db.query(Batch).count() == 0:
        products = db.query(Product).limit(3).all()
        batches = []
        for i, product in enumerate(products):
            batches.append(
                Batch(
                    product_id=product.id,
                    batch_number=f"BATCH-{product.sku}-{i+1}",
                    quantity=100,
                    expiry_date=date(2025, 12, 31)
                )
            )
        for batch in batches:
            db.add(batch)
        print(f"✅ Seeded {len(batches)} batches")
    
    # Seed Returns
    if db.query(Return).count() == 0:
        sales = db.query(Sale).limit(2).all()
        products = db.query(Product).limit(2).all()
        returns = [
            Return(sale_id=sales[0].id, product_id=products[0].id, quantity=1, reason="Defective product", status="pending"),
            Return(sale_id=sales[1].id, product_id=products[1].id, quantity=2, reason="Wrong item ordered", status="approved"),
        ]
        for return_item in returns:
            db.add(return_item)
        print(f"✅ Seeded {len(returns)} returns")
    
    # Seed Invoices
    if db.query(Invoice).count() == 0:
        sales = db.query(Sale).limit(3).all()
        invoices = []
        for i, sale in enumerate(sales):
            invoices.append(
                Invoice(
                    sale_id=sale.id,
                    invoice_number=f"INV-{2024}-{i+1:04d}",
                    total=sale.total,
                    status="paid",
                    due_date=date(2024, 12, 31),
                    paid_date=date(2024, 11, 15)
                )
            )
        for invoice in invoices:
            db.add(invoice)
        print(f"✅ Seeded {len(invoices)} invoices")
    
    db.commit()
    print("\n🎉 All new tables seeded successfully!")
    
except Exception as e:
    db.rollback()
    print(f"❌ Error seeding data: {e}")
finally:
    db.close()
