import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvUhQxWzTY0Epqa0LAkHkfPpA8jIMOP_w",
  authDomain: "encode-c9769.firebaseapp.com",
  projectId: "encode-c9769",
  storageBucket: "encode-c9769.appspot.com",
  messagingSenderId: "581353271912",
  appId: "1:581353271912:web:ae2381a5a4ebeccebcc1dd",
  measurementId: "G-TYD7GLX6W5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Authentication Methods

// Sign Up
export const signup = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with username
    await updateProfile(user, {
      displayName: username
    });

    // Send email verification
    await sendEmailVerification(user);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Login
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Logout
export const logout = async () => {
  try {
    // Clear persisted auth state
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');

    // Sign out from Firebase
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Export the app instance
export default app;
