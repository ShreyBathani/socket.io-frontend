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
    // Connect to backend
    const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    const newSocket = io(backendURL);
    setSocket(newSocket);

    console.log('✅ Connecting to backend...');

    newSocket.on('connect', () => {
      console.log('✅ Connected to server with ID:', newSocket.id);
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
