import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Utiliser PostgreSQL en production, SQLite en développement
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./strava.db")

# Gestion spéciale pour Render qui utilise postgres:// au lieu de postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if DATABASE_URL.startswith("postgresql"):
    # Configuration PostgreSQL
    engine = create_engine(DATABASE_URL)
else:
    # Configuration SQLite (développement)
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Base pour tous les modèles
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()