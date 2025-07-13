# Guide de déploiement sur Render

## Variables d'environnement requises

### Backend (Web Service)

```bash
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=https://pf-hub-backend.onrender.com/api/strava/callback
ENVIRONMENT=production
```

### Frontend (Static Site)

```bash
VITE_API_URL=https://pf-hub-backend.onrender.com/api
```

## Configuration des services

### 1. Base de données PostgreSQL
- **Type** : PostgreSQL
- **Nom** : `pf-hub-db`
- **Plan** : Free

### 2. Backend FastAPI
- **Type** : Web Service
- **Nom** : `pf-hub-backend`
- **Environment** : Python 3
- **Root Directory** : `backend`
- **Build Command** : `pip install -r requirements.txt`
- **Start Command** : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 3. Frontend React
- **Type** : Static Site
- **Nom** : `pf-hub-frontend`
- **Root Directory** : `pf-hub-frontend`
- **Build Command** : `npm install && npm run build`
- **Publish Directory** : `dist`

## URLs finales
- **Backend** : `https://pf-hub-backend.onrender.com`
- **Frontend** : `https://pf-hub-frontend.onrender.com`
- **API Docs** : `https://pf-hub-backend.onrender.com/docs`

## Post-déploiement
1. Mettre à jour l'URL de callback Strava vers : `https://pf-hub-backend.onrender.com/api/strava/callback`
2. Tester l'API via `/docs`
3. Tester le frontend 