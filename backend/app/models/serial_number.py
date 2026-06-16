from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class SerialNumber(Base):
    __tablename__ = "serial_numbers"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    serial = Column(String, unique=True, nullable=False)
    status = Column(String, default="available")  # 'available', 'sold', 'reserved'
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", backref="serial_numbers")
    purchase = relationship("Purchase", foreign_keys=[purchase_id])
    sale = relationship("Sale", foreign_keys=[sale_id])
