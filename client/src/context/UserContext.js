import React, { createContext, useState, useContext, useEffect } from 'react';
import userService from '../services/userService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch profile khi component được mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
    setInitialized(true);

    // Listen for logout events
    const handleLogout = () => {
      clearUser();
    };

    window.addEventListener('user-logout', handleLogout);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('user-logout', handleLogout);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log('UserContext - Fetching user profile...');
      const userData = await userService.getUserProfile();
      console.log('UserContext - User profile fetched successfully:', userData);
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('UserContext - Error fetching user profile:', err);
      setError(err.message);
      
      // Check if the error is due to an invalid token
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        console.log('UserContext - Token appears to be invalid, clearing user data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
  };

  const sendVerificationCode = async (email) => {
    try {
      setLoading(true);
      const response = await userService.sendVerificationCode(email);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await userService.changePassword(passwordData);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await userService.register(userData);
      if (response && response.success) {
        setUser(response.user);
        setError(null);
        return response;
      } else {
        throw new Error(response.message || 'Đăng ký không thành công');
      }
    } catch (err) {
      setError(err.message);
      console.error('Register error in context:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      error,
      initialized,
      sendVerificationCode, 
      changePassword,
      register,
      fetchUserProfile,
      clearUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};