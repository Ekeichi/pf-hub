"""
Repository pour la gestion des utilisateurs.
Contient les opérations CRUD pour les utilisateurs.
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from app.models.user import User
from app.utils.auth_utils import get_password_hash, verify_password
from datetime import datetime


class UserRepository:
    """Repository pour la gestion des utilisateurs."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, email: str, password: str, firstname: str, lastname: str) -> User:
        """
        Crée un nouvel utilisateur.
        
        Args:
            email: Email de l'utilisateur
            password: Mot de passe en clair
            firstname: Prénom
            lastname: Nom de famille
            
        Returns:
            User: Utilisateur créé
            
        Raises:
            IntegrityError: Si l'email existe déjà
        """
        hashed_password = get_password_hash(password)
        
        user = User(
            email=email,
            password_hash=hashed_password,
            firstname=firstname,
            lastname=lastname,
            charte_accepted=True,
            charte_accepted_at=datetime.utcnow()
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Récupère un utilisateur par son email.
        
        Args:
            email: Email de l'utilisateur
            
        Returns:
            User: Utilisateur trouvé ou None
        """
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Récupère un utilisateur par son ID.
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            User: Utilisateur trouvé ou None
        """
        return self.db.query(User).filter(User.id == user_id).first()
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authentifie un utilisateur avec email et mot de passe.
        
        Args:
            email: Email de l'utilisateur
            password: Mot de passe en clair
            
        Returns:
            User: Utilisateur authentifié ou None
        """
        user = self.get_user_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        return user
    
    def update_user_profile(self, user_id: int, firstname: str = None, lastname: str = None) -> Optional[User]:
        """
        Met à jour le profil d'un utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            firstname: Nouveau prénom (optionnel)
            lastname: Nouveau nom (optionnel)
            
        Returns:
            User: Utilisateur mis à jour ou None
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        if firstname is not None:
            user.firstname = firstname
        if lastname is not None:
            user.lastname = lastname
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def link_strava_token(self, user_id: int, strava_token_id: int) -> bool:
        """
        Lie un token Strava à un utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            strava_token_id: ID du token Strava
            
        Returns:
            bool: True si la liaison a réussi
        """
        from app.models.strava_token import StravaToken
        
        user = self.get_user_by_id(user_id)
        strava_token = self.db.query(StravaToken).filter(StravaToken.id == strava_token_id).first()
        
        if not user or not strava_token:
            return False
        
        strava_token.user_id = user_id
        self.db.commit()
        return True
    
    def get_all_users(self) -> List[User]:
        """
        Récupère tous les utilisateurs.
        
        Returns:
            List[User]: Liste de tous les utilisateurs
        """
        return self.db.query(User).all()
    
    def delete_user(self, user_id: int) -> bool:
        """
        Supprime un utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            bool: True si la suppression a réussi
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        self.db.delete(user)
        self.db.commit()
        return True 