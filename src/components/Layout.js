import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={styles.layout}>
      {!isHome && (
        <nav style={styles.nav}>
          <Link to="/" style={styles.homeLink}>
            ← Back to Home
          </Link>
          <div style={styles.navLinks}>
            <Link 
              to="/click-counter" 
              style={{
                ...styles.navLink,
                ...(location.pathname === '/click-counter' ? styles.activeLink : {})
              }}
            >
              🔢 Click Counter
            </Link>
            <Link 
              to="/chat-rooms" 
              style={{
                ...styles.navLink,
                ...(location.pathname === '/chat-rooms' ? styles.activeLink : {})
              }}
            >
              💬 Chat Rooms
            </Link>
          </div>
        </nav>
      )}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
  },
  nav: {
    backgroundColor: '#282c34',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #61dafb',
  },
  homeLink: {
    color: '#61dafb',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'color 0.3s',
  },
  navLinks: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    transition: 'all 0.3s',
  },
  activeLink: {
    color: '#61dafb',
    backgroundColor: 'rgba(97, 218, 251, 0.1)',
  },
  main: {
    minHeight: 'calc(100vh - 60px)',
  },
};

export default Layout;
