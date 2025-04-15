import axios from 'axios';

const API_URL = '/api/user';

const userService = {
  sendVerificationCode: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/send-verification-code`, { email });

      // Kiểm tra status code thành công (2xx)
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }

      // Nếu server trả về status code lỗi
      throw new Error(response.data.message || 'Lỗi không xác định khi gửi mã');
    } catch (error) {
      // Xử lý lỗi từ server hoặc lỗi mạng
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || 'Không thể kết nối đến server';

      throw new Error(errorMessage);
    }
  },

  // Phương thức thay đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/change-password`,
        passwordData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      // Kiểm tra status code thành công
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
  
      throw new Error('Thay đổi mật khẩu thất bại');
    } catch (error) {
      console.error("Chi tiết lỗi:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
  
      let errorMessage = 'Đã có lỗi xảy ra khi thay đổi mật khẩu';
  
      if (error.response) {
        // Server phản hồi lỗi
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.';
      } else {
        // Lỗi xảy ra trước khi gửi request
        errorMessage = `Lỗi khi gửi yêu cầu: ${error.message}`;
      }
  
      throw new Error(errorMessage);
    }
  },
  // Phương thức đăng ký
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);

      // Kiểm tra status code từ server
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      // Xử lý lỗi từ axios
      throw new Error(error.response?.data?.error || 'Đã có lỗi xảy ra khi đăng ký');
    }
  },

  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Lỗi lấy thông tin người dùng');
    }
  }
  
};


export default userService;