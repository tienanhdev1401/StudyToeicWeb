import React, { useState, useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import styles from '../../styles/Dashboard.module.css';
import { FiUsers, FiBook, FiActivity } from 'react-icons/fi';

// Đăng ký components Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Dữ liệu mẫu
const DASHBOARD_DATA = {
  users: {
    total: 4567,
    newThisMonth: 234,
    active: 3789,
    chartLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    chartData: [300, 450, 600, 550, 800, 900]
  },
  content: {
    courses: 45,
    lessons: 678,
    exams: 2356,
    completionRate: 78
  }
};
const testData = [
  {
    testName: "Ngữ pháp nâng cao",
    category: "Grammar",
    attempts: 245,
    averageScore: 8.2,
    maxScore: 10 // Thêm trường maxScore
  },
  {
    testName: "TOEIC Full Test 2024",
    category: "TOEIC", 
    attempts: 198,
    averageScore: 785,
    maxScore: 990
  },
  {
    testName: "TOEIC Listening Practice",
    category: "TOEIC",
    attempts: 176,
    averageScore: 420,
    maxScore: 495
  },
  {
    testName: "TOEIC Reading Practice",
    category: "TOEIC",
    attempts: 152,
    averageScore: 365,
    maxScore: 495
  },
];



const AdminDashboard = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC'
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } }
    }
  };

  // Cleanup charts
  useEffect(() => {
    return () => {
      barChartRef.current?.destroy();
      pieChartRef.current?.destroy();
    };
  }, []);

  const MetricCard = ({ icon, title, value, trend }) => (
    <div className={styles.metricCard}>
      <div className={styles.metricHeader}>
        {icon}
        <h3>{title}</h3>
      </div>
      <div className={styles.metricValue}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {trend && (
          <span className={trend > 0 ? styles.positiveTrend : styles.negativeTrend}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.adminDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1 className={styles.dasboardHeaderTitle}>ZEnglish Admin Dashboard</h1>
        <div className={styles.timeFilters}>
          {['Day', 'Week', 'Month', 'Year'].map((filter) => (
            <button
              key={filter}
              className={`${styles.timeFilter} ${
                timeFilter === filter.toLowerCase() && styles.active
              }`}
              onClick={() => setTimeFilter(filter.toLowerCase())}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {/* Metrics Grid */}
      <section className={styles.metricsGrid}>
        <MetricCard
          icon={<FiUsers className={styles.metricIcon} />}
          title="Total Users"
          value={DASHBOARD_DATA.users.total}
          trend={12.5}
        />
        <MetricCard
          icon={<FiBook className={styles.metricIcon} />}
          title="Total Tests"
          value={DASHBOARD_DATA.content.courses}
        />
        <MetricCard
          icon={<FiActivity className={styles.metricIcon} />}
          title="Completed Tests"
          value={`${DASHBOARD_DATA.content.completionRate}%`}
          trend={2.8}
        />
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* User Statistics Chart */}
        <article className={styles.chartContainer}>
          <h2>User Statistics</h2>
          <Bar
            ref={barChartRef}
            data={{
              labels: DASHBOARD_DATA.users.chartLabels,
              datasets: [{
                label: 'New Users',
                data: DASHBOARD_DATA.users.chartData,
                backgroundColor: '#3B82F6',
                borderRadius: 6
              }]
            }}
            options={barOptions}
            key={timeFilter}
          />
        </article>

        {/* Sidebar Section */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3>Learning Distribution</h3>
            <div className={styles.pieChart}>
              <Pie
                ref={pieChartRef}
                data={{
                  labels: ['Completed', 'In Progress', 'Not Started'],
                  datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#3B82F6', '#10B981', '#6366F1']
                  }]
                }}
                options={{ 
                  responsive: true,
                  plugins: { legend: { position: 'bottom' } }
                }}
                key={timeFilter}
              />
            </div>
          </div>
        </aside>
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Most Completed Tests</h2>
            <button className={styles.viewDetailBtn}>
              <i className="fas fa-eye"></i>
              See All
            </button>
          </div>
          <table className={styles.statsTable}>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Category</th>
                <th>Number of Attempts</th>
                <th>Average Score</th>
              </tr>
            </thead>
            <tbody>
              {testData.map((test, index) => (
                <tr key={index}>
                  <td>{test.testName}</td>
                  <td>
                    <span className={styles.categoryBadge}>
                      {test.category}
                    </span>
                  </td>
                  <td>{test.attempts.toLocaleString()}</td>
                  <td>
                    <div className={styles.scoreWrapper}>
                      {test.category === 'TOEIC' ? (
                        <>
                          {test.averageScore}/{test.maxScore}
                          <div className={styles.scoreBar} 
                            style={{ width: `${(test.averageScore/test.maxScore)*100}%` }}>
                          </div>
                        </>
                      ) : (
                        <>
                          {test.averageScore}/10
                          <div className={styles.scoreBar} 
                            style={{ width: `${test.averageScore * 10}%` }}>
                          </div>
                        </>
                      )}
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