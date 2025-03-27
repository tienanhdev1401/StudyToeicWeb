import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/authService';

// Tạo context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentUser = getCurrentUser();
      const authenticated = isAuthenticated();

      setUser(currentUser);
      setIsLoggedIn(authenticated);
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Hàm đăng nhập
  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  // Giá trị context
  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng context xác thực
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};