from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False, unique=True)
    file_size = Column(BigInteger, nullable=False)  # in bytes
    mime_type = Column(String(100), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Optional: relate to an entity
    related_entity = Column(String(100), nullable=True)  # e.g., "product", "invoice"
    related_id = Column(Integer, nullable=True)

    uploader = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<File {self.id}: {self.original_filename}>"
