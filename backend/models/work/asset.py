#backend/models/work/asset.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from models.base import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    asset_type = Column(String, nullable=True)
    serial_number = Column(String, nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    site = relationship("Site", back_populates="assets")

    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    organisation = relationship("Organisation", back_populates="assets")
