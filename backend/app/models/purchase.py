from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, Date, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="draft")
    expected_date = Column(Date)
    notes = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())

    # Relationships
    supplier = relationship("Supplier", foreign_keys=[supplier_id])
    user = relationship("User", foreign_keys=[user_id])
