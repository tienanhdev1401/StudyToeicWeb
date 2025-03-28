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

// Hàm đăng xuất
export const logoutUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Hàm kiểm tra đăng nhập
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Hàm lấy thông tin người dùng hiện tại
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};