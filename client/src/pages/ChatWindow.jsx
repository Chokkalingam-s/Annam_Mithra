import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../config/firebase';
import api from '../services/api';
import { COLORS, FONT_SIZES } from '../config/theme';
import io from 'socket.io-client';

const ChatWindow = () => {
  const navigate = useNavigate();
  const { donationId, receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [donation, setDonation] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const messageIds = useRef(new Set()); // Track already rendered message IDs

  useEffect(() => {
    initializeChat();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const firebaseUid = auth.currentUser?.uid;

      // Get current user info
      const userResponse = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUserId(userResponse.data.data.id);

      // Get donation details
      const donationResponse = await api.get(`/donations/${donationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonation(donationResponse.data.data);

      // Get other user info
      const otherUserResponse = await api.get(`/users/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOtherUser(otherUserResponse.data.data);

      // Fetch existing messages, add their IDs to the set
      const messagesResponse = await api.get(`/chat/${donationId}/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const msgs = messagesResponse.data.data || [];
      msgs.forEach(m => messageIds.current.add(m.id));
      setMessages(msgs);

      // Initialize socket with forced websocket transport
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5000';

      socketRef.current = io(socketUrl, {
        transports: ['websocket'],
        query: { firebaseUid, donationId, receiverId }
      });

      socketRef.current.emit('join_chat', { donationId, receiverId });

socketRef.current.off('receive_message');
socketRef.current.on('receive_message', message => {
  if (!messageIds.current.has(message.id)) {
    messageIds.current.add(message.id);
    setMessages(prev => [...prev, message]);
    scrollToBottom();
  }
});


      setLoading(false);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = await auth.currentUser?.getIdToken();

      const messageData = {
        donationId: parseInt(donationId),
        receiverId: parseInt(receiverId),
        message: newMessage,
        firebaseUid: auth.currentUser?.uid
      };

      const response = await api.post('/chat/send', messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && socketRef.current) {
        socketRef.current.emit('send_message', {
          ...response.data.data,
          donationId,
          receiverId
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={styles.headerInfo}>
          <div style={styles.avatar}>
            {otherUser?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div style={styles.headerText}>
            <div style={styles.headerName}>{otherUser?.name}</div>
            <div style={styles.headerSubtext}>
              {donation?.foodName} • {donation?.foodType === 'veg' ? '🥗 Veg' : '🍗 Non-Veg'}
            </div>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={() => navigate('/requests')}>
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyChat}>
            <div style={styles.emptyIcon}>💬</div>
            <p style={styles.emptyText}>No messages yet</p>
            <p style={styles.emptySubtext}>Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id || index}
                style={{
                  ...styles.messageRow,
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
                }}
              >
                {!isCurrentUser && (
                  <div style={styles.messageAvatar}>
                    {otherUser?.name?.substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(isCurrentUser ? styles.messageBubbleOwn : styles.messageBubbleOther)
                  }}
                >
                  <div style={styles.messageText}>{msg.message}</div>
                  <div style={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {isCurrentUser && (
                  <div style={{ ...styles.messageAvatar, background: COLORS.primary }}>
                    You
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <textarea
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: newMessage.trim() ? 1 : 0.5
          }}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Send →
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#F9F9F9',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: `4px solid ${COLORS.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  backBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    cursor: 'pointer',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    marginLeft: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    background: COLORS.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    background: '#F3F4F6',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '4px',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    marginBottom: '4px',
  },
  messageAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    background: '#E5E7EB',
    color: COLORS.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '16px',
    wordWrap: 'break-word',
  },
  messageBubbleOwn: {
    background: COLORS.primary,
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  messageBubbleOther: {
    background: 'white',
    color: COLORS.text,
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: '1.5',
    marginBottom: '4px',
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    opacity: 0.7,
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'white',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: FONT_SIZES.sm,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '24px',
    resize: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    maxHeight: '100px',
  },
  sendBtn: {
    padding: '12px 24px',
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default ChatWindow;
