import React, { useState, useEffect } from 'react';

const ClickCounter = ({ socket }) => {
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Check if already connected
    setConnected(socket.connected);

    // Listen for connection status changes
    const onConnect = () => {
      console.log('✅ Click Counter: Connected');
      setConnected(true);
    };

    const onDisconnect = () => {
      console.log('❌ Click Counter: Disconnected');
      setConnected(false);
    };

    // Listen for count updates from server
    const onUpdate = (newCount) => {
      console.log('📊 Count updated:', newCount);
      setCount(newCount);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('update', onUpdate);

    // Request current count when component mounts
    if (socket.connected) {
      socket.emit('getCount');
    }

    // Cleanup listeners when component unmounts
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('update', onUpdate);
    };
  }, [socket]);

  const handleClick = () => {
    if (socket && connected) {
      socket.emit('click');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔢 Shared Click Counter</h2>
      <p style={styles.status}>
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </p>
      
      <div style={styles.counterBox}>
        <h1 style={styles.count}>Count: {count}</h1>
      </div>

      <button 
        onClick={handleClick} 
        disabled={!connected}
        style={{
          ...styles.button,
          ...(connected ? {} : styles.buttonDisabled)
        }}
      >
        👆 Click Me!
      </button>

      <p style={styles.info}>
        💡 Open multiple browser tabs - all counters sync in real-time!
      </p>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    color: '#61dafb',
    marginBottom: '1rem',
  },
  status: {
    fontSize: '1rem',
    marginBottom: '2rem',
    color: '#ccc',
  },
  counterBox: {
    backgroundColor: '#282c34',
    padding: '3rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    border: '3px solid #61dafb',
  },
  count: {
    fontSize: '3rem',
    color: '#61dafb',
    margin: 0,
  },
  button: {
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    padding: '1rem 3rem',
    fontSize: '1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  info: {
    marginTop: '2rem',
    fontSize: '0.9rem',
    color: '#888',
    fontStyle: 'italic',
  },
};

export default ClickCounter;
