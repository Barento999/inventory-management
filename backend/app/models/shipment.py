from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class ShipmentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False, index=True)
    tracking_number = Column(String(100), unique=True, index=True)
    carrier = Column(String(100), nullable=False)  # e.g., "FedEx", "UPS", "DHL"
    status = Column(Enum(ShipmentStatus), default=ShipmentStatus.PENDING, index=True)
    
    # Addresses
    ship_from_address = Column(Text, nullable=False)
    ship_to_address = Column(Text, nullable=False)
    
    # Dimensions & Weight
    weight_kg = Column(Float, nullable=False)
    length_cm = Column(Float, nullable=True)
    width_cm = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    
    # Dates
    ship_date = Column(DateTime, nullable=True)
    delivery_date = Column(DateTime, nullable=True)
    expected_delivery = Column(DateTime, nullable=True)
    
    # Cost
    shipping_cost = Column(Float, default=0)
    insurance_cost = Column(Float, default=0)
    
    # Notes
    notes = Column(Text, nullable=True)
    is_return = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sale = relationship("Sale", back_populates="shipments")

    def __repr__(self):
        return f"<Shipment {self.id}: {self.tracking_number}>"
