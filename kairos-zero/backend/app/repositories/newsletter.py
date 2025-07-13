"""
Repository pour la gestion des abonnés à la newsletter.
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from app.models.newsletter import NewsletterSubscriber
from datetime import datetime


class NewsletterRepository:
    """Repository pour la gestion des abonnés à la newsletter."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def subscribe_email(self, email: str) -> NewsletterSubscriber:
        """
        Inscrit un email à la newsletter.
        
        Args:
            email: Email à inscrire
            
        Returns:
            NewsletterSubscriber: Abonné créé ou mis à jour
            
        Raises:
            IntegrityError: Si l'email existe déjà
        """
        # Vérifier si l'email existe déjà
        existing = self.db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.email == email
        ).first()
        
        if existing:
            # Si l'abonné existe mais est désactivé, le réactiver
            if not existing.is_active:
                existing.is_active = True
                existing.unsubscribed_at = None
                self.db.commit()
                self.db.refresh(existing)
                return existing
            else:
                # L'email est déjà actif
                return existing
        
        # Créer un nouvel abonné
        subscriber = NewsletterSubscriber(
            email=email,
            is_active=True
        )
        
        self.db.add(subscriber)
        self.db.commit()
        self.db.refresh(subscriber)
        return subscriber
    
    def unsubscribe_email(self, email: str) -> Optional[NewsletterSubscriber]:
        """
        Désabonne un email de la newsletter.
        
        Args:
            email: Email à désabonner
            
        Returns:
            NewsletterSubscriber: Abonné mis à jour ou None si non trouvé
        """
        subscriber = self.db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.email == email
        ).first()
        
        if subscriber:
            subscriber.is_active = False
            subscriber.unsubscribed_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(subscriber)
            return subscriber
        
        return None
    
    def get_active_subscribers(self) -> List[NewsletterSubscriber]:
        """
        Récupère tous les abonnés actifs.
        
        Returns:
            List[NewsletterSubscriber]: Liste des abonnés actifs
        """
        return self.db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.is_active == True
        ).all()
    
    def get_subscriber_by_email(self, email: str) -> Optional[NewsletterSubscriber]:
        """
        Récupère un abonné par son email.
        
        Args:
            email: Email de l'abonné
            
        Returns:
            NewsletterSubscriber: Abonné trouvé ou None
        """
        return self.db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.email == email
        ).first()
    
    def get_subscriber_count(self) -> int:
        """
        Récupère le nombre d'abonnés actifs.
        
        Returns:
            int: Nombre d'abonnés actifs
        """
        return self.db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.is_active == True
        ).count() 