import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        await checkAndRedirect(user);
      }
    };
    checkAuth();
  }, []);

  // Check if user has profile and redirect accordingly
  const checkAndRedirect = async (user) => {
    try {
      const token = await user.getIdToken();
      
      // Check if profile exists in backend
      const response = await api.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.data) {
        // User has profile, save to localStorage and go to home
        localStorage.setItem('userProfile', JSON.stringify({
          ...response.data.data,
          profileCompleted: true,
        }));
        navigate('/home');
      } else {
        // No profile found, go to profile setup
        navigate('/profile-setup');
      }
    } catch (error) {
      console.error('Profile check error:', error);
      // If profile doesn't exist (404 or error), go to profile setup
      if (error.response?.status === 404 || !error.response?.data?.data) {
        navigate('/profile-setup');
      } else {
        alert('Error checking profile: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Check profile and redirect
      await checkAndRedirect(userCredential.user);
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials. Please check your email and password';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check profile and redirect (works for both new and existing users)
      await checkAndRedirect(result.user);
    } catch (error) {
      console.error('Google login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, do nothing
        return;
      }
      
      alert('Google login failed: ' + error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="page" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>🍲</div>
        <h1 style={styles.title}>Annam Mithra</h1>
        <p style={styles.subtitle}>Sharing food, spreading kindness</p>
      </div>

      <form onSubmit={handleEmailLogin} style={styles.form}>
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(value) => setFormData({ ...formData, password: value })}
          error={errors.password}
        />

        <Button type="submit" loading={loading}>
          Sign In
        </Button>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

        <button
          type="button"
          style={styles.googleBtn}
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <span style={styles.googleIcon}>🔐</span>
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <span 
            style={styles.link}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '500px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logo: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  title: {
    fontSize: FONT_SIZES.xxl || '28px',
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: FONT_SIZES.md || '16px',
    color: COLORS.textLight,
  },
  form: {
    width: '100%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: COLORS.border,
  },
  dividerText: {
    padding: '0 16px',
    fontSize: FONT_SIZES.sm || '14px',
    color: COLORS.textLight,
  },
  googleBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: `2px solid ${COLORS.border}`,
    background: 'white',
    fontSize: FONT_SIZES.md || '16px',
    fontWeight: '600',
    color: COLORS.text,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  googleIcon: {
    fontSize: '20px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm || '14px',
    color: COLORS.textLight,
    marginTop: '16px',
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Login;
