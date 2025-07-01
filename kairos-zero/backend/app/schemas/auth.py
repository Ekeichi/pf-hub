"""
Schémas Pydantic pour l'authentification.
Définit les modèles de données pour :
- Inscription
- Connexion
- Réponses d'authentification
"""

from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    """Schéma pour l'inscription d'un utilisateur."""
    email: EmailStr
    password: str
    firstname: str
    lastname: str
    charte_accepted: bool
    
    @validator('password')
    def validate_password(cls, v):
        """Valide que le mot de passe fait au moins 8 caractères."""
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        return v
    
    @validator('charte_accepted')
    def validate_charte(cls, v):
        """Valide que la charte a été acceptée."""
        if not v:
            raise ValueError('Vous devez accepter la charte d\'utilisation')
        return v


class UserLogin(BaseModel):
    """Schéma pour la connexion d'un utilisateur."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schéma pour la réponse de token."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # en minutes


class TokenData(BaseModel):
    """Schéma pour les données du token."""
    user_id: Optional[int] = None


class UserResponse(BaseModel):
    """Schéma pour la réponse utilisateur (sans mot de passe)."""
    id: int
    email: str
    firstname: str
    lastname: str
    charte_accepted: bool
    charte_accepted_at: Optional[datetime]
    created_at: datetime
    has_strava_linked: bool
    auth_method: str
    
    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """Schéma pour la mise à jour du profil utilisateur."""
    firstname: Optional[str] = None
    lastname: Optional[str] = None 