import React, { useState, useEffect } from "react";
import axios from "axios";

const FoodList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");

  useEffect(() => {
    fetchUserDonations();
  }, []);

  const fetchUserDonations = async () => {
    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile"));
      if (!userProfile || !userProfile.firebaseUid) {
        setLoading(false);
        return;
      }
      const response = await axios.get(
        "http://localhost:5000/api/donations/my-donations",
        {
          params: { firebaseUid: userProfile.firebaseUid },
        }
      );
      if (response.data.success) setDonations(response.data.data);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (donation) => {
    setEditingId(donation.id);
    setEditQuantity(donation.quantity.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity("");
  };

  const handleSaveQuantity = async (donationId) => {
    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile"));
      const response = await axios.patch(
        `http://localhost:5000/api/donations/${donationId}/quantity`,
        {
          quantity: parseInt(editQuantity),
          firebaseUid: userProfile.firebaseUid,
        }
      );
      if (response.data.success) {
        alert("Quantity updated successfully!");
        fetchUserDonations();
        handleCancelEdit();
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this donation? This cannot be undone."
      )
    )
      return;
    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile"));
      const response = await axios.delete(
        `http://localhost:5000/api/donations/${donationId}`,
        { data: { firebaseUid: userProfile.firebaseUid } }
      );
      if (response.data.success) {
        alert("Donation deleted!");
        fetchUserDonations();
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div style={styles.foodListSection}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading your donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.foodListSection}>
      <div style={styles.foodListTitle}>Your Active Donations</div>
      {donations.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </div>
          <p style={styles.emptyText}>No donations available right now</p>
          <p style={styles.emptySubtext}>
            Donate food to help others in your community
          </p>
        </div>
      ) : (
        <div style={styles.donationList}>
          {donations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              isEditing={editingId === donation.id}
              editQuantity={editQuantity}
              onEditClick={() => handleEditClick(donation)}
              onCancelEdit={handleCancelEdit}
              onQuantityChange={(e) => setEditQuantity(e.target.value)}
              onSave={() => handleSaveQuantity(donation.id)}
              onDelete={() => handleDeleteDonation(donation.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DonationCard = ({
  donation,
  isEditing,
  editQuantity,
  onEditClick,
  onCancelEdit,
  onQuantityChange,
  onSave,
  onDelete,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#34C759";
      case "partially_accepted":
        return "#FF9500";
      case "completed":
        return "#8E8E93";
      default:
        return "#8E8E93";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "partially_accepted":
        return "Partially Accepted";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div style={styles.donationCard}>
      <div
        style={{
          ...styles.foodTypeBadge,
          background: donation.foodType === "veg" ? "#E8F5E9" : "#FFEBEE",
          color: donation.foodType === "veg" ? "#2E7D32" : "#C62828",
        }}
      >
        {donation.foodType === "veg" ? "🥗 Veg" : "🍗 Non-Veg"}
      </div>
      {donation.images && donation.images.length > 0 && (
        <img
          src={`http://localhost:5000${donation.images[0]}`}
          alt={donation.foodName}
          style={styles.foodImage}
          onError={(e) => (e.target.style.display = "none")}
        />
      )}
      <div style={styles.foodDetails}>
        <h3 style={styles.foodName}>{donation.foodName}</h3>
        <p style={styles.foodDescription}>{donation.description}</p>
        <div style={styles.quantitySection}>
          <span style={styles.quantityLabel}>Quantity:</span>
          {isEditing ? (
            <div style={styles.editQuantityContainer}>
              <input
                type="number"
                value={editQuantity}
                onChange={onQuantityChange}
                style={styles.quantityInput}
                min="1"
              />
              <button style={styles.saveBtn} onClick={onSave}>
                ✓
              </button>
              <button style={styles.cancelBtn} onClick={onCancelEdit}>
                ✕
              </button>
            </div>
          ) : (
            <div style={styles.quantityDisplay}>
              <span style={styles.quantityValue}>
                {donation.remainingQuantity} / {donation.quantity} servings
              </span>
              {donation.status === "active" && (
                <>
                  <button style={styles.editBtn} onClick={onEditClick}>
                    ✏️ Edit
                  </button>
                  <button style={styles.deleteBtn} onClick={onDelete}>
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div style={styles.metaInfo}>
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>📍</span>
            <span style={styles.metaText}>{donation.address}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>📞</span>
            <span style={styles.metaText}>{donation.phone}</span>
          </div>
        </div>
        <div
          style={{
            ...styles.statusBadge,
            background: getStatusColor(donation.status) + "20",
            color: getStatusColor(donation.status),
          }}
        >
          {getStatusText(donation.status)}
        </div>
      </div>
    </div>
  );
};

const styles = {
  foodListSection: {
    padding: "24px 16px",
    backgroundColor: "#FFFFFF",
  },
  foodListTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "16px",
    letterSpacing: "-0.01em",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #fc8019",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  emptyState: {
    backgroundColor: "#FAFAFA",
    border: "1px solid #F3F4F6",
    borderRadius: "16px",
    padding: "48px 24px",
    textAlign: "center",
  },
  emptyIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 16px",
    color: "#D1D5DB",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "6px",
  },
  emptySubtext: { fontSize: "14px", color: "#6B7280", lineHeight: "1.5" },
  donationList: { display: "flex", flexDirection: "column", gap: "16px" },
  donationCard: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
    position: "relative",
  },
  foodTypeBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    zIndex: 1,
  },
  foodImage: { width: "100%", height: "180px", objectFit: "cover" },
  foodDetails: { padding: "16px" },
  foodName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
    margin: 0,
  },
  foodDescription: {
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  quantitySection: {
    marginBottom: "12px",
    padding: "12px",
    background: "#F9FAFB",
    borderRadius: "8px",
  },
  quantityLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    display: "block",
    marginBottom: "8px",
  },
  quantityDisplay: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "6px",
  },
  quantityValue: { fontSize: "16px", fontWeight: "600", color: "#fc8019" },
  editBtn: {
    padding: "6px 10px",
    background: "#8751d3ee",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 10px",
    background: "#e02d2b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  editQuantityContainer: { display: "flex", gap: "8px", alignItems: "center" },
  quantityInput: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #E0E0E0",
    borderRadius: "6px",
    outline: "none",
  },
  saveBtn: {
    padding: "8px 12px",
    background: "#34C759",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "8px 12px",
    background: "#FF3B30",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  metaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  metaItem: { display: "flex", alignItems: "center", gap: "8px" },
  metaIcon: { fontSize: "14px" },
  metaText: { fontSize: "13px", color: "#6B7280" },
  statusBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default FoodList;
