import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import chatService from "../../services/chatService";
import { auth } from "../../config/firebase";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const unsubscribe = chatService.subscribeToUserChats(
      currentUserId,
      (updatedChats) => {
        setChats(updatedChats);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const getOtherUserName = (chat) => {
    const otherUserId = chat.participants.find((id) => id !== currentUserId);
    return chat.participantDetails[otherUserId]?.name || "User";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
      <div style={styles.header}>
        <h1 style={styles.title}>Messages</h1>
      </div>

      {chats.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <p style={styles.emptyText}>No messages yet</p>
          <p style={styles.emptySubtext}>
            Start a conversation by requesting food donations
          </p>
        </div>
      ) : (
        <div style={styles.chatList}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              style={styles.chatItem}
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <div style={styles.avatar}>
                {getOtherUserName(chat).charAt(0).toUpperCase()}
              </div>

              <div style={styles.chatInfo}>
                <div style={styles.chatHeader}>
                  <h3 style={styles.chatName}>{getOtherUserName(chat)}</h3>
                  <span style={styles.timestamp}>
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>

                <div style={styles.chatFooter}>
                  <p style={styles.lastMessage}>
                    {chat.lastMessage || "No messages yet"}
                  </p>
                  {chat.unreadCount[currentUserId] > 0 && (
                    <span style={styles.unreadBadge}>
                      {chat.unreadCount[currentUserId]}
                    </span>
                  )}
                </div>

                <p style={styles.donationTitle}>📦 {chat.donationTitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    paddingBottom: "80px",
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
    padding: "20px 16px",
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #F3F4F6",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#6B7280",
    lineHeight: "1.5",
  },
  chatList: {
    padding: "8px 0",
  },
  chatItem: {
    display: "flex",
    gap: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #F3F4F6",
    transition: "background-color 0.15s ease",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#C1693C",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "600",
    flexShrink: 0,
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  chatName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
  },
  timestamp: {
    fontSize: "12px",
    color: "#6B7280",
  },
  chatFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  lastMessage: {
    margin: 0,
    fontSize: "14px",
    color: "#6B7280",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  donationTitle: {
    margin: 0,
    fontSize: "12px",
    color: "#9CA3AF",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  unreadBadge: {
    display: "inline-block",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    backgroundColor: "#C1693C",
    color: "#FFFFFF",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: "20px",
    marginLeft: "8px",
  },
};

export default ChatList;
