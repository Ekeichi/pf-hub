from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    Modèle utilisateur pour l'authentification classique.
    Supporte l'authentification par email/mot de passe, Google, et Apple.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # NULL si auth Google/Apple
    
    # Authentification externe
    google_id = Column(String, nullable=True, unique=True)
    apple_id = Column(String, nullable=True, unique=True)
    
    # Informations personnelles
    firstname = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    
    # Charte et conditions
    charte_accepted = Column(Boolean, default=False, nullable=False)
    charte_accepted_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relations
    strava_token = relationship("StravaToken", back_populates="user", uselist=False)
    strava_activities = relationship("StravaActivity", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', firstname='{self.firstname}')>"
    
    @property
    def full_name(self) -> str:
        """Retourne le nom complet de l'utilisateur."""
        return f"{self.firstname} {self.lastname}"
    
    @property
    def has_strava_linked(self) -> bool:
        """Vérifie si l'utilisateur a lié son compte Strava."""
        return self.strava_token is not None
    
    @property
    def auth_method(self) -> str:
        """Retourne la méthode d'authentification utilisée."""
        if self.google_id:
            return "google"
        elif self.apple_id:
            return "apple"
        else:
            return "email" 