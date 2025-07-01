import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiService';

const UploadGPX: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.gpx')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Veuillez sélectionner un fichier GPX valide');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/upload-gpx', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload du fichier');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Rediriger vers la page de résultat après 2 secondes
      setTimeout(() => {
        navigate('/prediction-result', { state: { prediction: result } });
      }, 2000);

    } catch (err) {
      setError('Erreur lors de l\'upload du fichier GPX');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Upload de fichier GPX</h1>
          <p className="text-gray-400">
            Téléchargez votre fichier GPX pour obtenir une prédiction de performance
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Sélectionner un fichier GPX
            </label>
            <input
              type="file"
              accept=".gpx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-500 file:text-white
                hover:file:bg-orange-600
                file:cursor-pointer"
            />
          </div>

          {file && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg">
              <p className="text-green-300">
                Fichier uploadé avec succès ! Redirection vers les résultats...
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Upload en cours...
                </div>
              ) : (
                'Uploader et analyser'
              )}
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Annuler
            </button>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="space-y-2 text-gray-400">
            <li>• Le fichier doit être au format GPX</li>
            <li>• Assurez-vous que le fichier contient des données GPS valides</li>
            <li>• La taille maximale est de 10 MB</li>
            <li>• L'analyse peut prendre quelques secondes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadGPX;