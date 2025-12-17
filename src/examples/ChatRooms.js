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
      socket.emit('joinRoom', room, username.trim());
    }
  };

  const handleLeaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leaveRoom', currentRoom, username.trim());
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
    padding: '1rem',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    minHeight: '80vh',
  },
  title: {
    color: '#61dafb',
    marginBottom: '0.25rem',
    textAlign: 'center',
    fontSize: '1.6rem',
  },
  status: {
    fontSize: '0.95rem',
    marginBottom: '0.75rem',
    color: '#ccc',
    textAlign: 'center',
  },
  notificationsContainer: {
    position: 'fixed',
    top: '70px',
    right: '10px',
    left: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  notification: {
    backgroundColor: '#61dafb',
    color: '#282c34',
    padding: '0.6rem 1rem',
    borderRadius: '5px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  joinSection: {
    backgroundColor: '#282c34',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '2px solid #61dafb',
  },
  usernameBox: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    color: '#61dafb',
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '0.65rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '2px solid #61dafb',
    backgroundColor: '#1a1a1a',
    color: 'white',
    boxSizing: 'border-box',
  },
  roomsBox: {
    textAlign: 'center',
  },
  subtitle: {
    color: '#61dafb',
    marginBottom: '1.1rem',
    fontSize: '1.1rem',
  },
  loadingText: {
    color: '#888',
    fontSize: '0.95rem',
    fontStyle: 'italic',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem',
  },
  roomButton: {
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    padding: '1rem',
    fontSize: '1rem',
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
    maxHeight: '80vh',
  },
  chatHeader: {
    backgroundColor: '#1a1a1a',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #61dafb',
    gap: '0.5rem',
  },
  roomTitle: {
    color: '#61dafb',
    margin: 0,
    fontSize: '1.1rem',
  },
  leaveButton: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    padding: '0.4rem 0.9rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.9rem',
    backgroundColor: '#1a1a1a',
  },
  noMessages: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    fontSize: '0.95rem',
  },
  messageBox: {
    marginBottom: '0.75rem',
    padding: '0.6rem',
    borderRadius: '8px',
    maxWidth: '80%',
    fontSize: '0.95rem',
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
    fontSize: '0.8rem',
    gap: '0.5rem',
  },
  messageUsername: {
    fontWeight: 'bold',
  },
  messageTime: {
    opacity: 0.7,
    fontSize: '0.75rem',
  },
  messageText: {
    fontSize: '0.95rem',
    wordBreak: 'break-word',
  },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#1a1a1a',
    borderTop: '2px solid #61dafb',
    boxSizing: 'border-box',
    width: '100%',
  },
  messageInput: {
    flex: 1,
    minWidth: 0,              // allow flexbox to shrink input
    padding: '0.6rem',
    fontSize: '0.95rem',
    borderRadius: '5px',
    border: '2px solid #61dafb',
    backgroundColor: '#282c34',
    color: 'white',
    boxSizing: 'border-box',
  },
  sendButton: {
    flexShrink: 0,            // don't shrink button text
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    padding: '0.6rem 1.1rem',
    fontSize: '0.9rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',     // keep “Send 📤” on one line
  },
  sendButtonDisabled: {
    backgroundColor: '#555',
    cursor: 'not-allowed',
    color: '#888',
  },
  // @media (max-width: 600px) {
  //   body {
  //     margin: 0;
  //   }
  // }
};


export default ChatRooms;
