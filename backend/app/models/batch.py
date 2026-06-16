from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    batch_number = Column(String, unique=True, nullable=False)
    quantity = Column(Integer, nullable=False)
    expiry_date = Column(Date, nullable=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", backref="batches")
    purchase = relationship("Purchase", foreign_keys=[purchase_id])
