/**
 * Service pour la gestion de la newsletter
 */

const API_BASE_URL = 'http://localhost:8000/api';

export interface NewsletterSubscriber {
  id: number;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface NewsletterSubscribeData {
  email: string;
}

export interface NewsletterUnsubscribeData {
  email: string;
}

export interface SubscriberCount {
  active_subscribers: number;
  message: string;
}

class NewsletterService {
  /**
   * Inscription à la newsletter
   */
  async subscribe(email: string): Promise<NewsletterSubscriber> {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'inscription à la newsletter');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur inscription newsletter:', error);
      throw error;
    }
  }

  /**
   * Désabonnement de la newsletter
   */
  async unsubscribe(email: string): Promise<NewsletterSubscriber> {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du désabonnement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur désabonnement newsletter:', error);
      throw error;
    }
  }

  /**
   * Récupération du nombre d'abonnés
   */
  async getSubscriberCount(): Promise<SubscriberCount> {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/subscribers/count`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du nombre d\'abonnés');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération nombre abonnés:', error);
      throw error;
    }
  }

  /**
   * Récupération de tous les abonnés
   */
  async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/subscribers`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des abonnés');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération abonnés:', error);
      throw error;
    }
  }
}

export const newsletterService = new NewsletterService(); 