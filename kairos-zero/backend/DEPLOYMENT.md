# Guide de Déploiement Backend

## Variables d'Environnement Requises

```env
# Configuration de la base de données
DATABASE_URL=postgresql://user:password@host:port/database

# Clés secrètes
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configuration Strava
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=https://your-backend-url.com/api/strava/callback

# Configuration de production
ENVIRONMENT=production
```

## Déploiement sur Railway

1. Connectez votre repo GitHub à Railway
2. Créez un nouveau service "Web Service"
3. Configurez les variables d'environnement
4. Déployez !

## Déploiement sur Render

1. Connectez votre repo GitHub à Render
2. Créez un nouveau "Web Service"
3. Configurez les variables d'environnement
4. Déployez !

## Déploiement sur Heroku

1. Installez Heroku CLI
2. `heroku create your-app-name`
3. Configurez les variables d'environnement
4. `git push heroku main` 