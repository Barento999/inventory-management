from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey, func
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    barcode = Column(String(100))
    category_id = Column(Integer, ForeignKey("categories.id"))
    price = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=0)
    status = Column(String(50), default="Active")
    description = Column(Text)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    class Config:
        from_attributes = True
