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

    // Hàm đăng xuất
    const logout = async () => {
        setIsLoading(true);
        try {
            await logoutUser(); // Gọi service đăng xuất
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        } finally {
            setUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);
        }
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