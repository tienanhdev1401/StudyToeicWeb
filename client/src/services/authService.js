import axios from 'axios';
import config from './config';

// Cấu hình axios với base URL
const API = axios.create({
  baseURL: config.API_BASE_URL, 
  withCredentials: config.withCredentials
});

// Hàm đăng nhập
export const loginUser = async (email, password) => {
  try {
    const response = await API.post('/auth/login', { email, password });
    
    // Lưu thông tin người dùng và token
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
   
    return response.data;
  } catch (error) {
    // Xử lý lỗi từ phía server
    if (error.response) {
      throw new Error(error.response.data.message || 'Đăng nhập thất bại');
    } else if (error.request) {
      throw new Error('Không thể kết nối đến máy chủ');
    } else {
      throw new Error('Có lỗi xảy ra');
    }
  }
};

// Cập nhật hàm logoutUser
export const logoutUser = async () => {
  try {
    // Attempt to call the logout endpoint if it exists
    await axios.post(`${config.API_BASE_URL}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    // Nếu lỗi 401 thì không cần xử lý gì thêm
    if (error.response?.status === 401) {
      console.warn('Token hết hạn hoặc không hợp lệ khi logout');
    } else {
      console.error('Lỗi khi logout:', error);
    }
  } finally {
    // Vẫn xóa token để đăng xuất user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear any cached states in session/local storage
    sessionStorage.clear();
  }
};

// Thêm interceptor cho axios để xử lý token hết hạn
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Tự động đăng xuất nếu nhận 401
      logoutUser();
    }
    return Promise.reject(error);
  }
);

// Hàm kiểm tra đăng nhập
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Hàm lấy thông tin người dùng hiện tại
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};