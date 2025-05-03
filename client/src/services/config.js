// config.js
const config = {
  // Sử dụng biến môi trường từ file .env
  API_BASE_URL: process.env.REACT_APP_API_URL || '/api',
  // Các cấu hình khác
  withCredentials: true,
};
console.log('API_BASE_URL:', process.env.REACT_APP_API_URL); // Để debug
export default config;

// Helper function để lấy URL đầy đủ của API
export const getApiUrl = (endpoint) => {
  // Loại bỏ dấu / ở đầu để tránh double slashes
  const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${config.API_BASE_URL}/${path}`;
};