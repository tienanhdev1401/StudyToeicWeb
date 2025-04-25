/**
 * Lấy token xác thực từ localStorage
 * @returns {string|null} - Token xác thực hoặc null nếu không có
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Lưu token xác thực vào localStorage
 * @param {string} token - Token xác thực
 */
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Xóa token xác thực khỏi localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa
 * @returns {boolean} - True nếu đã đăng nhập, ngược lại là false
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Lấy thông tin người dùng đã đăng nhập từ localStorage
 * @returns {Object|null} - Thông tin người dùng hoặc null nếu chưa đăng nhập
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Lưu thông tin người dùng vào localStorage
 * @param {Object} user - Thông tin người dùng
 */
export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Xóa thông tin người dùng khỏi localStorage
 */
export const removeCurrentUser = () => {
  localStorage.removeItem('user');
}; 