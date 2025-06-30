import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if we have a persisted auth state in localStorage
    const persistedAuth = localStorage.getItem('authUser');
    if (persistedAuth) {
      setAuthenticated(true);
    }

    // Set up the Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        // User is signed in
        setAuthenticated(true);
        // Persist auth state in localStorage
        localStorage.setItem('authUser', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }));
      } else {
        // User is signed out
        setAuthenticated(false);
        localStorage.removeItem('authUser');
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Show a loading indicator while Firebase initializes
  if (loading) {
    // Check if we have a persisted auth state to avoid flashing login page
    const persistedAuth = localStorage.getItem('authUser');
    if (persistedAuth) {
      return children;
    }

    // If no persisted state, show a simple loading indicator
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated after loading, redirect to login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;