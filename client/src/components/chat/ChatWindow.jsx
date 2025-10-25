import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import chatService from "../../services/chatService";
import { auth } from "../../config/firebase";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

const ChatWindow = ({ chatId, chatDetails }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);

    // Subscribe to messages
    const unsubscribe = chatService.subscribeToMessages(
      chatId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setLoading(false);
        scrollToBottom();
      },
    );

    // Mark as read
    chatService.markAsRead(chatId, currentUserId);

    return () => unsubscribe();
  }, [chatId, currentUserId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (text) => {
    try {
      await chatService.sendMessage(chatId, currentUserId, text);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const getOtherUserName = () => {
    if (!chatDetails) return "Chat";
    const otherUserId = chatDetails.participants.find(
      (id) => id !== currentUserId,
    );
    return chatDetails.participantDetails[otherUserId]?.name || "User";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <svg viewBox="0 0 24 24" fill="currentColor" style={styles.backIcon}>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div style={styles.headerInfo}>
          <h2 style={styles.headerTitle}>{getOtherUserName()}</h2>
          <p style={styles.headerSubtitle}>{chatDetails?.donationTitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No messages yet</p>
            <p style={styles.emptySubtext}>Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #F3F4F6",
    borderTop: "4px solid #C1693C",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #F3F4F6",
  },
  backButton: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  backIcon: {
    width: "24px",
    height: "24px",
    color: "#111827",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "#6B7280",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 0 80px 0", // Extra padding for input
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "4px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#6B7280",
  },
};

// Add keyframe animation for spinner
if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0];
  const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;

  try {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  } catch (e) {
    // Ignore
  }
}

export default ChatWindow;
