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
        label: 'Limite haute (1.3)',
        data: analyticsData.acwr.ratio_ac.map(() => 1.3),
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Limite basse (0.8)',
        data: analyticsData.acwr.ratio_ac.map(() => 0.8),
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Ratio ACWR',
        data: analyticsData.acwr.ratio_ac,
        borderColor: '#10B981',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
      },
    ],
  };

  const ffmChartData = {
    labels: analyticsData.ffm.dates,
    datasets: [
      {
        label: 'Fatigue',
        data: analyticsData.ffm.fatigue.map(value => value * 2),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Fitness',
        data: analyticsData.ffm.fitness,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
          maxTicksLimit: 8,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
          callback: function(value: any) {
            return value.toFixed(1);
          },
          stepSize: 0.2,
          min: 0,
          max: 2,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        beginAtZero: true,
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
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
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              color: 'var(--color-text-primary)', 
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Ratio ACWR
            </h3>
            <p style={{ 
              color: 'var(--color-text-secondary)', 
              fontSize: '0.9rem', 
              margin: '0.5rem 0 0 0'
            }}>
              Acute:Chronic Workload Ratio
            </p>
          </div>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: '#3B82F6',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Zone optimale: 0.8 - 1.3
          </div>
        </div>
        <div style={{ height: '350px', position: 'relative' }}>
          <Line data={acwrChartData} options={chartOptions} />
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: '#3B82F6' 
            }}></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Ratio ACWR
            </span>
          </div>
          <p style={{ 
            color: 'var(--color-text-secondary)', 
            fontSize: '0.8rem', 
            margin: 0,
            textAlign: 'right'
          }}>
            Équilibre charge récente vs chronique
          </p>
        </div>
      </div>

      {/* Graphique FFM */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        border: '1px solid var(--color-border)', 
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              color: 'var(--color-text-primary)', 
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Modèle FFM
            </h3>
            <p style={{ 
              color: 'var(--color-text-secondary)', 
              fontSize: '0.9rem', 
              margin: '0.5rem 0 0 0'
            }}>
              Fatigue, Fitness & Performance
            </p>
          </div>
        </div>
        <div style={{ height: '350px', position: 'relative' }}>
          <Line data={ffmChartData} options={chartOptions} />
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem',
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '2px', 
              backgroundColor: '#EF4444' 
            }}></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Fatigue
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '2px', 
              backgroundColor: '#3B82F6' 
            }}></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Fitness
            </span>
          </div>
        </div>
        <div style={{ 
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          color: '#3B82F6',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          <strong>Fitness vs Fatigue</strong> • Monitor the balance between your physical fitness and fatigue
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts; 