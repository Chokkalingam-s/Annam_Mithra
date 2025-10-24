import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Configure axios defaults
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.9.31.253:5000/api';
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
          console.log('User not registered yet, will create profile');
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

  // Phone authentication (Limited in Expo - needs native build)
  const signInWithPhone = async (phoneNumber) => {
    try {
      Alert.alert(
        'Phone Auth Coming Soon',
        'Phone authentication requires a production build. For now, please use Google Sign-in or continue as guest.'
      );
      return null;
    } catch (error) {
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

  // Google Sign-in (Will work after proper setup)
  const signInWithGoogle = async () => {
    try {
      Alert.alert(
        'Google Sign-in',
        'Google sign-in requires additional native configuration. For now, let\'s continue with demo mode.',
        [
          {
            text: 'OK',
            onPress: () => {
              // For demo purposes, create a mock user
              createDemoUser();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Demo user for development
  const createDemoUser = async () => {
    try {
      // Create a demo profile
      const demoProfile = {
        id: 'demo_' + Date.now(),
        name: 'Demo User',
        email: 'demo@annammithra.com',
        role: 'donor',
        phoneNumber: '+91 9876543210',
      };
      
      setUserProfile(demoProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(demoProfile));
      
      Alert.alert('Success', 'Logged in as Demo User');
    } catch (error) {
      console.error('Demo user creation error:', error);
    }
  };

  // Create/Update user profile
  const updateProfile = async (profileData) => {
    try {
      if (!user && !userProfile) {
        // If no Firebase user, just update local profile
        const updatedProfile = { ...userProfile, ...profileData };
        setUserProfile(updatedProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        return updatedProfile;
      }

      // If backend is available, sync with server
      try {
        const response = await axios.put('/users/profile', profileData);
        setUserProfile(response.data);
        await AsyncStorage.setItem('userProfile', JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        // If backend not available, update locally
        const updatedProfile = { ...userProfile, ...profileData };
        setUserProfile(updatedProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        return updatedProfile;
      }
    } catch (error) {
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      if (user) {
        await firebaseSignOut(auth);
      }
      setUserProfile(null);
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
    isAuthenticated: !!userProfile,
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
