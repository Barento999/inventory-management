from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    invoice_number = Column(String, unique=True, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String, default="pending")  # 'pending', 'paid', 'overdue'
    due_date = Column(Date, nullable=True)
    paid_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sale = relationship("Sale", backref="invoices")
