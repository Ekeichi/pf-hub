import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiService';

interface Activity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance_km: number;
  moving_time_minutes: number;
  total_elevation_gain: number;
  average_speed_kmh: number;
  effort_score: number;
}

const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [syncingActivities, setSyncingActivities] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [autoSyncInProgress, setAutoSyncInProgress] = useState(false);

  const fetchRecentActivities = async () => {
    if (!user?.has_strava_linked) return;
    
    try {
      setLoadingActivities(true);
      const data = await ApiService.getRecentActivities();
      setRecentActivities(data.activities || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités récentes:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSyncActivities = async () => {
    try {
      setSyncingActivities(true);
      setSyncError(null);
      
      const data = await ApiService.syncStravaActivities();
      console.log('Synchronisation réussie:', data);
      // Recharger les activités récentes après synchronisation
      await fetchRecentActivities();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setSyncError('Erreur de connexion lors de la synchronisation');
    } finally {
      setSyncingActivities(false);
    }
  };

  const triggerAutoSync = async () => {
    if (!user?.has_strava_linked) return;
    
    try {
      setAutoSyncInProgress(true);
      const data = await ApiService.syncStravaActivities();
      console.log('Synchronisation automatique réussie:', data);
      // Recharger les activités récentes après synchronisation
      await fetchRecentActivities();
    } catch (error) {
      console.warn('Erreur lors de la synchronisation automatique:', error);
    } finally {
      setAutoSyncInProgress(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
    // Déclencher la synchronisation automatique au chargement du dashboard
    triggerAutoSync();
  }, [user?.has_strava_linked]);

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h${mins.toString().padStart(2, '0')}` : `${mins}min`;
  };

  return (
    <div className="container">
      {/* Main Content */}
      <main style={{ paddingTop: 'var(--header-height)', minHeight: 'calc(100vh - var(--header-height))' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1>Tableau de bord</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Bienvenue {user?.firstname} {user?.lastname}
            </p>
          </div>

          {/* Statut Strava */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid var(--color-border)', 
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Statut Strava</h2>
              {user?.has_strava_linked && (
                <button
                  onClick={handleSyncActivities}
                  disabled={syncingActivities}
                  style={{
                    background: syncingActivities ? 'var(--color-text-secondary)' : '#FC4C02',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    cursor: syncingActivities ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {syncingActivities ? (
                    <>
                      <div className="loading" style={{ width: '16px', height: '16px' }}></div>
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.1rem' }}>↻</span>
                      Actualiser
                    </>
                  )}
                </button>
              )}
            </div>
            
            {syncError && (
              <div style={{ 
                background: 'rgba(255, 107, 107, 0.1)', 
                border: '1px solid #ff6b6b', 
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#ff6b6b'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong>Erreur de synchronisation:</strong> {syncError}
                </p>
              </div>
            )}
            
            {autoSyncInProgress && (
              <div style={{ 
                background: 'rgba(0, 212, 255, 0.1)', 
                border: '1px solid #00d4ff', 
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#00d4ff'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="loading" style={{ width: '16px', height: '16px' }}></div>
                  <strong>Synchronisation automatique en cours...</strong>
                </p>
              </div>
            )}
            
            {user?.has_strava_linked ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  color: '#10B981', 
                  fontSize: '1.5rem' 
                }}>✓</span>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    Compte Strava lié
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Vos activités sont synchronisées automatiquement
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  color: '#F59E0B', 
                  fontSize: '1.5rem' 
                }}>⚠</span>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    Compte Strava non lié
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Liez votre compte Strava pour synchroniser vos activités
                  </p>
                  <Link 
                    to="/strava-link"
                    style={{ 
                      color: '#FC4C02', 
                      textDecoration: 'underline',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem',
                      display: 'inline-block'
                    }}
                  >
                    Lier mon compte Strava
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Upload GPX</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Téléchargez un fichier GPX pour obtenir des prédictions de performance
              </p>
              <Link 
                to="/upload-gpx"
                className="btn primary"
                style={{ display: 'inline-block' }}
              >
                Uploader un fichier GPX
              </Link>
            </div>

            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Mon profil</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Gérez vos informations personnelles et paramètres
              </p>
              <Link 
                to="/profile"
                className="btn secondary"
                style={{ display: 'inline-block' }}
              >
                Voir mon profil
              </Link>
            </div>
          </div>

          {/* Dernières activités Strava */}
          {user?.has_strava_linked && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Dernières activités Strava</h2>
              
              {loadingActivities ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ 
                        width: '2rem', 
                        height: '2rem', 
                        border: '2px solid var(--color-primary)', 
                        borderTop: '2px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Chargement des activités...</p>
                </div>
              ) : recentActivities.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem'
                  }}>
                    <thead>
                      <tr style={{ 
                        borderBottom: '1px solid var(--color-border)',
                        textAlign: 'left'
                      }}>
                        <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>Activité</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>Date</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>Distance</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>Temps</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>Dénivelé</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>Vitesse moy.</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>Score d'effort</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.map((activity) => (
                        <tr key={activity.id} style={{ 
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <td style={{ padding: '0.75rem 0' }}>
                            <div>
                              <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                {activity.name}
                              </p>
                              <p style={{ 
                                color: 'var(--color-text-secondary)', 
                                fontSize: '0.8rem',
                                textTransform: 'capitalize'
                              }}>
                                {activity.type}
                              </p>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>
                            {formatDate(activity.start_date)}
                          </td>
                          <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>
                            {activity.distance_km} km
                          </td>
                          <td style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>
                            {formatTime(activity.moving_time_minutes)}
                          </td>
                          <td style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>
                            {activity.total_elevation_gain}m
                          </td>
                          <td style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>
                            {activity.average_speed_kmh} km/h
                          </td>
                          <td style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>
                            <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                backgroundColor: activity.effort_score >= 20 ? 'rgba(239, 68, 68, 0.1)' :
                                                                   activity.effort_score >= 10 ? 'rgba(249, 115, 22, 0.1)' :
                                                                   activity.effort_score >= 5 ? 'rgba(234, 179, 8, 0.1)' :
                                                                   'rgba(34, 197, 94, 0.1)',
                                color: activity.effort_score >= 20 ? 'rgb(185, 28, 28)' :
                                                                   activity.effort_score >= 10 ? 'rgb(194, 65, 12)' :
                                                                   activity.effort_score >= 5 ? 'rgb(161, 98, 7)' :
                                                                   'rgb(21, 128, 61)'
                            }}>
                                {activity.effort_score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Aucune activité trouvée. Synchronisez vos activités Strava pour les voir ici.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Informations du compte */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid var(--color-border)', 
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Informations du compte</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Email</p>
                <p style={{ fontWeight: '600' }}>{user?.email}</p>
              </div>
              <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Prénom</p>
                <p style={{ fontWeight: '600' }}>{user?.firstname}</p>
              </div>
              <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Nom</p>
                <p style={{ fontWeight: '600' }}>{user?.lastname}</p>
              </div>
              <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Méthode d'authentification</p>
                <p style={{ fontWeight: '600' }}>{user?.auth_method}</p>
              </div>
              <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Compte créé le</p>
                <p style={{ fontWeight: '600' }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Charte acceptée</p>
                <p style={{ fontWeight: '600' }}>
                  {user?.charte_accepted ? 'Oui' : 'Non'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 