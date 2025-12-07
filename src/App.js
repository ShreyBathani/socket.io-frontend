import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import './App.css';

// Import components
import Layout from './components/Layout';
import Home from './pages/Home';
import ClickCounter from './examples/ClickCounter';
import ChatRooms from './examples/ChatRooms';

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Get backend URL from environment variable
    const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    
    console.log('🔌 Connecting to backend:', backendURL);
    console.log('🌍 Environment:', process.env.NODE_ENV);

    const newSocket = io(backendURL, {
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      withCredentials: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server with ID:', newSocket.id);
      console.log('🔗 Backend URL:', backendURL);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection Error:', error.message);
      console.log('🔍 Check if backend is running at:', backendURL);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />
          
          {/* Example 1: Click Counter */}
          <Route path="/click-counter" element={<ClickCounter socket={socket} />} />
          
          {/* Example 2: Chat Rooms */}
          <Route path="/chat-rooms" element={<ChatRooms socket={socket} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
