import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONT_SIZES } from '../config/theme';

const DonateForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [foodType, setFoodType] = useState('');
  const [foodItems, setFoodItems] = useState([{ dishName: '', quantity: '' }]);
  const [locationData, setLocationData] = useState({
    address: '',
    city: '',
    pincode: '',
    phone: ''
  });

  // Add new food item
  const addFoodItem = () => {
    setFoodItems([...foodItems, { dishName: '', quantity: '' }]);
  };

  // Remove food item
  const removeFoodItem = (index) => {
    if (foodItems.length > 1) {
      const newItems = foodItems.filter((_, i) => i !== index);
      setFoodItems(newItems);
    }
  };

  // Update food item
  const updateFoodItem = (index, field, value) => {
    const newItems = [...foodItems];
    newItems[index][field] = value;
    setFoodItems(newItems);
  };

  // Validation for step 1
  const isStep1Valid = () => {
    return foodType !== '' && 
           foodItems.every(item => item.dishName.trim() && item.quantity.trim());
  };

  // Validation for step 2
  const isStep2Valid = () => {
    return locationData.address.trim().length > 0 && 
           locationData.city.trim().length > 0 && 
           locationData.pincode.trim().length === 6 && 
           locationData.phone.trim().length === 10;
  };

  // Navigation
  const goToLocationStep = () => {
    if (isStep1Valid()) {
      setCurrentStep(2);
    }
  };

  const submitDonation = () => {
    if (isStep2Valid()) {
      const donationData = {
        foodType,
        foodItems,
        ...locationData
      };
      console.log('Donation submitted:', donationData);
      
      // Show success screen
      setCurrentStep(3);
      
      // Example Firebase integration:
      // firebase.firestore().collection('donations').add(donationData);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      if (window.confirm('Are you sure you want to cancel? Your progress will be lost.')) {
        navigate(-1);
      }
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDone = () => {
    navigate(-1);
  };

  return (
    <div className="page" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={handleBack}>
          ← Back
        </button>
        <h1 style={styles.title}>Donate Food</h1>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Step 1: Food Details */}
        {currentStep === 1 && (
          <div style={styles.stepContent}>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>Food Details</h2>
              <p style={styles.formSubtitle}>Tell us what you're donating</p>
              
              {/* Food Type Selection */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Food Type</label>
                <div style={styles.foodTypeGrid}>
                  <div 
                    style={{
                      ...styles.foodTypeCard,
                      ...(foodType === 'veg' && styles.foodTypeCardSelected)
                    }}
                    onClick={() => setFoodType('veg')}
                  >
                    <div style={styles.foodTypeIcon}>🥗</div>
                    <div style={styles.foodTypeLabel}>Veg</div>
                  </div>
                  <div 
                    style={{
                      ...styles.foodTypeCard,
                      ...(foodType === 'nonveg' && styles.foodTypeCardSelected)
                    }}
                    onClick={() => setFoodType('nonveg')}
                  >
                    <div style={styles.foodTypeIcon}>🍗</div>
                    <div style={styles.foodTypeLabel}>Non-Veg</div>
                  </div>
                </div>
              </div>

              {/* Food Items */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Food Items</label>
                {foodItems.map((item, index) => (
                  <div key={index} style={styles.foodItemRow}>
                    <div style={styles.foodItemInputs}>
                      <input 
                        type="text"
                        style={{ ...styles.formInput, flex: 2 }}
                        placeholder="Dish name (e.g., Biryani)"
                        value={item.dishName}
                        onChange={(e) => updateFoodItem(index, 'dishName', e.target.value)}
                      />
                      <input 
                        type="text"
                        style={{ ...styles.formInput, flex: 1 }}
                        placeholder="Qty (e.g., 5 plates)"
                        value={item.quantity}
                        onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                      />
                    </div>
                    {foodItems.length > 1 && (
                      <button 
                        style={styles.removeBtn}
                        onClick={() => removeFoodItem(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Add Item Button */}
                <button style={styles.addBtn} onClick={addFoodItem}>
                  <span style={styles.addBtnIcon}>+</span>
                  <span>Add More Food Items</span>
                </button>
              </div>

              <div style={styles.btnGroup}>
                <button style={styles.btnSecondary} onClick={handleBack}>Cancel</button>
                <button 
                  style={{
                    ...styles.btnPrimary,
                    opacity: isStep1Valid() ? 1 : 0.5,
                    cursor: isStep1Valid() ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!isStep1Valid()}
                  onClick={goToLocationStep}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location Details */}
        {currentStep === 2 && (
          <div style={styles.stepContent}>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>Pickup Location</h2>
              <p style={styles.formSubtitle}>Where can the food be collected from?</p>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Address</label>
                <textarea 
                  style={styles.formTextarea}
                  placeholder="Enter your full address..."
                  value={locationData.address}
                  onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>City</label>
                <input 
                  type="text"
                  style={styles.formInput}
                  placeholder="e.g., Hyderabad"
                  value={locationData.city}
                  onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Pincode</label>
                <input 
                  type="text"
                  style={styles.formInput}
                  placeholder="e.g., 500001"
                  maxLength="6"
                  value={locationData.pincode}
                  onChange={(e) => setLocationData({ ...locationData, pincode: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Contact Number</label>
                <input 
                  type="tel"
                  style={styles.formInput}
                  placeholder="e.g., 9876543210"
                  maxLength="10"
                  value={locationData.phone}
                  onChange={(e) => setLocationData({ ...locationData, phone: e.target.value })}
                />
              </div>

              <div style={styles.btnGroup}>
                <button style={styles.btnSecondary} onClick={handleBack}>Back</button>
                <button 
                  style={{
                    ...styles.btnPrimary,
                    opacity: isStep2Valid() ? 1 : 0.5,
                    cursor: isStep2Valid() ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!isStep2Valid()}
                  onClick={submitDonation}
                >
                  Submit Donation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {currentStep === 3 && (
          <div style={styles.stepContent}>
            <div style={styles.formCard}>
              <div style={styles.successContainer}>
                <div style={styles.successIcon}>🎉</div>
                <h2 style={styles.successTitle}>Donation Submitted!</h2>
                <p style={styles.successText}>Thank you for your generosity. Your food donation has been registered.</p>

                <div style={styles.donationSummary}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Food Type:</span>
                    <span style={styles.summaryValue}>
                      {foodType === 'veg' ? '🥗 Vegetarian' : '🍗 Non-Vegetarian'}
                    </span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Items:</span>
                    <span style={styles.summaryValue}>{foodItems.length} dish(es)</span>
                  </div>
                  {foodItems.map((item, idx) => (
                    <div key={idx} style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>• {item.dishName}:</span>
                      <span style={styles.summaryValue}>{item.quantity}</span>
                    </div>
                  ))}
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Location:</span>
                    <span style={styles.summaryValue}>{locationData.city}, {locationData.pincode}</span>
                  </div>
                </div>

                <button 
                  style={{ ...styles.btnPrimary, width: '100%' }}
                  onClick={handleDone}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
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
    background: '#7C9D3D',
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
  stepContent: {
    animation: 'fadeIn 0.3s ease',
  },
  formCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '16px',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: '8px',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#7F8C8D',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: '8px',
  },
  foodTypeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  foodTypeCard: {
    background: 'white',
    border: '2px solid #E0E0E0',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  foodTypeCardSelected: {
    borderColor: '#7C9D3D',
    background: 'rgba(124, 157, 61, 0.05)',
  },
  foodTypeIcon: {
    fontSize: '32px',
    marginBottom: '4px',
  },
  foodTypeLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E50',
  },
  foodItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  foodItemInputs: {
    display: 'flex',
    gap: '8px',
    flex: 1,
  },
  formInput: {
    padding: '12px 16px',
    fontSize: '16px',
    color: '#2C3E50',
    background: 'white',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    width: '100%',
  },
  formTextarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    color: '#2C3E50',
    background: 'white',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '80px',
  },
  removeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '2px solid #E74C3C',
    background: 'white',
    color: '#E74C3C',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  addBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px dashed #7C9D3D',
    background: 'rgba(124, 157, 61, 0.05)',
    color: '#7C9D3D',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    marginTop: '8px',
  },
  addBtnIcon: {
    fontSize: '20px',
    fontWeight: 'bold',
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
    background: '#7C9D3D',
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
    color: '#2C3E50',
    border: '2px solid #E0E0E0',
  },
  successContainer: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  successIcon: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '16px',
    color: '#7F8C8D',
    marginBottom: '24px',
  },
  donationSummary: {
    background: 'rgba(124, 157, 61, 0.05)',
    border: '2px solid #7C9D3D',
    borderRadius: '12px',
    padding: '20px',
    margin: '24px 0',
    textAlign: 'left',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
  },
  summaryLabel: {
    color: '#7F8C8D',
  },
  summaryValue: {
    fontWeight: '600',
    color: '#2C3E50',
  },
};

export default DonateForm;