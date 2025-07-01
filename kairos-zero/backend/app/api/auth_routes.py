"""
Routes d'authentification.
Contient les endpoints pour :
- Inscription d'utilisateur
- Connexion
- Récupération du profil
- Mise à jour du profil
- Déconnexion
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.repositories.user import UserRepository
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, UserProfile
from app.utils.auth_utils import create_access_token
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from datetime import timedelta
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Inscription d'un nouvel utilisateur.
    
    Args:
        user_data: Données d'inscription (email, password, firstname, lastname, charte_accepted)
        db: Session de base de données
        
    Returns:
        UserResponse: Utilisateur créé (sans mot de passe)
        
    Raises:
        HTTPException: Si l'email existe déjà ou données invalides
    """
    user_repo = UserRepository(db)
    
    # Vérifier si l'email existe déjà
    existing_user = user_repo.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )
    
    try:
        # Créer l'utilisateur
        user = user_repo.create_user(
            email=user_data.email,
            password=user_data.password,
            firstname=user_data.firstname,
            lastname=user_data.lastname
        )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            firstname=user.firstname,
            lastname=user.lastname,
            charte_accepted=user.charte_accepted,
            charte_accepted_at=user.charte_accepted_at,
            created_at=user.created_at,
            has_strava_linked=user.has_strava_linked,
            auth_method=user.auth_method
        )
        
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erreur lors de la création du compte"
        )


@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Connexion d'un utilisateur.
    
    Args:
        user_data: Données de connexion (email, password)
        db: Session de base de données
        
    Returns:
        Token: Token d'accès JWT
        
    Raises:
        HTTPException: Si les identifiants sont incorrects
    """
    user_repo = UserRepository(db)
    
    # Authentifier l'utilisateur
    user = user_repo.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Créer le token d'accès
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Récupère le profil de l'utilisateur connecté.
    
    Args:
        current_user: Utilisateur connecté (via dépendance)
        
    Returns:
        UserResponse: Profil de l'utilisateur
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        firstname=current_user.firstname,
        lastname=current_user.lastname,
        charte_accepted=current_user.charte_accepted,
        charte_accepted_at=current_user.charte_accepted_at,
        created_at=current_user.created_at,
        has_strava_linked=current_user.has_strava_linked,
        auth_method=current_user.auth_method
    )


@router.put("/me", response_model=UserResponse)
def update_user_profile(
    profile_data: UserProfile,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Met à jour le profil de l'utilisateur connecté.
    
    Args:
        profile_data: Nouvelles données du profil
        current_user: Utilisateur connecté
        db: Session de base de données
        
    Returns:
        UserResponse: Profil mis à jour
    """
    user_repo = UserRepository(db)
    
    updated_user = user_repo.update_user_profile(
        user_id=current_user.id,
        firstname=profile_data.firstname,
        lastname=profile_data.lastname
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        firstname=updated_user.firstname,
        lastname=updated_user.lastname,
        charte_accepted=updated_user.charte_accepted,
        charte_accepted_at=updated_user.charte_accepted_at,
        created_at=updated_user.created_at,
        has_strava_linked=updated_user.has_strava_linked,
        auth_method=updated_user.auth_method
    )


@router.post("/logout")
def logout_user():
    """
    Déconnexion de l'utilisateur.
    Note: Avec JWT, la déconnexion se fait côté client en supprimant le token.
    Cette route peut être utilisée pour la journalisation.
    
    Returns:
        dict: Message de confirmation
    """
    return {"message": "Déconnexion réussie"}


@router.post("/refresh", response_model=Token)
def refresh_token(current_user: User = Depends(get_current_active_user)):
    """
    Renouvelle le token JWT de l'utilisateur connecté.
    
    Args:
        current_user: Utilisateur connecté (via dépendance)
        
    Returns:
        Token: Nouveau token d'accès JWT
    """
    # Créer un nouveau token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(current_user.id)}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES
    )


# Route de test pour vérifier l'authentification
@router.get("/test")
def test_auth(current_user: User = Depends(get_current_active_user)):
    """
    Route de test pour vérifier l'authentification.
    
    Args:
        current_user: Utilisateur connecté
        
    Returns:
        dict: Informations de test
    """
    return {
        "message": "Authentification réussie",
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name
    } 