import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import Button from '../components/Button';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';

const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if profile exists
      const savedProfile = localStorage.getItem('userProfile');
      if (!savedProfile) {
        navigate('/profile-setup');
      }
    } catch (error) {
      alert('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoContainer}>
          <img src="/src/assets/logo.png" alt="Logo" style={styles.logo} />
        </div>
        <h1 style={styles.title}>Annam Mithra</h1>
        <p style={styles.subtitle}>Share Food, Share Love</p>
      </div>

      {/* Features */}
      <div style={styles.features}>
        <FeatureCard
          icon="🤝"
          title="Eliminate Food Waste"
          description="Connect surplus food with those who need it"
        />
        <FeatureCard
          icon="🗺️"
          title="Hyperlocal Network"
          description="Find food donations in your neighborhood"
        />
        <FeatureCard
          icon="🏆"
          title="Make an Impact"
          description="Help feed the community and reduce waste"
        />
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <Button
          onClick={handleGoogleSignIn}
          loading={loading}
          variant="primary"
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </span>
        </Button>

        <p style={styles.footerText}>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div style={styles.featureCard}>
    <div style={styles.featureIcon}>{icon}</div>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDesc}>{description}</p>
  </div>
);

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: COLORS.background,
  },
  header: {
    textAlign: 'center',
    paddingTop: '40px',
  },
  logoContainer: {
    width: '100px',
    height: '100px',
    margin: '0 auto 20px',
    borderRadius: '50px',
    background: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
  },
  features: {
    maxWidth: '600px',
    margin: '40px auto',
    width: '100%',
  },
  featureCard: {
    background: 'white',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  actions: {
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%',
  },
  footerText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: '16px',
  },
};

// Mobile responsive
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches) {
  styles.container.padding = '16px';
  styles.title.fontSize = FONT_SIZES.xl;
  styles.featureCard.padding = '20px';
}

export default Welcome;
