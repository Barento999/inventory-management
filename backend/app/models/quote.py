from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, Date, ForeignKey, func
from app.core.database import Base


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="draft")
    valid_until = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())

    class Config:
        from_attributes = True
