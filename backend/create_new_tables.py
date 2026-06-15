from app.core.database import engine, Base
from app.models import (
    StockMovement, Settings, Notification, Role, AuditLog,
    SerialNumber, Batch, Return, Invoice
)

# Create all new tables
Base.metadata.create_all(bind=engine)

print("✅ New tables created successfully!")
print("Created tables:")
print("- stock_movements")
print("- settings")
print("- notifications")
print("- roles")
print("- audit_logs")
print("- serial_numbers")
print("- batches")
print("- returns")
print("- invoices")
