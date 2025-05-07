import axios from 'axios';

const config = {
  API_BASE_URL: 'https://hostservertoeic.tptienanh.website/api',
  // API_BASE_URL: 'http://localhost:5000/api',
  withCredentials: true,
};

// Cấu hình mặc định cho axios
const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true, // Quan trọng cho việc gửi cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout sau 10 giây
});

// Thêm interceptor để xử lý response và lỗi
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi
    if (error.response) {
      // Nhận được phản hồi từ server với mã lỗi
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error('Request error:', error.request);
    } else {
      // Lỗi khi thiết lập request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);
export default config;

// Helper function để lấy URL đầy đủ của API
export const getApiUrl = (endpoint) => {
  // Loại bỏ dấu / ở đầu để tránh double slashes
  const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${config.API_BASE_URL}/${path}`;
};

// Export instance Axios đã được cấu hình
export const api = axiosInstance;