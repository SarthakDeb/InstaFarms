// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { signupUser as apiSignup, loginUser as apiLogin } from '../api/userService'; // Use specific names
import apiClient from '../api/userService'; // For getUserById or other direct calls if needed

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // For initial auth check
  const [authError, setAuthError] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser'); // User data stored on login

    if (token && storedUser) {
      setAuthToken(token);
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch(e) {
        console.error("Error parsing stored user", e);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { user, token } = await apiSignup({ email, password });
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      setAuthToken(token);
      setCurrentUser(user);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Frontend Signup Error:", error.response?.data?.error || error.message);
      setAuthError(error.response?.data?.error || "Signup failed.");
      setLoading(false);
      return false;
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { user, token } = await apiLogin({ email, password });
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user)); // Store user from login
      setAuthToken(token);
      setCurrentUser(user);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Frontend Login Error:", error.response?.data?.error || error.message);
      setAuthError(error.response?.data?.error || "Login failed.");
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setCurrentUser(null);
      setLoading(false);
      return false;
    }
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthToken(null);
    setCurrentUser(null);
    setAuthError(null);
    // Optionally, you could call a backend /logout endpoint if it did any server-side session invalidation
  };

  const refreshBackendUser = useCallback(async (userIdToRefresh) => {
    const targetUserId = userIdToRefresh || (currentUser ? currentUser.id : null);
    if (!targetUserId) {
      console.warn("refreshBackendUser: No user ID to refresh.");
      return;
    }
    try {
      const refreshedUser = await apiClient.get(`/users/${targetUserId}`); // Using apiClient directly for simplicity
      setCurrentUser(refreshedUser.data);
      localStorage.setItem('authUser', JSON.stringify(refreshedUser.data)); // Update stored user
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      // If token is invalid (e.g. 401), sign out
      if (error.response && (error.response.status === 401 || error.response.status === 403) ) {
        signOut();
      }
    }
  }, [currentUser]);


  const value = {
    currentUser,
    setCurrentUser, // Still useful for direct updates, e.g. after profile edit
    authToken,
    loading,
    authError,
    setAuthError,
    signUp,
    signIn,
    signOut,
    refreshBackendUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};