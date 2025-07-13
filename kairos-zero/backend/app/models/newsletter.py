from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class NewsletterSubscriber(Base):
    """
    Modèle pour les abonnés à la newsletter.
    """
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    subscribed_at = Column(DateTime, default=func.now(), nullable=False)
    unsubscribed_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<NewsletterSubscriber(id={self.id}, email='{self.email}', active={self.is_active})>" 