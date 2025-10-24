import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONT_SIZES } from '../config/theme';

const DonateForm = () => {
  const navigate = useNavigate();

  return (
    <div className="page" style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 style={styles.title}>Donate Food</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.comingSoon}>
          <div style={styles.icon}>🚧</div>
          <h2 style={styles.comingSoonTitle}>Coming Soon</h2>
          <p style={styles.comingSoonText}>
            Donation form will be available soon
          </p>
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
    background: COLORS.primary,
    color: 'white',
    padding: '20px',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: FONT_SIZES.md,
    cursor: 'pointer',
    marginBottom: '8px',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  content: {
    padding: '20px',
  },
  comingSoon: {
    background: 'white',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  comingSoonTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: '8px',
  },
  comingSoonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
};

export default DonateForm;
