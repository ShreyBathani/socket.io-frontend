import React, { useState, useEffect, useRef } from 'react';

const ChatRooms = ({ socket }) => {
  const [connected, setConnected] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Check connection status
    setConnected(socket.connected);

    const onConnect = () => {
      console.log('✅ Chat Rooms: Connected');
      setConnected(true);
      // Request rooms list when connected
      socket.emit('getRoomsList');
    };

    const onDisconnect = () => {
      console.log('❌ Chat Rooms: Disconnected');
      setConnected(false);
    };

    // Receive available rooms
    const onRoomsList = (rooms) => {
      console.log('📋 Available rooms:', rooms);
      setAvailableRooms(rooms);
    };

    // Room joined successfully
    const onRoomJoined = (room) => {
      console.log('✅ Joined room:', room);
      setCurrentRoom(room);
      setMessages([]);
      addNotification(`You joined ${room}`);
    };

    // Room left successfully
    const onRoomLeft = (room) => {
      console.log('❌ Left room:', room);
      setCurrentRoom(null);
      setMessages([]);
    };

    // Someone joined the room
    const onUserJoined = (data) => {
      addNotification(data.message);
    };

    // Someone left the room
    const onUserLeft = (data) => {
      addNotification(data.message);
    };

    // New message received
    const onNewMessage = (messageData) => {
      console.log('📨 New message:', messageData);
      setMessages(prev => [...prev, messageData]);
    };

    // Set up event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('roomsList', onRoomsList);
    socket.on('roomJoined', onRoomJoined);
    socket.on('roomLeft', onRoomLeft);
    socket.on('userJoined', onUserJoined);
    socket.on('userLeft', onUserLeft);
    socket.on('newMessage', onNewMessage);

    // Request rooms list if already connected
    if (socket.connected) {
      socket.emit('getRoomsList');
    }

    // Cleanup
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomsList', onRoomsList);
      socket.off('roomJoined', onRoomJoined);
      socket.off('roomLeft', onRoomLeft);
      socket.off('userJoined', onUserJoined);
      socket.off('userLeft', onUserLeft);
      socket.off('newMessage', onNewMessage);
    };
  }, [socket]);

  const addNotification = (text) => {
    const notif = { id: Date.now(), text };
    setNotifications(prev => [...prev, notif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 3000);
  };

  const handleJoinRoom = (room) => {
    if (socket && connected && username.trim()) {
      socket.emit('joinRoom', room);
    }
  };

  const handleLeaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leaveRoom', currentRoom);
    }
  };

  const handleSendMessage = () => {
    if (socket && message.trim() && currentRoom && username.trim()) {
      socket.emit('sendMessage', {
        room: currentRoom,
        message: message,
        username: username
      });
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💬 Chat Rooms</h2>
      <p style={styles.status}>
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </p>

      {/* Notifications */}
      <div style={styles.notificationsContainer}>
        {notifications.map(notif => (
          <div key={notif.id} style={styles.notification}>
            {notif.text}
          </div>
        ))}
      </div>

      {/* Username Input & Room Selection */}
      {!currentRoom ? (
        <div style={styles.joinSection}>
          <div style={styles.usernameBox}>
            <label style={styles.label}>Enter Your Name:</label>
            <input
              type="text"
              placeholder="Your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              disabled={!connected}
            />
          </div>

          <div style={styles.roomsBox}>
            <h3 style={styles.subtitle}>Select a Room to Join:</h3>
            {availableRooms.length === 0 ? (
              <p style={styles.loadingText}>Loading rooms...</p>
            ) : (
              <div style={styles.roomsGrid}>
                {availableRooms.map((room) => (
                  <button
                    key={room}
                    onClick={() => handleJoinRoom(room)}
                    disabled={!connected || !username.trim()}
                    style={{
                      ...styles.roomButton,
                      ...((!connected || !username.trim()) ? styles.roomButtonDisabled : {})
                    }}
                  >
                    {room === 'News' ? '📰' : '🎬'} {room}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Chat Interface
        <div style={styles.chatSection}>
          <div style={styles.chatHeader}>
            <h3 style={styles.roomTitle}>
              {currentRoom === 'News' ? '📰' : '🎬'} {currentRoom} Room
            </h3>
            <button onClick={handleLeaveRoom} style={styles.leaveButton}>
              ← Leave Room
            </button>
          </div>

          {/* Messages Area */}
          <div style={styles.messagesArea}>
            {messages.length === 0 ? (
              <p style={styles.noMessages}>No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageBox,
                    ...(msg.username === username ? styles.myMessage : styles.otherMessage)
                  }}
                >
                  <div style={styles.messageHeader}>
                    <span style={styles.messageUsername}>
                      {msg.username === username ? 'You' : msg.username}
                    </span>
                    <span style={styles.messageTime}>{msg.timestamp}</span>
                  </div>
                  <div style={styles.messageText}>{msg.message}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={styles.inputArea}>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.messageInput}
              disabled={!connected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !connected}
              style={{
                ...styles.sendButton,
                ...((!message.trim() || !connected) ? styles.sendButtonDisabled : {})
              }}
            >
              Send 📤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    minHeight: '80vh',
  },
  title: {
    color: '#61dafb',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  status: {
    fontSize: '1rem',
    marginBottom: '1rem',
    color: '#ccc',
    textAlign: 'center',
  },
  notificationsContainer: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#61dafb',
    color: '#282c34',
    padding: '0.75rem 1.5rem',
    marginBottom: '0.5rem',
    borderRadius: '5px',
    fontWeight: 'bold',
    animation: 'slideIn 0.3s',
  },
  joinSection: {
    backgroundColor: '#282c34',
    padding: '2rem',
    borderRadius: '12px',
    border: '2px solid #61dafb',
  },
  usernameBox: {
    marginBottom: '2rem',
  },
  label: {
    display: 'block',
    color: '#61dafb',
    marginBottom: '0.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '2px solid #61dafb',
    backgroundColor: '#1a1a1a',
    color: 'white',
  },
  roomsBox: {
    textAlign: 'center',
  },
  subtitle: {
    color: '#61dafb',
    marginBottom: '1.5rem',
  },
  loadingText: {
    color: '#888',
    fontSize: '1rem',
    fontStyle: 'italic',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  roomButton: {
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    padding: '1.5rem',
    fontSize: '1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  roomButtonDisabled: {
    backgroundColor: '#555',
    cursor: 'not-allowed',
    color: '#888',
  },
  chatSection: {
    backgroundColor: '#282c34',
    borderRadius: '12px',
    border: '2px solid #61dafb',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '70vh',
  },
  chatHeader: {
    backgroundColor: '#1a1a1a',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #61dafb',
  },
  roomTitle: {
    color: '#61dafb',
    margin: 0,
  },
  leaveButton: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    backgroundColor: '#1a1a1a',
  },
  noMessages: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
  messageBox: {
    marginBottom: '1rem',
    padding: '0.75rem',
    borderRadius: '8px',
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: '#61dafb',
    color: '#282c34',
    marginLeft: 'auto',
  },
  otherMessage: {
    backgroundColor: '#444',
    color: 'white',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
    fontSize: '0.85rem',
  },
  messageUsername: {
    fontWeight: 'bold',
  },
  messageTime: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: '1rem',
  },
  inputArea: {
    display: 'flex',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    borderTop: '2px solid #61dafb',
    gap: '0.5rem',
  },
  messageInput: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '2px solid #61dafb',
    backgroundColor: '#282c34',
    color: 'white',
  },
  sendButton: {
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  sendButtonDisabled: {
    backgroundColor: '#555',
    cursor: 'not-allowed',
    color: '#888',
  },
};

export default ChatRooms;
