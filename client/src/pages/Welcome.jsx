import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";
import Button from "../components/Button";
import { COLORS, FONT_SIZES } from "../config/theme";
import logo from "../assets/logo.png";

const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const savedProfile = localStorage.getItem("userProfile");
      if (!savedProfile) {
        navigate("/profile-setup");
      }
    } catch (error) {
      alert("Sign in failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles.animations}</style>
      <div style={styles.container}>
        {/* Hero Section */}
        <div style={styles.hero}>
          {/* Animated Background Gradient */}
          <div style={styles.bgGradient}></div>

          {/* Logo and Branding */}
          <div style={styles.brandSection}>
            <div style={styles.logoContainer}>
              <img src={logo} alt="Annam Mithra" style={styles.logo} />
            </div>
            <h1 style={styles.title}>Annam Mithra</h1>
            <p style={styles.subtitle}>Share Food, Share Love</p>
          </div>

          {/* Stats Pills */}
          <div style={styles.statsContainer}>
            <div style={styles.statPill}>
              <span style={styles.statNumber}>10K+</span>
              <span style={styles.statLabel}>Meals</span>
            </div>
            <div style={styles.statPill}>
              <span style={styles.statNumber}>500+</span>
              <span style={styles.statLabel}>Donors</span>
            </div>
            <div style={styles.statPill}>
              <span style={styles.statNumber}>50+</span>
              <span style={styles.statLabel}>Cities</span>
            </div>
          </div>
        </div>

        {/* Features Section - Simplified for Mobile */}
        <div style={styles.featuresSection}>
          <h2 style={styles.sectionTitle}>Why Annam Mithra?</h2>

          <FeatureCard
            icon="🤝"
            title="Zero Food Waste"
            description="Connect surplus food with hungry neighbors instantly"
            gradient="linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
          />

          <FeatureCard
            icon="🗺️"
            title="Find Food Nearby"
            description="Real-time map shows donations in your area"
            gradient="linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
          />

          <FeatureCard
            icon="🏆"
            title="Track Your Impact"
            description="Earn badges and see lives you've touched"
            gradient="linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
          />
        </div>

        {/* How It Works - Mobile Optimized */}
        <div style={styles.howSection}>
          <h2 style={styles.sectionTitle}>Simple 3-Step Process</h2>

          <div style={styles.stepsContainer}>
            <StepItem
              number="1"
              emoji="👤"
              title="Sign Up"
              description="Quick Google sign-in"
            />
            <div style={styles.stepConnector}>↓</div>

            <StepItem
              number="2"
              emoji="📍"
              title="Share or Find"
              description="Post food or browse map"
            />
            <div style={styles.stepConnector}>↓</div>

            <StepItem
              number="3"
              emoji="✨"
              title="Make Impact"
              description="Connect and help feed"
            />
          </div>
        </div>

        {/* Sticky CTA Button */}
        <div style={styles.ctaSection}>
          <div style={styles.ctaContent}>
            <p style={styles.ctaText}>
              Join <strong>500+ food heroes</strong> in your community
            </p>

            <Button
              onClick={handleGoogleSignIn}
              loading={loading}
              variant="primary"
              style={styles.ctaButton}
            >
              <span style={styles.buttonContent}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </span>
            </Button>

            <p style={styles.disclaimer}>Free • No credit card • 2 min setup</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Feature Card Component - Mobile Optimized
const FeatureCard = ({ icon, title, description, gradient }) => (
  <div style={styles.featureCard}>
    <div style={{ ...styles.featureIconCircle, background: gradient }}>
      <span style={styles.featureIcon}>{icon}</span>
    </div>
    <div style={styles.featureContent}>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDesc}>{description}</p>
    </div>
  </div>
);

// Step Item Component
const StepItem = ({ number, emoji, title, description }) => (
  <div style={styles.stepItem}>
    <div style={styles.stepNumber}>{number}</div>
    <div style={styles.stepContent}>
      <div style={styles.stepEmoji}>{emoji}</div>
      <div>
        <h4 style={styles.stepTitle}>{title}</h4>
        <p style={styles.stepDesc}>{description}</p>
      </div>
    </div>
  </div>
);

// Styles Object
const styles = {
  container: {
    minHeight: "100vh",
    background: COLORS.background,
    paddingBottom: "100px", // Space for sticky CTA
  },

  // Hero Section
  hero: {
    position: "relative",
    minHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 16px 40px",
    overflow: "hidden",
  },
  bgGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${COLORS.primary}12 0%, ${COLORS.background} 100%)`,
    zIndex: 0,
  },

  // Branding
  brandSection: {
    textAlign: "center",
    zIndex: 1,
    animation: "fadeInUp 0.6s ease-out",
  },
  logoContainer: {
    width: "100px",
    height: "100px",
    margin: "0 auto 20px",
    borderRadius: "50%",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    animation: "scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: "8px",
    letterSpacing: "-0.02em",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "18px",
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: "32px",
    opacity: 0.9,
  },

  // Stats Pills
  statsContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "24px",
    zIndex: 1,
    animation: "fadeInUp 0.8s ease-out",
  },
  statPill: {
    background: "white",
    borderRadius: "20px",
    padding: "10px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    minWidth: "85px",
  },
  statNumber: {
    fontSize: "20px",
    fontWeight: "800",
    color: COLORS.primary,
    lineHeight: "1",
  },
  statLabel: {
    fontSize: "11px",
    color: COLORS.textLight,
    marginTop: "4px",
    fontWeight: "500",
  },

  // Features Section
  featuresSection: {
    padding: "40px 16px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.text,
    marginBottom: "24px",
    letterSpacing: "-0.01em",
  },
  featureCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  featureIconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
  featureIcon: {
    fontSize: "28px",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: "6px",
    lineHeight: "1.3",
  },
  featureDesc: {
    fontSize: "14px",
    color: COLORS.textLight,
    lineHeight: "1.5",
    margin: 0,
  },

  // How It Works Section
  howSection: {
    padding: "40px 16px",
    background: `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.primary}06 100%)`,
  },
  stepsContainer: {
    maxWidth: "400px",
    margin: "0 auto",
  },
  stepItem: {
    display: "flex",
    gap: "16px",
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  stepNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: COLORS.primary,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "800",
    flexShrink: 0,
  },
  stepContent: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flex: 1,
  },
  stepEmoji: {
    fontSize: "32px",
  },
  stepTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.text,
    margin: "0 0 2px 0",
    lineHeight: "1.2",
  },
  stepDesc: {
    fontSize: "13px",
    color: COLORS.textLight,
    margin: 0,
    lineHeight: "1.4",
  },
  stepConnector: {
    textAlign: "center",
    fontSize: "24px",
    color: COLORS.primary,
    margin: "8px 0",
    fontWeight: "bold",
  },

  // CTA Section - Sticky at bottom
  ctaSection: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "white",
    borderTop: `1px solid ${COLORS.border}`,
    padding: "16px",
    boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
    zIndex: 100,
  },
  ctaContent: {
    maxWidth: "500px",
    margin: "0 auto",
  },
  ctaText: {
    fontSize: "14px",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  ctaButton: {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "12px",
    boxShadow: `0 4px 16px ${COLORS.primary}30`,
    minHeight: "52px", // Touch-friendly height
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  disclaimer: {
    fontSize: "11px",
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: "8px",
    lineHeight: "1.4",
  },

  // Animations
  animations: `
    @keyframes scaleIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes fadeInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Touch feedback for cards */
    .featureCard:active {
      transform: scale(0.98) !important;
    }

    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
    }

    /* Remove tap highlight on mobile */
    * {
      -webkit-tap-highlight-color: transparent;
    }
  `,
};

export default Welcome;
