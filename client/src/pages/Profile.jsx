import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
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

      // Get Firebase token
      const token = await auth.currentUser.getIdToken();
      
      // Send to backend
      const response = await api.put('/users/profile', updatedProfile, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update localStorage
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
    // Reset to saved profile data
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
    <div className="page" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/home')}>
          ← Back
        </button>
        <h1 style={styles.title}>My Profile</h1>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Profile Avatar Section */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarLarge}>
            {getInitials(profileData.name)}
          </div>
          <h2 style={styles.profileName}>{profileData.name}</h2>
          <p style={styles.profileEmail}>{profileData.email}</p>
          
          {!isEditing && (
            <button 
              style={styles.editBtn}
              onClick={() => setIsEditing(true)}
            >
              <span style={styles.editIcon}>✏️</span>
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div style={styles.section}>
          {!isEditing ? (
            // View Mode
            <>
              <div style={styles.infoCard}>
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <span style={styles.infoIcon}>👤</span>
                    Full Name
                  </div>
                  <div style={styles.infoValue}>{profileData.name}</div>
                </div>

                <div style={styles.infoDivider}></div>

                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <span style={styles.infoIcon}>📧</span>
                    Email
                  </div>
                  <div style={styles.infoValue}>{profileData.email}</div>
                </div>

                <div style={styles.infoDivider}></div>

                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <span style={styles.infoIcon}>📱</span>
                    Phone
                  </div>
                  <div style={styles.infoValue}>{profileData.phone}</div>
                </div>

                <div style={styles.infoDivider}></div>

                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <span style={styles.infoIcon}>🍽️</span>
                    Food Preference
                  </div>
                  <div style={styles.infoValue}>
                    {vegOptions.find(opt => opt.id === profileData.vegPreference)?.label || 'Not set'}
                  </div>
                </div>

                <div style={styles.infoDivider}></div>

                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <span style={styles.infoIcon}>🏢</span>
                    Receiver Type
                  </div>
                  <div style={styles.infoValue}>
                    {receiverTypes.find(type => type.id === profileData.receiverType)?.label || 'Not set'}
                  </div>
                </div>

                <div style={styles.infoDivider}></div>

                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>
                    <span style={styles.infoIcon}>📍</span>
                    Address
                  </div>
                  <div style={styles.infoValue}>{profileData.address}</div>
                </div>
              </div>
            </>
          ) : (
            // Edit Mode
            <div style={styles.editForm}>
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
                  style={{ ...styles.formInput, ...styles.formInputDisabled }}
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
                <div style={styles.optionsRow}>
                  {vegOptions.map(option => (
                    <div
                      key={option.id}
                      style={{
                        ...styles.optionCard,
                        ...(profileData.vegPreference === option.id ? styles.optionCardSelected : {})
                      }}
                      onClick={() => setProfileData({ ...profileData, vegPreference: option.id })}
                    >
                      <div style={styles.optionIcon}>{option.icon}</div>
                      <div style={styles.optionLabel}>{option.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>I am a</label>
                <div style={styles.gridContainer}>
                  {receiverTypes.map(type => (
                    <div
                      key={type.id}
                      style={{
                        ...styles.gridCard,
                        ...(profileData.receiverType === type.id ? styles.gridCardSelected : {})
                      }}
                      onClick={() => setProfileData({ ...profileData, receiverType: type.id })}
                    >
                      <div style={styles.gridIcon}>{type.icon}</div>
                      <div style={styles.gridLabel}>{type.label}</div>
                    </div>
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

              <div style={styles.btnGroup}>
                <button 
                  style={styles.btnSecondary}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  style={styles.btnPrimary}
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
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#F9F9F9',
  },
  header: {
    background: COLORS.primary || '#7C9D3D',
    color: 'white',
    padding: '20px',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  content: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  
  // Avatar Section
  avatarSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px 20px',
    textAlign: 'center',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  avatarLarge: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: COLORS.primary || '#7C9D3D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 auto 16px',
  },
  profileName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: COLORS.text || '#2C3E50',
    marginBottom: '4px',
  },
  profileEmail: {
    fontSize: '14px',
    color: COLORS.textLight || '#7F8C8D',
    marginBottom: '20px',
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: COLORS.primary || '#7C9D3D',
    color: 'white',
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
  
  // Info Card (View Mode)
  section: {
    marginBottom: '20px',
  },
  infoCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 0',
  },
  infoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: COLORS.textLight || '#7F8C8D',
    flex: 1,
  },
  infoIcon: {
    fontSize: '18px',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: COLORS.text || '#2C3E50',
    textAlign: 'right',
    flex: 1,
  },
  infoDivider: {
    height: '1px',
    background: '#E0E0E0',
    margin: '0',
  },
  
  // Edit Form
  editForm: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: COLORS.text || '#2C3E50',
    marginBottom: '8px',
  },
  formInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    color: COLORS.text || '#2C3E50',
    background: 'white',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  },
  formInputDisabled: {
    background: '#F5F5F5',
    cursor: 'not-allowed',
  },
  formTextarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    color: COLORS.text || '#2C3E50',
    background: 'white',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '80px',
  },
  optionsRow: {
    display: 'flex',
    gap: '12px',
  },
  optionCard: {
    flex: 1,
    background: 'white',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionCardSelected: {
    borderColor: COLORS.primary || '#7C9D3D',
    background: 'rgba(124, 157, 61, 0.05)',
  },
  optionIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  optionLabel: {
    fontSize: '12px',
    color: COLORS.text || '#2C3E50',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  gridCard: {
    background: 'white',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  gridCardSelected: {
    borderColor: COLORS.primary || '#7C9D3D',
    background: 'rgba(124, 157, 61, 0.05)',
  },
  gridIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  gridLabel: {
    fontSize: '11px',
    color: COLORS.text || '#2C3E50',
  },
  errorText: {
    fontSize: '12px',
    color: '#E74C3C',
    marginTop: '4px',
  },
  btnGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  btnPrimary: {
    flex: 1,
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: COLORS.primary || '#7C9D3D',
    color: 'white',
  },
  btnSecondary: {
    flex: 1,
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'white',
    color: COLORS.text || '#2C3E50',
    border: '2px solid #E0E0E0',
  },
};

export default Profile;