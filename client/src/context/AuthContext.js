import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/authService';

// Tạo context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return !!localStorage.getItem('token'); // Kiểm tra token khi khởi tạo
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const currentUser = getCurrentUser();
                    setUser(currentUser);
                    setIsLoggedIn(true);
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsLoggedIn(false);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    // Hàm đăng nhập
    const login = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
    };

    // Hàm refresh token
    const refreshToken = async () => {
        // Implement refresh token logic here if you have a refresh token endpoint
        // For now, we'll just check if the token exists and re-read user data
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const currentUser = getCurrentUser();
                setUser(currentUser);
                setIsLoggedIn(true);
                return true;
            } catch (error) {
                throw new Error('Failed to refresh token');
            }
        } else {
            throw new Error('No token available');
        }
    };

    // Hàm đăng xuất
    const logout = async () => {
        setIsLoading(true);
        try {
            await logoutUser(); // Gọi service đăng xuất
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        } finally {
            // Đảm bảo dữ liệu local storage được xóa sạch trước khi xóa state
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);
            // Dispatch an event to notify other contexts of logout
            window.dispatchEvent(new Event('user-logout'));
        }
    };

    // Giá trị context
    const value = {
        user,
        isLoggedIn,
        isLoading,
        login,
        logout,
        refreshToken
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