import axios from 'axios';
import config from './config';

const API_URL = `${config.API_BASE_URL}/user`;
const UPLOAD_URL = `${config.API_BASE_URL}/upload`;

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
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('userService - Calling profile API with token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('userService - Profile API response received');
      return response.data;
    } catch (error) {
      console.error('userService - Error fetching profile:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Profile error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Network error: Could not connect to server');
      } else {
        // Something happened in setting up the request
        throw new Error(`Error: ${error.message}`);
      }
    }
  },

  uploadImage: async (file, folder = 'users') => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${UPLOAD_URL}/image?folder=${folder}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.url) {
        return response.data.url;
      }
      throw new Error('Upload failed: No URL returned');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      let updatedData = { ...userData };
      
      // Nếu có file ảnh mới, tải lên và lấy URL
      if (userData.newAvatarFile) {
        // Tải ảnh mới lên
        const imageUrl = await userService.uploadImage(userData.newAvatarFile);
        
        // Lưu URL ảnh mới vào dữ liệu cập nhật
        updatedData.avatar = imageUrl;
      }
  
      // Xóa file ảnh tạm khỏi dữ liệu gửi đi
      delete updatedData.newAvatarFile;
  
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/update-profile`, updatedData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email,
        otp,
        newPassword
      });
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Đổi mật khẩu thất bại');
    } catch (error) {
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || 'Không thể kết nối đến server';
      throw new Error(errorMessage);
    }
  }
};

export default userService;