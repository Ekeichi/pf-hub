"""
Dépendances pour l'authentification.
Contient les fonctions pour :
- Récupérer l'utilisateur connecté
- Vérifier l'authentification
- Gérer les permissions
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.repositories.user import UserRepository
from app.utils.auth_utils import get_user_id_from_token
from app.schemas.auth import TokenData

# Schéma de sécurité pour les tokens Bearer
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Dépendance pour récupérer l'utilisateur connecté.
    
    Args:
        credentials: Credentials HTTP (token Bearer)
        db: Session de base de données
        
    Returns:
        User: Utilisateur connecté
        
    Raises:
        HTTPException: Si le token est invalide ou l'utilisateur n'existe pas
    """
    token = credentials.credentials
    user_id = get_user_id_from_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_repo = UserRepository(db)
    user = user_repo.get_user_by_id(user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_current_active_user(current_user = Depends(get_current_user)):
    """
    Dépendance pour récupérer l'utilisateur connecté et actif.
    
    Args:
        current_user: Utilisateur connecté (via get_current_user)
        
    Returns:
        User: Utilisateur connecté et actif
        
    Raises:
        HTTPException: Si l'utilisateur est inactif
    """
    # Pour l'instant, tous les utilisateurs sont considérés comme actifs
    # On peut ajouter un champ 'is_active' plus tard si nécessaire
    return current_user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Dépendance optionnelle pour récupérer l'utilisateur connecté.
    Ne lève pas d'exception si le token est invalide.
    
    Args:
        credentials: Credentials HTTP (token Bearer)
        db: Session de base de données
        
    Returns:
        User: Utilisateur connecté ou None
    """
    try:
        token = credentials.credentials
        user_id = get_user_id_from_token(token)
        
        if user_id is None:
            return None
        
        user_repo = UserRepository(db)
        user = user_repo.get_user_by_id(user_id)
        
        return user
    except:
        return None 