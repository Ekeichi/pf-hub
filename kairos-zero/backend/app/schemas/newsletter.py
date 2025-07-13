"""
Schémas Pydantic pour la newsletter.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class NewsletterSubscribe(BaseModel):
    """Schéma pour l'inscription à la newsletter."""
    email: EmailStr


class NewsletterUnsubscribe(BaseModel):
    """Schéma pour le désabonnement de la newsletter."""
    email: EmailStr


class NewsletterSubscriberResponse(BaseModel):
    """Schéma pour la réponse d'abonné newsletter."""
    id: int
    email: str
    is_active: bool
    subscribed_at: datetime
    unsubscribed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 