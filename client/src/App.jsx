import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import api from "./services/api";

// Import pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import ReceiverHome from "./pages/ReceiverHome";
import DonateForm from "./pages/DonateForm";

// Import notification components
import NotificationSetup from "./components/NotificationSetup";
import TestNotificationButton from "./components/TestNotificationButton";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash after 2.5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Check if profile exists in backend
        try {
          const token = await firebaseUser.getIdToken();
          const response = await api.get("/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success && response.data.data) {
            // Profile exists
            localStorage.setItem(
              "userProfile",
              JSON.stringify({
                ...response.data.data,
                profileCompleted: true,
              }),
            );
            setProfileCompleted(true);
          } else {
            // No profile found
            setProfileCompleted(false);
          }
        } catch (error) {
          console.error("Profile check error:", error);
          // If 404 or error, profile doesn't exist
          setProfileCompleted(false);
        }
      } else {
        // User not logged in
        setUser(null);
        setProfileCompleted(false);
        localStorage.removeItem("userProfile");
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#708238",
        }}
      >
        <div style={{ color: "white", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      {/* Notification Components - Only show when user is logged in */}
      {user && (
        <>
          <NotificationSetup />
          {profileCompleted && <TestNotificationButton />}
        </>
      )}

      <Routes>
        {/* Public routes - only accessible when NOT logged in */}
        <Route
          path="/"
          element={
            !user ? (
              <Login />
            ) : (
              <Navigate to={profileCompleted ? "/home" : "/profile-setup"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !user ? (
              <Signup />
            ) : (
              <Navigate to={profileCompleted ? "/home" : "/profile-setup"} />
            )
          }
        />

        {/* Profile setup - only accessible when logged in WITHOUT profile */}
        <Route
          path="/profile-setup"
          element={
            user && !profileCompleted ? (
              <ProfileSetup />
            ) : (
              <Navigate to={user ? "/home" : "/"} />
            )
          }
        />

        {/* Protected routes - only accessible when logged in WITH profile */}
        <Route
          path="/home"
          element={
            user && profileCompleted ? (
              <ReceiverHome />
            ) : (
              <Navigate to={user ? "/profile-setup" : "/"} />
            )
          }
        />
        <Route
          path="/donate"
          element={
            user && profileCompleted ? (
              <DonateForm />
            ) : (
              <Navigate to={user ? "/profile-setup" : "/"} />
            )
          }
        />

        {/* Catch all - redirect based on auth state */}
        <Route
          path="*"
          element={
            <Navigate
              to={user ? (profileCompleted ? "/home" : "/profile-setup") : "/"}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

