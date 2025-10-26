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
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    foodName: '',
    quantity: '',
    description: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

    useEffect(() => {
    // Update displayed requests when tab changes
    setRequests(activeTab === 'received' ? receivedRequests : sentRequests);
  }, [activeTab, receivedRequests, sentRequests]);


  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();

      const [receivedResponse, sentResponse] = await Promise.all([
        api.get('/donations/interests/received', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/donations/interests/sent', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (receivedResponse.data.success) setReceivedRequests(receivedResponse.data.data);
      if (sentResponse.data.success) setSentRequests(sentResponse.data.data);

      setRequests(activeTab === 'received' ? receivedResponse.data.data : sentResponse.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };


  // ✅ NEW: Open modal when accept is clicked
  const handleAcceptClick = (request) => {
    setSelectedRequest(request);
    setEditFormData({
      foodName: request.donation?.foodName || '',
      quantity: request.donation?.quantity || '',
      description: request.donation?.description || ''
    });
    setShowAcceptModal(true);
  };

  // ✅ NEW: Handle keep listing (with or without edit)
  const handleKeepListing = async (shouldEdit) => {
    if (shouldEdit) {
      setShowEditForm(true);
    } else {
      await finalizeAccept('keep', null);
    }
  };

  // ✅ NEW: Handle remove listing (mark as completed)
  const handleRemoveListing = async () => {
    await finalizeAccept('remove', null);
  };

  // ✅ NEW: Handle edit form submission
  const handleEditSubmit = async () => {
    await finalizeAccept('keep', editFormData);
  };

  // ✅ NEW: Finalize the accept action
  const finalizeAccept = async (action, updatedData) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.post(
        '/donations/interests/accept',
        { 
          interestId: selectedRequest.id,
          donationId: selectedRequest.donationId,
          action: action, // 'keep' or 'remove'
          updatedData: updatedData // null or edited data
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(action === 'remove' 
          ? 'Request accepted! Listing removed from map.' 
          : 'Request accepted! Listing still visible on map.'
        );
        setShowAcceptModal(false);
        setShowEditForm(false);
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

    const handleChat = (donationId, receiverId) => {
    navigate(`/chat/${donationId}/${receiverId}`);
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
        fetchRequests();
      }
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRequestDelivery = async (request) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    await api.post('/delivery/request-partner', {
      donationId: request.donationId,
      location: request.donation.pickupLocation
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Nearby partners notified successfully!");
  } catch (err) {
    alert("Failed to notify delivery partners.");
  }
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
              Received ({receivedRequests.length})
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'sent' && styles.tabActive)
              }}
              onClick={() => setActiveTab('sent')}
            >
              Sent ({sentRequests.length})
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

                {request.message && (
                  <div style={styles.message}>
                    <strong>Message:</strong> {request.message}
                  </div>
                )}

{activeTab === 'received' && (request.status === 'pending' || request.status === 'accepted') && (
  <div style={styles.actions}>
    <button
      style={styles.btnDecline}
      onClick={() => handleDecline(request.id)}
      disabled={request.status === 'accepted'}
    >
      Decline
    </button>
    <button
      style={styles.btnChat}
      onClick={() => handleChat(request.donationId, request.receiverId)}
    >
      💬 Chat
    </button>
    {request.status === 'pending' && (
      <button
        style={styles.btnAccept}
        onClick={() => handleAcceptClick(request)}
      >
        Accept
      </button>
    )}
  </div>
)}


                {/* Add Chat button in Sent requests so receiver can chat too */}
                {activeTab === 'sent' && (
                  <div style={styles.actions}>
                    <button
                      style={styles.btnChat}
                      onClick={() => handleChat(request.donationId, request.donation.donor.id)}
                    >
                      💬 Chat
                    </button>
                  </div>
                )}

                {activeTab === 'sent' && (
                  <div style={styles.infoText}>
                    Status: <strong>{request.status}</strong>
                  </div>
                )}

                {activeTab === 'sent' && request.status === 'accepted' && (
  <div style={{marginTop: 10}}>
    <button
      style={{
        ...styles.btnPrimary,
        background: "#2D9CDB"
      }}
      onClick={() => handleRequestDelivery(request)}
    >
      Request to Find Delivery Partner
    </button>
  </div>
)}

              </div>
            ))
          )}
        </div>
      </div>



      {/* ✅ NEW: Accept Modal */}
      {showAcceptModal && selectedRequest && (
        <div style={styles.modalOverlay} onClick={() => setShowAcceptModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Accept Request</h2>
              <button style={styles.closeBtn} onClick={() => setShowAcceptModal(false)}>✕</button>
            </div>

            {!showEditForm ? (
              <>
                <div style={styles.modalContent}>
                  <p style={styles.modalText}>
                    You're accepting the request for <strong>{selectedRequest.donation?.foodName}</strong>
                  </p>
                  <p style={styles.modalQuestion}>
                    What would you like to do with your listing?
                  </p>
                </div>

                <div style={styles.modalActions}>
                  <button
                    style={styles.modalBtn}
                    onClick={() => handleRemoveListing()}
                  >
                    🗑️ Remove from Map
                    <span style={styles.modalBtnSub}>Mark as completed</span>
                  </button>
                  
                  <button
                    style={styles.modalBtn}
                    onClick={() => handleKeepListing(false)}
                  >
                    ✅ Keep on Map
                    <span style={styles.modalBtnSub}>As is (no changes)</span>
                  </button>
                  
                  <button
                    style={styles.modalBtnPrimary}
                    onClick={() => handleKeepListing(true)}
                  >
                    ✏️ Keep & Edit
                    <span style={styles.modalBtnSub}>Update quantity/details</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.modalContent}>
                  <p style={styles.modalText}>Edit your donation details:</p>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Food Name</label>
                    <input
                      style={styles.input}
                      value={editFormData.foodName}
                      onChange={(e) => setEditFormData({ ...editFormData, foodName: e.target.value })}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Quantity (servings)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={editFormData.quantity}
                      onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      style={styles.textarea}
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div style={styles.modalActionsRow}>
                  <button
                    style={styles.btnSecondary}
                    onClick={() => setShowEditForm(false)}
                  >
                    Back
                  </button>
                  <button
                    style={styles.btnPrimary}
                    onClick={handleEditSubmit}
                  >
                    Save & Accept
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
  // ✅ NEW: Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: COLORS.textLight,
  },
  modalContent: {
    padding: '20px',
  },
  modalText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: '8px',
  },
  modalQuestion: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: '16px',
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '0 20px 20px',
  },
  modalBtn: {
    padding: '16px',
    background: 'white',
    border: `2px solid ${COLORS.border}`,
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    transition: 'all 0.2s',
  },
  modalBtnPrimary: {
    padding: '16px',
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  modalBtnSub: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'normal',
    opacity: 0.7,
  },
  modalActionsRow: {
    display: 'flex',
    gap: '12px',
    padding: '0 20px 20px',
  },
  btnSecondary: {
    flex: 1,
    padding: '12px',
    background: 'white',
    color: COLORS.text,
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnPrimary: {
    flex: 1,
    padding: '12px',
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: FONT_SIZES.sm,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: FONT_SIZES.sm,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
  },
};

export default Requests;
