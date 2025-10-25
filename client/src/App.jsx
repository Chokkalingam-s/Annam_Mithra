// client/src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoadScript } from "@react-google-maps/api"; // ✅ Add this import
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import api from "./services/api";
import TagMe from "./pages/TagMe";
import CreateTag from "./pages/CreateTag";
import Requests from './pages/Requests';

// Import pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import ReceiverHome from "./pages/ReceiverHome";
import DonateForm from "./pages/DonateForm";
import Profile from "./pages/Profile";
import ChatListPage from "./pages/ChatListPage";
import ChatWindowPage from "./pages/ChatWindowPage";

// Import notification components
import NotificationSetup from "./components/NotificationSetup";

import "./App.css";
import Welcome from "./pages/Welcome";
import FindFoodNearby from "./pages/FindFoodNearby";

function App() {
  const [user, setUser] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const token = await firebaseUser.getIdToken();
          const response = await api.get("/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success && response.data.data) {
            localStorage.setItem(
              "userProfile",
              JSON.stringify({
                ...response.data.data,
                profileCompleted: true,
              })
            );
            setProfileCompleted(true);
          } else {
            setProfileCompleted(false);
          }
        } catch (error) {
          console.error("Profile check error:", error);
          setProfileCompleted(false);
        }
      } else {
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

  if (showSplash) {
    return <Splash />;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    // ✅ Wrap everything with LoadScript (ONCE for entire app)
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Router>
        <NotificationSetup />

        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/home" />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/home" />}
          />
          <Route
            path="/profile-setup"
            element={
              user && !profileCompleted ? (
                <ProfileSetup />
              ) : user && profileCompleted ? (
                <Navigate to="/home" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/home"
            element={
              user && profileCompleted ? (
                <ReceiverHome />
              ) : user && !profileCompleted ? (
                <Navigate to="/profile-setup" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/donate"
            element={
              user && profileCompleted ? (
                <DonateForm />
              ) : user && !profileCompleted ? (
                <Navigate to="/profile-setup" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/find-food"
            element={
              user && profileCompleted ? (
                <FindFoodNearby />
              ) : user && !profileCompleted ? (
                <Navigate to="/profile-setup" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user && profileCompleted ? (
                <Profile />
              ) : user && !profileCompleted ? (
                <Navigate to="/profile-setup" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={
              user && profileCompleted ? (
                <Navigate to="/home" />
              ) : user && !profileCompleted ? (
                <Navigate to="/profile-setup" />
              ) : (
                <Navigate to="/welcome" />
              )
            }
          />
          
          <Route
  path="/requests"
  element={
    user && profileCompleted ? (
      <Requests />
    ) : user && !profileCompleted ? (
      <Navigate to="/profile-setup" />
    ) : (
      <Navigate to="/login" />
    )
  }
/>
          <Route path="/tag-me" element={<TagMe />} />
          <Route path="/tag-me/create" element={<CreateTag />} />
        </Routes>
      </Router>
    </LoadScript>
  );
}

export default App;
