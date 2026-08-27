'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_V5_BASE_URL } from '@/constants/api';
import ProFooter from '@/components/ProFooter';

interface ChartData {
  [key: string]: number;
}

interface UserPointsResponse {
  chartData: ChartData;
  totalDurationFormatted: string;
  start_date: string;
  end_date: string;
}

export default function UserPointPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<ChartData>({});
  const [totalDurationFormatted, setTotalDurationFormatted] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userSession = localStorage.getItem('userSession');

      if (isLoggedIn !== 'true' || !userSession) {
        router.push('/login');
        return;
      }

      // Set default date range (1 year)
      // const today = new Date();
      // const oneYearAgo = new Date();
      // oneYearAgo.setFullYear(today.getFullYear() - 1);

      // setStartDate(oneYearAgo.toISOString().split('T')[0]);
      // setEndDate(today.toISOString().split('T')[0]);

      // // Fetch initial data
      // fetchUserPoints(oneYearAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]);
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);

      setStartDate(oneWeekAgo.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);

      fetchUserPoints(oneWeekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]);
    };

    checkAuth();
  }, [router]);

  const fetchUserPoints = async (start: string, end: string) => {
    try {
      setLoading(true);
      setError('');

      const userSession = localStorage.getItem('userSession');
      if (!userSession) {
        setError('Session not found. Please login again.');
        return;
      }

      const session = JSON.parse(userSession);
      let userId = session.userData?.user_id || session.userData?.id;

      if (!userId) {
        userId = session.user_id || session.id || session.userData?.id;
      }

      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      const requestBody = new URLSearchParams({
        user_id: userId.toString(),
        start_date: start,
        end_date: end
      });

      const response = await fetch(`${API_V5_BASE_URL}/userviewpoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'GSTV-NextJS-App/1.0',
        },
        body: requestBody,
      });

      const data: UserPointsResponse = await response.json();

      if (response.ok && data) {
        setChartData(data.chartData || {});
        setTotalDurationFormatted(data.totalDurationFormatted || '0 minutes');
        setStartDate(data.start_date || start);
        setEndDate(data.end_date || end);
      } else {
        setError('Failed to load user points data');
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    await fetchUserPoints(startDate, endDate);
    setSubmitLoading(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    // Load Chart.js and create chart when chartData changes
    if (Object.keys(chartData).length > 0) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        createChart();
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [chartData]);

  const createChart = () => {
    const canvas = document.getElementById('weeklyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    const existingChart = (window as any).Chart?.getChart?.(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(chartData),
        datasets: [{
          label: 'ટોટલ અવધિ',
          data: Object.values(chartData),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const totalDurationInMinutes = Math.round(context.raw);
                const hours = Math.floor(totalDurationInMinutes / 60);
                const minutes = (totalDurationInMinutes % 60).toString().padStart(2, '0');

                if (hours > 0) {
                  return `${hours}h ${minutes}m`;
                } else {
                  return `${minutes}m`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              display: true
            }
          },
          y: {
            ticks: {
              callback: function(value: any) {
                const hours = Math.floor(value / 60);
                const minutes = (value % 60).toString().padStart(2, '0');

                if (hours > 0) {
                  return `${hours}h ${minutes}m`;
                } else {
                  return `${minutes}m`;
                }
              }
            }
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="profilePage">
        <div className="text-center" style={{ padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">લોડ થઈ રહ્યું છેલોડ થઈ રહ્યું છે...</span>
          </div>
          <p style={{ marginTop: '20px' }}>યુઝર પોઇન્ટ લોડ થઈ રહ્યા છે...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.3/themes/base/jquery-ui.min.css" />

      <div className="profilePage">

        {error && (
          <div className="error-message mb-3 text-center" style={{ color: 'red' }}>
            {error}
          </div>
        )}

        {/* Date Range Picker */}
        <form onSubmit={handleSubmit} className="date-range-form">
          <label htmlFor="start_date">ફર્સ્ટ તારીખ:</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label htmlFor="end_date">છેલ્લી તારીખ:</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <button type="submit" disabled={submitLoading}>
            {submitLoading ? 'લોડ કરી રહ્યું છે...' : 'સર્ચ'}
          </button>
        </form>

        <div className="text-center">
          <p>
            <b>ટોટલ ટાઇમ:</b> {totalDurationFormatted} <br />
            ({formatDate(startDate)} થી {formatDate(endDate)} સુધી)
          </p>
        </div>

        <div id="noDataMessage" className="text-center" style={{ display: Object.keys(chartData).length === 0 ? 'block' : 'none', color: 'red' }}>
          <p>ચાલુ અઠવાડિયાનો ડેટા મળ્યો નથી.</p>
        </div>

        {/* Chart Container */}
        <div id="chartContainer" style={{ display: Object.keys(chartData).length > 0 ? 'block' : 'none' }}>
          <br />
          <canvas id="weeklyChart"></canvas>
          <br /><br />
        </div>

      </div>

    </>
  );
}