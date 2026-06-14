from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey, func
from app.core.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="draft")
    notes = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())

    class Config:
        from_attributes = True
