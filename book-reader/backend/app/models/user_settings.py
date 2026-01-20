from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    font_family = Column(String, default="'SF Pro Display', 'Inter', sans-serif")
    font_size = Column(Integer, default=17)
    line_height = Column(Float, default=1.8)
    paragraph_spacing = Column(Integer, default=16)
    spritz_speed = Column(Integer, default=250)

    user = relationship("User", back_populates="settings")
