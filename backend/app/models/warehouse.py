from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.core.database import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(500))
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())