import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStrava?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireStrava = false 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Affichage du loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si Strava est requis mais pas lié
  if (requireStrava && user && !user.has_strava_linked) {
    return <Navigate to="/strava-link" replace />;
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
};

export default ProtectedRoute; 