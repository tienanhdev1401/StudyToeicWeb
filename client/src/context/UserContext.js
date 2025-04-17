import React, { createContext, useState, useContext, useEffect } from 'react';
import userService from '../services/userService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch profile khi component được mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserProfile();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
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
      sendVerificationCode, 
      changePassword,
      register,
      fetchUserProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};