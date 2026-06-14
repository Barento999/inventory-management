from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    address = Column(String(500))
    contact_person = Column(String(255))
    created_at = Column(DateTime, default=func.now())

    class Config:
        from_attributes = True
