/**
 * Service d'authentification pour gérer les appels API
 * Inscription, connexion, gestion des tokens JWT
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface UserRegisterData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  charte_accepted: boolean;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  charte_accepted: boolean;
  charte_accepted_at: string | null;
  created_at: string;
  has_strava_linked: boolean;
  auth_method: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class AuthService {
  private tokenKey = 'auth_token';

  /**
   * Sauvegarde le token dans le localStorage
   */
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Récupère le token depuis le localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Supprime le token du localStorage
   */
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData: UserRegisterData): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur backend:', errorData);
        
        // Gestion détaillée des erreurs
        if (errorData.detail) {
          throw new Error(errorData.detail);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        } else if (typeof errorData === 'string') {
          throw new Error(errorData);
        } else {
          throw new Error(`Erreur ${response.status}: ${JSON.stringify(errorData)}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(loginData: UserLoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`.replace('/api/api', '/api'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email ou mot de passe incorrect');
      }

      const authData = await response.json();
      this.saveToken(authData.access_token);
      return authData;
    } catch (error) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Aucun token d\'authentification');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          throw new Error('Token expiré ou invalide');
        }
        throw new Error('Erreur lors de la récupération du profil');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      throw error;
    }
  }



  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.removeToken();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du renouvellement du token');
      }

      const { access_token } = await response.json();
      this.saveToken(access_token);
      return access_token;
    } catch (error) {
      console.error('Erreur lors du renouvellement du token:', error);
      this.removeToken();
      return null;
    }
  }

  /**
   * Teste l'authentification
   */
  async testAuth(): Promise<{ message: string; user_id: number; email: string; full_name: string }> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Aucun token d\'authentification');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/test`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du test d\'authentification');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur test auth:', error);
      throw error;
    }
  }
}

// Instance singleton
export const authService = new AuthService(); 