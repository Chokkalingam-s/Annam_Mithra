import React from "react";

const MessageBubble = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        ...styles.messageContainer,
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          ...styles.bubble,
          ...(isOwnMessage ? styles.ownBubble : styles.otherBubble),
        }}
      >
        <p style={styles.messageText}>{message.text}</p>
        <span style={styles.timestamp}>{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};

const styles = {
  messageContainer: {
    display: "flex",
    marginBottom: "12px",
    padding: "0 16px",
  },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: "16px",
    wordWrap: "break-word",
  },
  ownBubble: {
    backgroundColor: "#C1693C",
    color: "#FFFFFF",
    borderBottomRightRadius: "4px",
  },
  otherBubble: {
    backgroundColor: "#F3F4F6",
    color: "#111827",
    borderBottomLeftRadius: "4px",
  },
  messageText: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "1.4",
  },
  timestamp: {
    display: "block",
    marginTop: "4px",
    fontSize: "11px",
    opacity: 0.7,
  },
};

export default MessageBubble;
