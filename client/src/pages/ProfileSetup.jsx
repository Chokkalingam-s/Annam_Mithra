import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vegPreference: 'both',
    receiverType: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.receiverType) newErrors.receiverType = 'Please select receiver type';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      const profile = {
        ...formData,
        email: auth.currentUser?.email,
        firebaseUid: auth.currentUser?.uid,
        profileCompleted: true,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage for now (will connect to backend later)
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
      alert('Profile created successfully!');
      window.location.href = '/home'; // Force reload to update App state
      
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Complete Your Profile</h1>
        <p style={styles.subtitle}>Help us personalize your experience</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Basic Info */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            error={errors.name}
          />

          <Input
            label="Mobile Number"
            placeholder="Enter your mobile number"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            error={errors.phone}
          />
        </div>

        {/* Food Preference */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Food Preference</h3>
          <div style={styles.optionsRow}>
            {vegOptions.map(option => (
              <div
                key={option.id}
                style={{
                  ...styles.optionCard,
                  ...(formData.vegPreference === option.id ? styles.optionCardSelected : {})
                }}
                onClick={() => setFormData({ ...formData, vegPreference: option.id })}
              >
                <div style={styles.optionIcon}>{option.icon}</div>
                <div style={styles.optionLabel}>{option.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Receiver Type */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>I am a</h3>
          <div style={styles.gridContainer}>
            {receiverTypes.map(type => (
              <div
                key={type.id}
                style={{
                  ...styles.gridCard,
                  ...(formData.receiverType === type.id ? styles.gridCardSelected : {})
                }}
                onClick={() => setFormData({ ...formData, receiverType: type.id })}
              >
                <div style={styles.gridIcon}>{type.icon}</div>
                <div style={styles.gridLabel}>{type.label}</div>
              </div>
            ))}
          </div>
          {errors.receiverType && (
            <p style={styles.errorText}>{errors.receiverType}</p>
          )}
        </div>

        {/* Location */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Location</h3>
          <Input
            label="Address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            error={errors.address}
          />
        </div>

        <Button type="submit" loading={loading}>
          Complete Setup
        </Button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    marginTop: '20px',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  form: {
    width: '100%',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '12px',
  },
  optionsRow: {
    display: 'flex',
    gap: '12px',
  },
  optionCard: {
    flex: 1,
    background: 'white',
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    background: '#F5F7F0',
  },
  optionIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  optionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  gridCard: {
    background: 'white',
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  gridCardSelected: {
    borderColor: COLORS.primary,
    background: '#F5F7F0',
  },
  gridIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  gridLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: '4px',
  },
};

export default ProfileSetup;
