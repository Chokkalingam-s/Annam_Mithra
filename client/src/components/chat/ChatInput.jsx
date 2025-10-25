import React, { useState } from "react";

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        style={styles.input}
      />
      <button
        onClick={handleSend}
        style={{
          ...styles.sendButton,
          ...(message.trim() ? {} : styles.sendButtonDisabled),
        }}
        disabled={!message.trim()}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" style={styles.sendIcon}>
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #F3F4F6",
    padding: "12px 16px 12px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    zIndex: 100,
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#F3F4F6",
    border: "none",
    borderRadius: "24px",
    fontSize: "15px",
    outline: "none",
    color: "#111827",
  },
  sendButton: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "#C1693C",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#FFFFFF",
    transition: "background-color 0.2s ease",
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
    cursor: "not-allowed",
  },
  sendIcon: {
    width: "20px",
    height: "20px",
  },
};

export default ChatInput;
