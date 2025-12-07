import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 Real-Time Socket.IO Examples</h1>
      <p style={styles.subtitle}>
        Node.js + Socket.IO Real-Time Communication Demo
      </p>

      <div style={styles.examplesGrid}>
        <Link to="/click-counter" style={styles.card}>
          <div style={styles.cardIcon}>🔢</div>
          <h2 style={styles.cardTitle}>Click Counter</h2>
          <p style={styles.cardDesc}>
            Shared counter that updates across all connected users in real-time
          </p>
          <span style={styles.badge}>Example 1</span>
        </Link>

        <Link to="/chat-rooms" style={styles.card}>
          <div style={styles.cardIcon}>💬</div>
          <h2 style={styles.cardTitle}>Chat Rooms</h2>
          <p style={styles.cardDesc}>
            Join News 📰 or Entertainment 🎬 room - chat with people in real-time
          </p>
          <span style={styles.badge}>Example 2</span>
        </Link>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          📚 Based on Node.js + Socket.IO Presentation by Shrey Bathani
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '3rem 2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center',
    minHeight: '100vh',
  },
  title: {
    fontSize: '3rem',
    color: '#61dafb',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#ccc',
    marginBottom: '4rem',
  },
  examplesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '4rem',
  },
  card: {
    backgroundColor: '#282c34',
    padding: '2rem',
    borderRadius: '12px',
    border: '2px solid #61dafb',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
  },
  cardIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    color: '#61dafb',
    marginBottom: '1rem',
  },
  cardDesc: {
    fontSize: '1rem',
    color: '#ccc',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#61dafb',
    color: '#282c34',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: '4rem',
    paddingTop: '2rem',
    borderTop: '1px solid #444',
  },
  footerText: {
    color: '#888',
    fontSize: '0.9rem',
  },
};

export default Home;
