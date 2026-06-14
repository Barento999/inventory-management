from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, Date, ForeignKey, func
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

    class Config:
        from_attributes = True
