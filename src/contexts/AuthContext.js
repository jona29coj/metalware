// src/contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for authentication
const AuthContext = createContext();

// AuthProvider component to wrap around your application
export const AuthProvider = ({ children }) => {
  // Initialize user state
  const [user, setUser] = useState(() => {
    // Check if a user is already logged in
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Function to handle login
  const login = (username, password) => {
    // Replace this with your actual authentication logic (e.g., API call)
    // For demonstration, we're using hardcoded credentials
    if (username === 'admin' && password === 'admin') {
      const userData = { username };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Save user to localStorage
      return true; // Login successful
    }
    return false; // Login failed
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user from localStorage
  };

  // Optional: useEffect to manage user session on page refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Provide user state and methods to the context consumers
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);
