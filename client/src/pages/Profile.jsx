import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import api from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Load profile from localStorage
  const savedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  
  const [profileData, setProfileData] = useState({
    name: savedProfile.name || '',
    phone: savedProfile.phone || '',
    email: savedProfile.email || '',
    vegPreference: savedProfile.vegPreference || 'both',
    receiverType: savedProfile.receiverType || '',
    address: savedProfile.address || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const vegOptions = [
    { id: 'veg', label: 'Vegetarian', icon: '🥗' },
    { id: 'non-veg', label: 'Non-Veg', icon: '🍗' },
    { id: 'both', label: 'Both', icon: '🍽️' },
  ];

  const receiverTypes = [
    { id: 'individual', label: 'Individual', icon: '👤' },
    { id: 'ngo', label: 'NGO', icon: '🏢' },
    { id: 'charity', label: 'Charity', icon: '❤️' },
    { id: 'ashram', label: 'Ashram', icon: '🕉️' },
    { id: 'bulk', label: 'Bulk Receiver', icon: '📦' },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) newErrors.name = 'Name is required';
    if (!profileData.phone.trim()) newErrors.phone = 'Phone is required';
    if (profileData.phone.trim().length !== 10) newErrors.phone = 'Phone must be 10 digits';
    if (!profileData.receiverType) newErrors.receiverType = 'Please select receiver type';
    if (!profileData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const updatedProfile = {
        firebaseUid: auth.currentUser?.uid,
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        vegPreference: profileData.vegPreference,
        receiverType: profileData.receiverType,
        address: profileData.address,
        latitude: savedProfile.latitude || null,
        longitude: savedProfile.longitude || null,
      };

      const token = await auth.currentUser.getIdToken();
      
      const response = await api.put('/users/profile', updatedProfile, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        localStorage.setItem('userProfile', JSON.stringify({
          ...response.data.data,
          profileCompleted: true,
        }));
        
        alert('Profile updated successfully!');
        setIsEditing(false);
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: savedProfile.name || '',
      phone: savedProfile.phone || '',
      email: savedProfile.email || '',
      vegPreference: savedProfile.vegPreference || 'both',
      receiverType: savedProfile.receiverType || '',
      address: savedProfile.address || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div style={styles.container}>
      {/* Header - Matching ReceiverHome */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={() => navigate('/home')}>
              <span style={styles.backIcon}>←</span>
              <span style={styles.backText}>Back</span>
            </button>
          </div>
          <h1 style={{...styles.pageTitle, ...(isMobile && styles.pageTitleMobile)}}>
            My Profile
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Profile Avatar Section */}
          <div style={{...styles.avatarCard, ...(isMobile && styles.avatarCardMobile)}}>
            <div style={{...styles.avatarLarge, ...(isMobile && styles.avatarLargeMobile)}}>
              {getInitials(profileData.name)}
            </div>
            <h2 style={{...styles.profileName, ...(isMobile && styles.profileNameMobile)}}>
              {profileData.name}
            </h2>
            <p style={styles.profileEmail}>{profileData.email}</p>
            
            {!isEditing && (
              <button style={styles.editButton} onClick={() => setIsEditing(true)}>
                <span style={styles.editIcon}>✏️</span>
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Profile Details */}
          <div style={styles.card}>
            {!isEditing ? (
              // View Mode
              <div>
                <h3 style={styles.cardTitle}>Profile Information</h3>
                <div style={styles.infoContainer}>
                  <InfoRow icon="👤" label="Full Name" value={profileData.name} />
                  <InfoRow icon="📧" label="Email" value={profileData.email} />
                  <InfoRow icon="📱" label="Phone" value={profileData.phone} />
                  <InfoRow 
                    icon="🍽️" 
                    label="Food Preference" 
                    value={vegOptions.find(opt => opt.id === profileData.vegPreference)?.label || 'Not set'} 
                  />
                  <InfoRow 
                    icon="🏢" 
                    label="Receiver Type" 
                    value={receiverTypes.find(type => type.id === profileData.receiverType)?.label || 'Not set'} 
                  />
                  <InfoRow icon="📍" label="Address" value={profileData.address} isLast />
                </div>
              </div>
            ) : (
              // Edit Mode
              <div>
                <h3 style={styles.cardTitle}>Edit Profile</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Full Name</label>
                  <input 
                    type="text"
                    style={styles.formInput}
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p style={styles.errorText}>{errors.name}</p>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Email (cannot be changed)</label>
                  <input 
                    type="email"
                    style={{...styles.formInput, ...styles.formInputDisabled}}
                    value={profileData.email}
                    disabled
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Mobile Number</label>
                  <input 
                    type="tel"
                    style={styles.formInput}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Enter your mobile number"
                    maxLength="10"
                  />
                  {errors.phone && <p style={styles.errorText}>{errors.phone}</p>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Food Preference</label>
                  <div style={{...styles.optionsRow, ...(isMobile && styles.optionsRowMobile)}}>
                    {vegOptions.map(option => (
                      <SelectionCard
                        key={option.id}
                        icon={option.icon}
                        label={option.label}
                        selected={profileData.vegPreference === option.id}
                        onClick={() => setProfileData({ ...profileData, vegPreference: option.id })}
                      />
                    ))}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>I am a</label>
                  <div style={{...styles.gridContainer, ...(isMobile && styles.gridContainerMobile)}}>
                    {receiverTypes.map(type => (
                      <SelectionCard
                        key={type.id}
                        icon={type.icon}
                        label={type.label}
                        selected={profileData.receiverType === type.id}
                        onClick={() => setProfileData({ ...profileData, receiverType: type.id })}
                        small
                      />
                    ))}
                  </div>
                  {errors.receiverType && <p style={styles.errorText}>{errors.receiverType}</p>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Address</label>
                  <textarea 
                    style={styles.formTextarea}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="Enter your address"
                  />
                  {errors.address && <p style={styles.errorText}>{errors.address}</p>}
                </div>

                <div style={{...styles.buttonGroup, ...(isMobile && styles.buttonGroupMobile)}}>
                  <button 
                    style={{...styles.btnSecondary, ...(isMobile && styles.btnMobile)}}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    style={{...styles.btnPrimary, ...(isMobile && styles.btnMobile)}}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const InfoRow = ({ icon, label, value, isLast }) => (
  <>
    <div style={styles.infoRow}>
      <div style={styles.infoLabel}>
        <span style={styles.infoIcon}>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={styles.infoValue}>{value}</div>
    </div>
    {!isLast && <div style={styles.infoDivider} />}
  </>
);

const SelectionCard = ({ icon, label, selected, onClick, small }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        ...(small ? styles.gridCard : styles.optionCard),
        ...(selected && styles.selectionCardSelected),
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={small ? styles.gridIcon : styles.optionIcon}>{icon}</div>
      <div style={small ? styles.gridLabel : styles.optionLabel}>{label}</div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FAFBFC',
  },
  
  // Header - Matching ReceiverHome
  header: {
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
  },
  headerLeft: {
    marginBottom: '8px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    color: '#7C9D3D',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  backIcon: {
    fontSize: '18px',
  },
  backText: {
    fontSize: '15px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  pageTitleMobile: {
    fontSize: '20px',
  },
  
  // Main Content
  main: {
    padding: '24px 16px',
  },
  contentWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  
  // Avatar Card
  avatarCard: {
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '40px 24px',
    textAlign: 'center',
    marginBottom: '20px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  avatarCardMobile: {
    padding: '32px 20px',
  },
  avatarLarge: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C9D3D 0%, #6B8A35 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 auto 20px',
    boxShadow: '0 4px 12px rgba(124, 157, 61, 0.2)',
  },
  avatarLargeMobile: {
    width: '80px',
    height: '80px',
    fontSize: '30px',
    marginBottom: '16px',
  },
  profileName: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '6px',
    letterSpacing: '-0.02em',
  },
  profileNameMobile: {
    fontSize: '22px',
  },
  profileEmail: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '24px',
  },
  editButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#7C9D3D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  editIcon: {
    fontSize: '16px',
  },
  
  // Card
  card: {
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '24px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '20px',
    letterSpacing: '-0.01em',
  },
  
  // Info Display (View Mode)
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '14px 0',
    gap: '16px',
  },
  infoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  infoIcon: {
    fontSize: '18px',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    wordBreak: 'break-word',
  },
  infoDivider: {
    height: '1px',
    background: '#E5E7EB',
  },
  
  // Form Elements
  formGroup: {
    marginBottom: '24px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '10px',
  },
  formInput: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    color: '#1F2937',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  },
  formInputDisabled: {
    background: '#F9FAFB',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  formTextarea: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    color: '#1F2937',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
  },
  
  // Selection Cards
  optionsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  optionsRowMobile: {
    gap: '10px',
  },
  optionCard: {
    background: '#FFFFFF',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    padding: '16px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  optionIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  optionLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1F2937',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  gridContainerMobile: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  gridCard: {
    background: '#FFFFFF',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    padding: '14px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  gridIcon: {
    fontSize: '24px',
    marginBottom: '6px',
  },
  gridLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1F2937',
  },
  selectionCardSelected: {
    borderColor: '#7C9D3D',
    background: 'rgba(124, 157, 61, 0.04)',
  },
  errorText: {
    fontSize: '12px',
    color: '#EF4444',
    marginTop: '6px',
  },
  
  // Buttons
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  buttonGroupMobile: {
    flexDirection: 'column',
  },
  btnPrimary: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: '#7C9D3D',
    color: '#FFFFFF',
    transition: 'all 0.2s ease',
  },
  btnSecondary: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#FFFFFF',
    color: '#1F2937',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s ease',
  },
  btnMobile: {
    padding: '12px 16px',
    fontSize: '14px',
  },
};

export default Profile;
