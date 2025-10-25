import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import api from '../services/api';
import { COLORS, FONT_SIZES } from '../config/theme';
import Header from '../components/receiver/Header';
import BottomNav from '../components/receiver/BottomNav';

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      // Fetch requests based on active tab
      const endpoint = activeTab === 'received' 
        ? '/donations/interests/received'  // Requests I received as donor
        : '/donations/interests/sent';     // Requests I sent as receiver

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (interestId, donationId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.post(
        '/donations/interests/accept',
        { interestId, donationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Request accepted!');
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDecline = async (interestId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.post(
        '/donations/interests/decline',
        { interestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Request declined');
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChat = (donationId, receiverId) => {
    navigate(`/chat/${donationId}/${receiverId}`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Requests</h1>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'received' && styles.tabActive)
              }}
              onClick={() => setActiveTab('received')}
            >
              Received ({requests.length})
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'sent' && styles.tabActive)
              }}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {requests.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyText}>No requests yet</p>
              <p style={styles.emptySubtext}>
                {activeTab === 'received'
                  ? 'Requests from receivers will appear here'
                  : 'Your donation requests will appear here'}
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} style={styles.requestCard}>
                {/* Food Info */}
                <div style={styles.cardHeader}>
                  <div style={styles.foodInfo}>
                    <h3 style={styles.foodName}>
                      {request.donation?.foodName || 'Unknown Food'}
                    </h3>
                    <span style={styles.foodType}>
                      {request.donation?.foodType === 'veg' ? '🥗 Veg' : '🍗 Non-Veg'}
                    </span>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(request.status === 'pending' && styles.statusPending),
                      ...(request.status === 'accepted' && styles.statusAccepted),
                      ...(request.status === 'declined' && styles.statusDeclined)
                    }}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                {/* Receiver/Donor Info */}
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>
                    {activeTab === 'received'
                      ? request.receiver?.name.substring(0, 2).toUpperCase()
                      : request.donation?.donor?.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={styles.userDetails}>
                    <div style={styles.userName}>
                      {activeTab === 'received'
                        ? request.receiver?.name
                        : request.donation?.donor?.name}
                    </div>
                    <div style={styles.userMeta}>
                      {new Date(request.createdAt).toLocaleDateString()} at{' '}
                      {new Date(request.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Message */}
                {request.message && (
                  <div style={styles.message}>
                    <strong>Message:</strong> {request.message}
                  </div>
                )}

                {/* Actions */}
                {activeTab === 'received' && request.status === 'pending' && (
                  <div style={styles.actions}>
                    <button
                      style={styles.btnDecline}
                      onClick={() => handleDecline(request.id)}
                    >
                      Decline
                    </button>
                    <button
                      style={styles.btnChat}
                      onClick={() => handleChat(request.donationId, request.receiverId)}
                    >
                      💬 Chat
                    </button>
                    <button
                      style={styles.btnAccept}
                      onClick={() => handleAccept(request.id, request.donationId)}
                    >
                      Accept
                    </button>
                  </div>
                )}

                {activeTab === 'sent' && (
                  <div style={styles.infoText}>
                    Status: <strong>{request.status}</strong>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#F9F9F9',
    paddingBottom: '80px',
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
    background: 'white',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: '16px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: '#F9F9F9',
    border: 'none',
    borderRadius: '8px',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    cursor: 'pointer',
    color: COLORS.textLight,
  },
  tabActive: {
    background: COLORS.primary,
    color: 'white',
  },
  content: {
    padding: '20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  requestCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '4px',
  },
  foodType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  statusPending: {
    background: '#FFF4E6',
    color: '#F59E0B',
  },
  statusAccepted: {
    background: '#D1FAE5',
    color: '#10B981',
  },
  statusDeclined: {
    background: '#FEE2E2',
    color: '#EF4444',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '2px',
  },
  userMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  message: {
    padding: '12px',
    background: '#F9F9F9',
    borderRadius: '8px',
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: '12px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  btnAccept: {
    flex: 1,
    padding: '10px',
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDecline: {
    flex: 1,
    padding: '10px',
    background: '#FEE2E2',
    color: '#EF4444',
    border: 'none',
    borderRadius: '8px',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnChat: {
    flex: 1,
    padding: '10px',
    background: '#F3F4F6',
    color: COLORS.text,
    border: 'none',
    borderRadius: '8px',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    cursor: 'pointer',
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: '8px',
  },
};

export default Requests;
