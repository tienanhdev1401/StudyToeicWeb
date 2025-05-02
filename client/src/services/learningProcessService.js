import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const learningProcessService = {
    // Lấy tất cả quá trình học tập của user
    getAllLearningProcessByUserId: async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/learning-process/user/${userId}`);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Không thể lấy danh sách quá trình học tập');
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quá trình học tập:', error);
            throw error;
        }
    },

    // Lấy thống kê học tập của user
    getLearningStatistics: async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/learning-process/user/${userId}/statistics`);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Không thể lấy thống kê học tập');
            }
        } catch (error) {
            console.error('Lỗi khi lấy thống kê học tập:', error);
            throw error;
        }
    },

    // Tạo hoặc cập nhật trạng thái "in_progress"
    setLearningProcessInProgress: async (userId, learningData) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/learning-process/user/${userId}/in-progress`,
                learningData
            );
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Không thể cập nhật trạng thái học tập');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái học tập:', error);
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Không thể cập nhật trạng thái học tập');
            }
            throw error;
        }
    },

    // Cập nhật trạng thái thành "completed"
    setLearningProcessCompleted: async (processId) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/learning-process/${processId}/completed`
            );
            
            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.message || 'Không thể hoàn thành quá trình học tập');
            }
        } catch (error) {
            console.error('Lỗi khi hoàn thành quá trình học tập:', error);
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Không thể hoàn thành quá trình học tập');
            }
            throw error;
        }
    }
};

export default learningProcessService; 