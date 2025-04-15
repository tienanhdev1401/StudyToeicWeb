import React, { createContext, useState, useContext } from 'react';
import userService from '../services/userService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const sendVerificationCode = async (email) => {
    return await userService.sendVerificationCode(email);
  };

  const register = async (userData) => {
    try {
      const response = await userService.register(userData);
      if (response && response.success) {
        setUser(response.user);
        return response;
      } else {
        throw new Error(response.message || 'Đăng ký không thành công');
      }
    } catch (error) {
      console.error('Register error in context:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, sendVerificationCode, register }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};