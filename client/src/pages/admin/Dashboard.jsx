import React, { useState, useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import styles from '../../styles/Dashboard.module.css';
import { FiUsers, FiBook, FiActivity, FiClock } from 'react-icons/fi';
import axios from 'axios';

// Set default base URL for API calls
axios.defaults.baseURL = 'http://localhost:5000';

// Đăng ký components Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);



const AdminDashboard = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        const response = await axios.get('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Dashboard API response:', response.data); // For debugging
        
        if (response.data.success) {
          const data = response.data.data;
          
          // Convert single objects to arrays for consistent rendering
          data.monthlyUserStats = data.monthlyUserStats ? [data.monthlyUserStats] : [];
          data.monthlyTestStats = data.monthlyTestStats ? [data.monthlyTestStats] : [];
          data.mostPopularTests = data.mostPopularTests ? [data.mostPopularTests] : [];
          
          // Convert string numbers to actual numbers
          data.completionRate = Number(data.completionRate) || 0;
          data.averageCompletionTime = Number(data.averageCompletionTime) || 0;
          data.averageScore = Number(data.averageScore) || 0;
          
          // Log the processed data
          console.log('Processed dashboard data:', data);
          
          setDashboardData(data);
        } else {
          console.error('API returned error:', response.data.message);
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          console.error('Status code:', error.response.status);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false,
        labels: { font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        titleFont: { size: 12 },
        bodyFont: { size: 12 }
      },
      title: {
        display: false,
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    },
    layout: { padding: { top: 8, right: 8, bottom: 8, left: 8 } }
  };

  // Cleanup charts
  useEffect(() => {
    // Store current refs in variables inside the effect
    const barChart = barChartRef.current;
    const pieChart = pieChartRef.current;
    
    return () => {
      // Use the stored variables in cleanup
      if (barChart) {
        barChart.destroy();
      }
      if (pieChart) {
        pieChart.destroy();
      }
    };
  }, []);

  const MetricCard = ({ icon, title, value, trend }) => (
    <div className={styles['dashboard-metricCard']}>
      <div className={styles['dashboard-metricHeader']}>
        {icon}
        <h3>{title}</h3>
      </div>
      <div className={styles['dashboard-metricValue']}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {trend && (
          <span className={trend > 0 ? styles['dashboard-positiveTrend'] : styles['dashboard-negativeTrend']}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles['dashboard-adminDashboard']}>
      {/* Header Section */}  
      <header className={styles['dashboard-header']}>
        <h1 className={styles['dashboard-headerTitle']}>Course Admin Dashboard</h1>
        <div className={styles['dashboard-timeFilters']}>
          {['Day', 'Week', 'Month', 'Year'].map((filter) => (
            <button
              key={filter}
              className={`${styles['dashboard-timeFilter']} ${
                timeFilter === filter.toLowerCase() && styles['dashboard-active']
              }`}
              onClick={() => setTimeFilter(filter.toLowerCase())}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {/* Metrics Grid */}
      {loading ? (
        <div className={styles['dashboard-loading']}>Loading dashboard data...</div>
      ) : dashboardData ? (
        <section className={styles['dashboard-metricsGrid']}>
          <MetricCard
            icon={<FiUsers className={styles['dashboard-metricIcon']} />}
            title="Total Users"
            value={dashboardData.totalUsers}
            trend={Number(dashboardData.userGrowthRate).toFixed(1)}
          />
          <MetricCard
            icon={<FiBook className={styles['dashboard-metricIcon']} />}
            title="Active Users"
            value={dashboardData.activeUsers}
            trend={(dashboardData.activeUsers / dashboardData.totalUsers * 100).toFixed(1)}
          />
          <MetricCard
            icon={<FiActivity className={styles['dashboard-metricIcon']} />}
            title="Total Tests"
            value={dashboardData.totalTests}
            trend={(dashboardData.totalAttempts / dashboardData.totalTests).toFixed(1)}
          />
          <MetricCard
            icon={<FiClock className={styles['dashboard-metricIcon']} />}
            title="Average Score"
            value={`${dashboardData.averageScore}`}
            trend={((dashboardData.averageScore / 990) * 100).toFixed(1)}
          />
        </section>
      ) : (
        <div className={styles['dashboard-error']}>Failed to load dashboard data</div>
      )}

      {/* Main Content */}
      <main className={styles['dashboard-mainContent']}>
        {/* User Statistics Chart */}
        <article className={styles['dashboard-chartContainer']}>
          <h2>User Growth & Activity</h2>
          {dashboardData && Array.isArray(dashboardData.monthlyUserStats) && dashboardData.monthlyUserStats.length > 0 && (
            <Bar
              ref={barChartRef}
              data={{
                labels: ['Current Month'],
                datasets: [
                  {
                    label: 'New Users',
                    data: [Number(dashboardData.newUsersThisMonth)],
                    backgroundColor: '#3B82F6',
                    borderRadius: 6
                  },
                  {
                    label: 'Active Users',
                    data: [Number(dashboardData.activeUsers)],
                    backgroundColor: '#10B981',
                    borderRadius: 6
                  }
                ]
              }}
              options={{
                ...barOptions,
                plugins: {
                  ...barOptions.plugins,
                  legend: { 
                    display: true,
                    position: 'top'
                  }
                }
              }}
              key={timeFilter}
            />
          )}
        </article>

        {/* Test Performance Chart */}
        <article className={styles['dashboard-chartContainer']}>
          <h2>Test Performance Trends</h2>
          {dashboardData && Array.isArray(dashboardData.monthlyTestStats) && dashboardData.monthlyTestStats.length > 0 && (
            <Line
              data={{
                labels: ['Current Month'],
                datasets: [
                  {
                    label: 'Reading Score',
                    data: [Number(dashboardData.monthlyTestStats[0]?.avgReadingScore || 0)],
                    borderColor: '#3B82F6',
                    backgroundColor: '#3B82F6',
                    tension: 0.4
                  },
                  {
                    label: 'Listening Score',
                    data: [Number(dashboardData.monthlyTestStats[0]?.avgListeningScore || 0)],
                    borderColor: '#10B981',
                    backgroundColor: '#10B981',
                    tension: 0.4
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                  },
                  x: {
                    ticks: { font: { size: 11 } }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { font: { size: 12 } }
                  },
                  tooltip: {
                    titleFont: { size: 12 },
                    bodyFont: { size: 12 }
                  }
                },
                elements: { point: { radius: 3 } }
              }}
            />
          )}
        </article>

        {/* Sidebar Section */}
        <aside className={styles['dashboard-sidebar']}>
          <div className={styles['dashboard-sidebarSection']}>
            <h3>Test Score Distribution</h3>
            <div className={styles['dashboard-pieChart']}>
              {dashboardData && Array.isArray(dashboardData.mostPopularTests) && dashboardData.mostPopularTests.length > 0 && (
                <Pie
                  ref={pieChartRef}
                  data={{
                    labels: dashboardData.mostPopularTests.map(test => test.title || 'Untitled Test'),
                    datasets: [{
                      data: dashboardData.mostPopularTests.map(test => Number(test.averageScore) || 0),
                      backgroundColor: ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EC4899']
                    }]
                  }}
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        position: 'bottom',
                        display: true,
                        labels: { font: { size: 12 } }
                      },
                      tooltip: {
                        titleFont: { size: 12 },
                        bodyFont: { size: 12 },
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            return `${label}: ${value.toFixed(0)}/990`;
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Test Score Distribution',
                        font: { size: 14 }
                      }
                    }
                  }}
                  key={timeFilter}
                />
              )}
            </div>
          </div>
        </aside>
        <div className={styles['dashboard-tableContainer']}>
          <div className={styles['dashboard-tableHeader']}>
            <h2>Most Popular Tests</h2>
          </div>
          <table className={styles['dashboard-statsTable']}>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Attempts</th>
                <th>Average Score</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.mostPopularTests?.map((test) => (
                <tr key={test.testId}>
                  <td>
                    <div className={styles['dashboard-testInfo']}>
                      <span className={styles['dashboard-testTitle']}>{test.title || 'Unnamed Test'}</span>
                      <span className={styles['dashboard-categoryBadge']}>TOEIC</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles['dashboard-attemptsInfo']}>
                      <span className={styles['dashboard-attemptsNumber']}>{Number(test.attempts).toLocaleString()}</span>
                      <span className={styles['dashboard-attemptsTrend']}>
                        {((Number(test.attempts) / dashboardData.totalAttempts) * 100).toFixed(1)}% of total
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles['dashboard-scoreDetails']}>
                      <div className={styles['dashboard-totalScore']}>
                        <span>{Number(test.averageScore).toFixed(0)}</span>
                        <span className={styles['dashboard-scoreLabel']}>/990</span>
                      </div>
                      <div className={styles['dashboard-subScores']}>
                        <span>L: {Number(test.avgListeningScore).toFixed(0)}/495</span>
                        <span>R: {Number(test.avgReadingScore).toFixed(0)}/495</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles['dashboard-scoreWrapper']}>
                      <div className={styles['dashboard-scoreBarContainer']}>
                        <div className={styles['dashboard-scoreBar']} 
                          style={{ width: `${(Number(test.averageScore)/990)*100}%` }}>
                        </div>
                        <div className={styles['dashboard-scoreBarBackground']}></div>
                      </div>
                      <div className={styles['dashboard-scorePercentage']}>
                        {((Number(test.averageScore)/990)*100).toFixed(1)}%
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;