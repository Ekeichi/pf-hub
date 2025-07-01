import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiService';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await ApiService.updateProfile(formData);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            Retour au dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations du profil */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Informations personnelles</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-900 border border-green-700 rounded-lg">
                  <p className="text-green-300">{success}</p>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prénom</label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom</label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
                    >
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstname: user?.firstname || '',
                          lastname: user?.lastname || '',
                          email: user?.email || ''
                        });
                      }}
                      className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Prénom</p>
                    <p className="font-medium">{user?.firstname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Nom</p>
                    <p className="font-medium">{user?.lastname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations du compte */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Informations du compte</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Méthode d'authentification</p>
                  <p className="font-medium">{user?.auth_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Compte créé le</p>
                  <p className="font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Charte acceptée</p>
                  <p className="font-medium">
                    {user?.charte_accepted ? 'Oui' : 'Non'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Compte Strava lié</p>
                  <p className="font-medium">
                    {user?.has_strava_linked ? 'Oui' : 'Non'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                {!user?.has_strava_linked && (
                  <button
                    onClick={() => navigate('/strava-link')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Lier mon compte Strava
                  </button>
                )}
                <button
                  onClick={() => navigate('/upload-gpx')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Uploader un fichier GPX
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 