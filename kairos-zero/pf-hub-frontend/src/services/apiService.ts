import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8000/api';

export class ApiService {
  private static async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const token = authService.getToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Méthodes d'authentification
  static async login(email: string, password: string): Promise<any> {
    return this.makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData: any): Promise<any> {
    return this.makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }



  static async refreshToken(): Promise<any> {
    return this.makeRequest(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
    });
  }

  // Méthodes Strava
  static async getStravaAuthUrl(): Promise<any> {
    return this.makeRequest(`${API_BASE_URL}/strava/auth`);
  }

  static async syncStravaActivities(): Promise<any> {
    return this.makeRequest(`${API_BASE_URL}/strava/sync-intelligent`);
  }

  static async linkStravaToken(code: string): Promise<any> {
    return this.makeRequest(`${API_BASE_URL}/strava/link-token`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  static async syncStravaActivitiesSimple(): Promise<any> {
    return this.makeRequest(`${API_BASE_URL}/strava/sync-simple`);
  }

  // Récupérer les activités récentes
  static async getRecentActivities(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/strava/recent-activities`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des activités récentes');
    }
    
    return response.json();
  }

  // Récupérer les zones cardiaques d'une activité
  static async getActivityHeartRateZones(activityId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/strava/activity/${activityId}/heart-rate-zones`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error retrieving heart rate zones');
    }
    
    return response.json();
  }

  // Récupérer les données d'analyse (ACWR et FFM)
  static async getAnalytics(): Promise<any> {
    return this.makeRequest(`${API_BASE_URL}/analytics`);
  }

  // Méthodes génériques pour les requêtes HTTP
  static async get(url: string): Promise<Response> {
    const token = authService.getToken();
    return fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  static async post(url: string, data?: any): Promise<Response> {
    const token = authService.getToken();
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export d'une instance par défaut
export const apiService = ApiService; 