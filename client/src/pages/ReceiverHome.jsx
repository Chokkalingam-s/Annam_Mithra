import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';

const ReceiverHome = () => {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut(auth);
      localStorage.clear();
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.logoContainer}>
              <span style={styles.logoIcon}>🍲</span>
              <span style={styles.logoText}>Annam Mithra</span>
            </div>
          </div>
          
          <div style={styles.headerRight}>
            <div style={styles.profileContainer} ref={dropdownRef}>
              <button style={styles.profileButton} onClick={toggleDropdown}>
                <span style={styles.profileInitials}>{getInitials(profile.name)}</span>
              </button>

              {showDropdown && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownAvatar}>
                      {getInitials(profile.name)}
                    </div>
                    <div style={styles.dropdownUserInfo}>
                      <div style={styles.dropdownName}>{profile.name}</div>
                      <div style={styles.dropdownEmail}>{profile.email}</div>
                    </div>
                  </div>
                  
                  <div style={styles.dropdownDivider} />
                  
                  <div style={styles.dropdownMenu}>
                    <DropdownItem 
                      icon="👤"
                      label="Profile"
                      onClick={handleProfileClick}
                    />
                    <DropdownItem 
                      icon="🚪"
                      label="Logout"
                      onClick={handleSignOut}
                      danger
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Welcome Section */}
          <section style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>
              Welcome back, <span style={styles.userName}>{profile.name}</span>! 👋
            </h1>
            <p style={styles.welcomeSubtitle}>
              Here's what's happening with your food donations today
            </p>
          </section>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <StatCard 
              icon="🍲" 
              value="0" 
              label="Food Received" 
              color="#7C9D3D"
              bgColor="rgba(124, 157, 61, 0.08)"
            />
            <StatCard 
              icon="🎁" 
              value="0" 
              label="Donations Made" 
              color="#F59E0B"
              bgColor="rgba(245, 158, 11, 0.08)"
            />
            <StatCard 
              icon="🏆" 
              value="0" 
              label="Impact Points" 
              color="#3B82F6"
              bgColor="rgba(59, 130, 246, 0.08)"
            />
          </div>

          {/* Content Grid */}
          <div style={styles.contentGrid}>
            {/* Quick Actions */}
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Quick Actions</h2>
              
              <div style={styles.actionsContainer}>
                <ActionCard 
                  icon="🤲"
                  title="Donate Food"
                  description="Share your surplus food with those in need"
                  onClick={() => navigate('/donate')}
                  color="#7C9D3D"
                />

                <ActionCard 
                  icon="🗺️"
                  title="Find Food Nearby"
                  description="Discover available food in your area"
                  onClick={() => navigate('/find-food')}
                  color="#3B82F6"
                />

                <ActionCard 
                  icon="📜"
                  title="My Requests"
                  description="View your active food requests"
                  onClick={() => {}}
                  color="#F59E0B"
                />
              </div>
            </section>

            {/* Recent Activity */}
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Recent Activity</h2>
              
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p style={styles.emptyText}>No recent activity</p>
                <p style={styles.emptySubtext}>
                  Start by donating or requesting food to see your activity here
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

// Dropdown Item Component
const DropdownItem = ({ icon, label, onClick, danger }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        ...styles.dropdownItem,
        ...(danger && styles.dropdownItemDanger),
        background: isHovered ? (danger ? '#FEF2F2' : '#F9FAFB') : 'transparent',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={styles.dropdownIcon}>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

// Stat Card Component with Responsive Design
const StatCard = ({ icon, value, label, color, bgColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div 
      style={{
        ...styles.statCard,
        ...(isMobile && styles.statCardMobile),
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ ...styles.statIconContainer, ...(isMobile && styles.statIconContainerMobile), background: bgColor }}>
        <span style={{ ...styles.statIcon, ...(isMobile && styles.statIconMobile) }}>{icon}</span>
      </div>
      <div style={styles.statContent}>
        <div style={{ ...styles.statValue, ...(isMobile && styles.statValueMobile), color }}>{value}</div>
        <div style={{ ...styles.statLabel, ...(isMobile && styles.statLabelMobile) }}>{label}</div>
      </div>
    </div>
  );
};

// Action Card Component with Responsive Design
const ActionCard = ({ icon, title, description, onClick, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div 
      style={{
        ...styles.actionCard,
        ...(isMobile && styles.actionCardMobile),
        borderLeftColor: isHovered ? color : 'transparent',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.actionLeft}>
        <div style={{ 
          ...styles.actionIconContainer,
          ...(isMobile && styles.actionIconContainerMobile),
          background: `${color}15`,
        }}>
          <span style={{ ...styles.actionIcon, ...(isMobile && styles.actionIconMobile) }}>{icon}</span>
        </div>
        <div style={styles.actionContent}>
          <h3 style={{ ...styles.actionTitle, ...(isMobile && styles.actionTitleMobile) }}>{title}</h3>
          <p style={{ ...styles.actionDesc, ...(isMobile && styles.actionDescMobile) }}>{description}</p>
        </div>
      </div>
      <div style={{
        ...styles.actionArrow,
        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
      }}>→</div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FAFBFC',
  },
  
  // Header - Responsive
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
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#7C9D3D',
    letterSpacing: '-0.02em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  // Profile
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C9D3D 0%, #6B8A35 100%)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(124, 157, 61, 0.2)',
  },
  profileInitials: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    userSelect: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: '46px',
    right: '0',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '220px',
    overflow: 'hidden',
    zIndex: 1000,
    border: '1px solid #E5E7EB',
  },
  dropdownHeader: {
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#FAFBFC',
  },
  dropdownAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C9D3D 0%, #6B8A35 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    flexShrink: 0,
  },
  dropdownUserInfo: {
    flex: 1,
    minWidth: 0,
  },
  dropdownName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropdownEmail: {
    fontSize: '11px',
    color: '#6B7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropdownDivider: {
    height: '1px',
    background: '#E5E7EB',
  },
  dropdownMenu: {
    padding: '6px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  dropdownItemDanger: {
    color: '#DC2626',
  },
  dropdownIcon: {
    fontSize: '15px',
  },
  
  // Main Content - Responsive
  main: {
    padding: '20px 16px',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  // Welcome Section - Responsive
  welcomeSection: {
    marginBottom: '24px',
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '6px',
    letterSpacing: '-0.02em',
    lineHeight: '1.3',
  },
  userName: {
    color: '#7C9D3D',
  },
  welcomeSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.5',
  },
  
  // Stats Grid - Responsive
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  statCardMobile: {
    padding: '14px',
    gap: '10px',
  },
  statIconContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconContainerMobile: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
  },
  statIcon: {
    fontSize: '26px',
  },
  statIconMobile: {
    fontSize: '22px',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '2px',
    letterSpacing: '-0.02em',
  },
  statValueMobile: {
    fontSize: '22px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
  },
  statLabelMobile: {
    fontSize: '11px',
  },
  
  // Content Grid - Responsive
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #E5E7EB',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '16px',
    letterSpacing: '-0.01em',
  },
  
  // Actions - Responsive
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px',
    borderRadius: '8px',
    background: '#FAFBFC',
    border: '1px solid #E5E7EB',
    borderLeft: '4px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionCardMobile: {
    padding: '12px',
  },
  actionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  actionIconContainer: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionIconContainerMobile: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
  },
  actionIcon: {
    fontSize: '20px',
  },
  actionIconMobile: {
    fontSize: '18px',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '3px',
    letterSpacing: '-0.01em',
  },
  actionTitleMobile: {
    fontSize: '13px',
  },
  actionDesc: {
    fontSize: '12px',
    color: '#6B7280',
    lineHeight: '1.4',
  },
  actionDescMobile: {
    fontSize: '11px',
  },
  actionArrow: {
    fontSize: '16px',
    color: '#9CA3AF',
    transition: 'all 0.2s ease',
  },
  
  // Empty State - Responsive
  emptyState: {
    padding: '40px 16px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: '0.3',
  },
  emptyText: {
    fontSize: '14px',
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: '4px',
  },
  emptySubtext: {
    fontSize: '12px',
    color: '#6B7280',
    lineHeight: '1.5',
    maxWidth: '280px',
    margin: '0 auto',
  },
};

export default ReceiverHome;
