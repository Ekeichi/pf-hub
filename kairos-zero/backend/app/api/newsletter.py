"""
Routes pour la newsletter.
Contient les endpoints pour :
- Inscription à la newsletter
- Désabonnement
- Statistiques (admin)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.repositories.newsletter import NewsletterRepository
from app.schemas.newsletter import NewsletterSubscribe, NewsletterUnsubscribe, NewsletterSubscriberResponse
from typing import List

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=NewsletterSubscriberResponse, status_code=status.HTTP_201_CREATED)
def subscribe_to_newsletter(subscription_data: NewsletterSubscribe, db: Session = Depends(get_db)):
    """
    Inscrit un email à la newsletter.
    
    Args:
        subscription_data: Données d'inscription (email)
        db: Session de base de données
        
    Returns:
        NewsletterSubscriberResponse: Abonné créé ou mis à jour
        
    Raises:
        HTTPException: Si l'email est invalide
    """
    newsletter_repo = NewsletterRepository(db)
    
    try:
        subscriber = newsletter_repo.subscribe_email(subscription_data.email)
        
        return NewsletterSubscriberResponse(
            id=subscriber.id,
            email=subscriber.email,
            is_active=subscriber.is_active,
            subscribed_at=subscriber.subscribed_at,
            unsubscribed_at=subscriber.unsubscribed_at
        )
        
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erreur lors de l'inscription à la newsletter"
        )


@router.post("/unsubscribe", response_model=NewsletterSubscriberResponse)
def unsubscribe_from_newsletter(unsubscription_data: NewsletterUnsubscribe, db: Session = Depends(get_db)):
    """
    Désabonne un email de la newsletter.
    
    Args:
        unsubscription_data: Données de désabonnement (email)
        db: Session de base de données
        
    Returns:
        NewsletterSubscriberResponse: Abonné mis à jour
        
    Raises:
        HTTPException: Si l'email n'est pas trouvé
    """
    newsletter_repo = NewsletterRepository(db)
    
    subscriber = newsletter_repo.unsubscribe_email(unsubscription_data.email)
    
    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email non trouvé dans les abonnés"
        )
    
    return NewsletterSubscriberResponse(
        id=subscriber.id,
        email=subscriber.email,
        is_active=subscriber.is_active,
        subscribed_at=subscriber.subscribed_at,
        unsubscribed_at=subscriber.unsubscribed_at
    )


@router.get("/subscribers/count")
def get_subscriber_count(db: Session = Depends(get_db)):
    """
    Récupère le nombre d'abonnés actifs.
    
    Args:
        db: Session de base de données
        
    Returns:
        dict: Nombre d'abonnés actifs
    """
    newsletter_repo = NewsletterRepository(db)
    count = newsletter_repo.get_subscriber_count()
    
    return {
        "active_subscribers": count,
        "message": f"Il y a actuellement {count} abonné(s) à la newsletter"
    }


@router.get("/subscribers", response_model=List[NewsletterSubscriberResponse])
def get_all_subscribers(db: Session = Depends(get_db)):
    """
    Récupère tous les abonnés actifs.
    
    Args:
        db: Session de base de données
        
    Returns:
        List[NewsletterSubscriberResponse]: Liste des abonnés actifs
    """
    newsletter_repo = NewsletterRepository(db)
    subscribers = newsletter_repo.get_active_subscribers()
    
    return [
        NewsletterSubscriberResponse(
            id=subscriber.id,
            email=subscriber.email,
            is_active=subscriber.is_active,
            subscribed_at=subscriber.subscribed_at,
            unsubscribed_at=subscriber.unsubscribed_at
        )
        for subscriber in subscribers
    ] 