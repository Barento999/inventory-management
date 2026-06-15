from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, default="Inventory Management")
    email = Column(String, default="admin@inventory.com")
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    currency = Column(String, default="USD")
    tax_rate = Column(Float, default=0.0)
    low_stock_threshold = Column(Integer, default=10)
