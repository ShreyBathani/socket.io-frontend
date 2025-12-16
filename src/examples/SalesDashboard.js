import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import '../SalesDashboard.css';

const SalesDashboard = ({ socket }) => {
  const [connected, setConnected] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [resetClicks, setResetClicks] = useState(0);
  const [showResetButton, setShowResetButton] = useState(false);

  // Add this inside component, before return statement
  const handleTitleClick = () => {
    setResetClicks(prev => prev + 1);
    if (resetClicks + 1 >= 5) {
      setShowResetButton(true);
      setTimeout(() => {setShowResetButton(false); setResetClicks(prev => 0);}, 4000); // Hide after 5 seconds
    }
  };

  useEffect(() => {
    if (!socket) return;

    setConnected(socket.connected);

    const onConnect = () => {
      console.log('✅ Sales Dashboard: Connected');
      setConnected(true);
      socket.emit('getDashboardData');
    };

    const onDisconnect = () => {
      console.log('❌ Sales Dashboard: Disconnected');
      setConnected(false);
    };

    const onDashboardData = (data) => {
      console.log('📊 Dashboard data received:', data);
      setDashboardData(data);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('dashboardData', onDashboardData);

    if (socket.connected) {
      // Request initial data
      socket.emit('getDashboardData');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('dashboardData', onDashboardData);
    };
  }, [socket]);

  const handleReset = () => {
    if (socket && connected) {
      socket.emit('resetDashboard');
    }
  };

  if (!dashboardData) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>📊 Sales Dashboard</h2>
        <p style={styles.loading}>Loading dashboard data...</p>
      </div>
    );
  }

  const { kpis, charts } = dashboardData;

  // Prepare chart data
  const categoryChartData = Object.entries(charts.categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const regionChartData = Object.entries(charts.regionData).map(([name, value]) => ({
    name,
    revenue: value
  }));

  const trendChartData = Object.entries(charts.trendData)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue
    }));

  const topProducts = Object.entries(charts.productData)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      revenue: data.revenue,
      quantity: data.quantity
    }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div style={styles.container}>
        <div style={styles.header}>
            <h2 style={{...styles.title, cursor: 'pointer'}} onClick={handleTitleClick} /*title="Click 5 times for secret option 🤫"*/>
                📊 Real-Time Sales Dashboard
            </h2>
            <div style={styles.headerButtons}>
                <Link to="/sales-form" style={styles.addButton}>➕ Add New Sale</Link>
                {showResetButton && (
                    <button onClick={handleReset} style={styles.resetButton}>
                        🔄 Reset Data
                    </button>
                )}
            </div>
        </div>

      <p style={styles.status}>
        Status: {connected ? '🟢 Live Updates Active' : '🔴 Disconnected'}
      </p>

      {/* KPI Cards */}
      <div className="kpiGrid">
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>💰</div>
          <div>
            <p style={styles.kpiLabel}>Total Revenue</p>
            <h3 style={styles.kpiValue}>${kpis.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📦</div>
          <div>
            <p style={styles.kpiLabel}>Total Orders</p>
            <h3 style={styles.kpiValue}>{kpis.totalOrders}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📈</div>
          <div>
            <p style={styles.kpiLabel}>Items Sold</p>
            <h3 style={styles.kpiValue}>{kpis.totalQuantity}</h3>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>💳</div>
          <div>
            <p style={styles.kpiLabel}>Avg Order Value</p>
            <h3 style={styles.kpiValue}>${kpis.avgOrderValue}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="chartsGrid">
        {/* Sales Trend */}
        <div className="chartCard">
          <h3 style={styles.chartTitle}>📈 Sales Trend</h3>
          <div style={styles.chartInner}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: '#282c34', border: '1px solid #61dafb' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#61dafb" strokeWidth={3} dot={{ fill: '#61dafb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chartCard">
          <h3 style={styles.chartTitle}>🎯 Sales by Category</h3>
          <div style={styles.chartInner}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value}`}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Sales */}
        <div className="chartCard">
          <h3 style={styles.chartTitle}>🌍 Sales by Region</h3>
          <div style={styles.chartInner}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: '#282c34', border: '1px solid #61dafb' }} />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="chartCard">
          <h3 style={styles.chartTitle}>🏆 Top Products</h3>
          <div style={styles.chartInner}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis type="number" stroke="#ccc" />
                <YAxis type="category" dataKey="name" stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: '#282c34', border: '1px solid #61dafb' }} />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 'clamp(1rem, 2vw, 2rem)',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
  },
    header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  title: {
    color: '#61dafb',
    margin: 0,
    fontSize: 'clamp(1.25rem, 2vw, 1.7rem)',
  },
  headerButtons: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  resetButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  status: {
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    color: '#ccc',
  },
  loading: {
    color: '#888',
    fontSize: '1.1rem',
    textAlign: 'center',
    marginTop: '3rem',
  },
  // kpiGrid: {
  //   display: 'grid',
  //   gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  //   gap: '1rem',
  //   marginBottom: '1.5rem',
  // },
  kpiCard: {
    backgroundColor: '#282c34',
    padding: '1.1rem',
    borderRadius: '12px',
    border: '2px solid #61dafb',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minWidth: 0,
  },
  kpiIcon: {
    fontSize: '2rem',
  },
  kpiLabel: {
    color: '#888',
    fontSize: '0.8rem',
    marginBottom: '0.3rem',
  },
  kpiValue: {
    color: '#61dafb',
    fontSize: '1.4rem',
    margin: 0,
  },
  chartTitle: {
    color: '#61dafb',
    marginBottom: '0.75rem',
    fontSize: '1rem',
  },
  chartInner: {
    width: '100%',
    height: '220px',
  },
};

export default SalesDashboard;
