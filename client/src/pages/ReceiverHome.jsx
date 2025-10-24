import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import Button from '../components/Button';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';

const ReceiverHome = () => {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="page" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.greeting}>Hello, {profile.name}! 👋</h1>
            <p style={styles.subGreeting}>Welcome to Annam Mithra</p>
          </div>
          <button style={styles.logoutBtn} onClick={handleSignOut}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <StatCard icon="🍲" value="0" label="Food Received" />
        <StatCard icon="🎁" value="0" label="Donations" />
        <StatCard icon="🏆" value="0" label="Points" />
      </div>

      {/* Main Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        
        <div style={styles.actionCard} onClick={() => navigate('/donate')}>
          <div style={styles.actionIcon}>🤲</div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>Donate Food</h3>
            <p style={styles.actionDesc}>Share your surplus food with those in need</p>
          </div>
          <div style={styles.actionArrow}>→</div>
        </div>

        <div style={styles.actionCard}>
          <div style={styles.actionIcon}>🗺️</div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>Find Food Nearby</h3>
            <p style={styles.actionDesc}>Discover available food in your area</p>
          </div>
          <div style={styles.actionArrow}>→</div>
        </div>

        <div style={styles.actionCard}>
          <div style={styles.actionIcon}>📜</div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>My Requests</h3>
            <p style={styles.actionDesc}>View your active food requests</p>
          </div>
          <div style={styles.actionArrow}>→</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Activity</h2>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyText}>No activity yet</p>
          <p style={styles.emptySubtext}>Start by donating or requesting food</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div style={styles.statCard}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

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
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  subGreeting: {
    fontSize: FONT_SIZES.sm,
    opacity: 0.9,
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: FONT_SIZES.sm,
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    padding: '20px',
    marginTop: '-20px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  section: {
    padding: '20px',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '16px',
  },
  actionCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s',
  },
  actionIcon: {
    fontSize: '32px',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '4px',
  },
  actionDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  actionArrow: {
    fontSize: '20px',
    color: COLORS.primary,
  },
  emptyState: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
};

export default ReceiverHome;
