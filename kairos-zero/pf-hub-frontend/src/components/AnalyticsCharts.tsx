import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ApiService } from '../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  acwr: {
    dates: string[];
    charge_aigue: number[];
    charge_chronique: number[];
    ratio_ac: number[];
  };
  ffm: {
    dates: string[];
    fatigue: number[];
    fitness: number[];
    performance: number[];
    forme: number[];
    rapport: number[];
  };
}

const AnalyticsCharts: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getAnalytics();
        if (data.error) {
          setError(data.error);
        } else {
          setAnalyticsData(data);
        }
      } catch (err) {
        setError('Erreur lors du chargement des analyses');
        console.error('Erreur analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          width: '2rem', 
          height: '2rem', 
          border: '2px solid var(--color-primary)', 
          borderTop: '2px solid transparent', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Chargement des analyses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: 'rgba(255, 107, 107, 0.1)', 
        border: '1px solid #ff6b6b', 
        borderRadius: '8px',
        padding: '1rem',
        color: '#ff6b6b',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const acwrChartData = {
    labels: analyticsData.acwr.dates,
    datasets: [
      {
        label: 'Charge Aiguë (7 jours)',
        data: analyticsData.acwr.charge_aigue,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Charge Chronique (28 jours)',
        data: analyticsData.acwr.charge_chronique,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Ratio ACWR',
        data: analyticsData.acwr.ratio_ac,
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const ffmChartData = {
    labels: analyticsData.ffm.dates,
    datasets: [
      {
        label: 'Fatigue',
        data: analyticsData.ffm.fatigue,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Fitness',
        data: analyticsData.ffm.fitness,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Performance',
        data: analyticsData.ffm.performance,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Forme',
        data: analyticsData.ffm.forme,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Rapport',
        data: analyticsData.ffm.rapport,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'var(--color-text-primary)',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--color-text-secondary)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'var(--color-text-secondary)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: 'var(--color-text-secondary)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr', 
      gap: '2rem' 
    }}>
      {/* Graphique ACWR */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        border: '1px solid var(--color-border)', 
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          Acute:Chronic Workload Ratio (ACWR)
        </h3>
        <div style={{ height: '300px' }}>
          <Line data={acwrChartData} options={chartOptions} />
        </div>
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          fontSize: '0.9rem', 
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          Le ratio ACWR mesure l'équilibre entre la charge d'entraînement récente (7 jours) et chronique (28 jours).
          Un ratio entre 0.8 et 1.3 est considéré comme optimal.
        </p>
      </div>

      {/* Graphique FFM */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        border: '1px solid var(--color-border)', 
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          Fatigue, Fitness, Performance, Forme et Rapport
        </h3>
        <div style={{ height: '300px' }}>
          <Line data={ffmChartData} options={chartOptions} />
        </div>
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          fontSize: '0.9rem', 
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          Modèle FFM : Fatigue (court terme), Fitness (long terme), Performance (équilibre), Forme (différence) et Rapport (ratio).
        </p>
      </div>
    </div>
  );
};

export default AnalyticsCharts; 