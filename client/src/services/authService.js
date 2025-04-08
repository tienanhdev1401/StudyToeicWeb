import axios from 'axios';

// Cấu hình axios với base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Điều chỉnh URL phù hợp với backend của bạn
  withCredentials: true
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
    const token = localStorage.getItem('token');
    
    // Gọi API logout backend
    await API.post('/auth/logout', null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    throw error;
  } finally {
    // Luôn xóa dữ liệu local dù API thành công hay thất bại
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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