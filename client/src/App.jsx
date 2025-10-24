import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Import pages
import Splash from './pages/Splash';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import ReceiverHome from './pages/ReceiverHome';
import DonateForm from './pages/DonateForm';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash after 2.5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Check if user profile exists in localStorage
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('userProfile');
      }
      
      setLoading(false);
    });

    return () => {
      clearTimeout(splashTimer);
      unsubscribe();
    };
  }, []);

  // Show splash screen
  if (showSplash) {
    return <Splash />;
  }

  // Show loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#708238'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        {!user && (
          <>
            <Route path="/" element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* Profile setup route (user logged in but no profile) */}
        {user && !userProfile?.profileCompleted && (
          <>
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="*" element={<Navigate to="/profile-setup" />} />
          </>
        )}

        {/* Protected routes (user logged in with profile) */}
        {user && userProfile?.profileCompleted && (
          <>
            <Route path="/home" element={<ReceiverHome />} />
            <Route path="/donate" element={<DonateForm />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
