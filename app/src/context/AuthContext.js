import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Configure axios defaults
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
  axios.defaults.baseURL = API_URL;

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get ID token and set auth header
        const token = await firebaseUser.getIdToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user profile from backend
        try {
          const response = await axios.get('/users/profile');
          setUserProfile(response.data);
          await AsyncStorage.setItem('userProfile', JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
        setUserProfile(null);
        await AsyncStorage.removeItem('userProfile');
      }
      
      if (initializing) setInitializing(false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Phone authentication - Note: Phone auth has limitations on web/Expo Go
  const signInWithPhone = async (phoneNumber) => {
    try {
      // This requires RecaptchaVerifier which works better on web
      // For mobile, you'll need to use a different approach or build with EAS
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      }, auth);
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmation;
    } catch (error) {
      console.error('Phone sign-in error:', error);
      throw error;
    }
  };

  const confirmCode = async (confirmation, code) => {
    try {
      await confirmation.confirm(code);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Google Sign-in
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/users/profile', profileData);
      setUserProfile(response.data);
      await AsyncStorage.setItem('userProfile', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.clear();
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithPhone,
    confirmCode,
    signInWithGoogle,
    updateProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
