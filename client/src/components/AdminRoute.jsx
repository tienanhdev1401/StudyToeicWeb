import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Higher-Order Component để bảo vệ các route admin
const AdminRoute = ({ children }) => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  // Debug cho việc kiểm tra quyền
  useEffect(() => {
    if (isLoggedIn) {
      console.log("AdminRoute - Auth state:", { 
        isLoggedIn, 
        user: user ? { id: user.id, role: user.role } : null 
      });
    }
  }, [isLoggedIn, user]);

  // Hiển thị loader khi đang kiểm tra auth
  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // Kiểm tra nếu user đã đăng nhập và có role là admin hoặc staff
  if (isLoggedIn && user && (user.role === 'admin' || user.role === 'staff')) {
    return children;
  }

  // Nếu không đủ quyền, chuyển hướng đến trang đăng nhập admin
  // Lưu lại path hiện tại để có thể redirect sau khi đăng nhập
  return <Navigate to="/admin/login" state={{ from: location }} replace />;
};

export default AdminRoute; 