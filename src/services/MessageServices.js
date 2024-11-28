import axios from 'axios';

// Đường dẫn API gốc
const API_URL = 'http://localhost:3000/v1/message';  // Đường dẫn đúng theo controllers/MessageController.js

// Hàm để lấy token từ localStorage
const getToken = () => {
    return localStorage.getItem('token'); // Hoặc sử dụng sessionStorage nếu cần
};

// Tạo instance axios với các cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Bearer ${getToken()}` // Thêm token vào header
    }
});

// Cập nhật token trong headers trước mỗi yêu cầu
axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // Cập nhật token nếu có
    }
    return config;
});

// Tạo tin nhắn mới
export const createMessage = async (messageData) => {
    try {
        const response = await axiosInstance.post('/messages', messageData);  // Gửi tin nhắn đến /messages
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error creating message:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Lấy tất cả tin nhắn
export const getAllMessages = async () => {
    try {
        const response = await axiosInstance.get('/messages');  // Lấy tất cả tin nhắn từ endpoint /messages
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error fetching all messages:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Lấy tin nhắn theo ID
export const getMessageById = async (messageId) => {
    try {
        const response = await axiosInstance.get(`/messages/${messageId}`);  // Lấy tin nhắn theo ID
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error fetching message by ID:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Cập nhật tin nhắn
export const updateMessage = async (messageId, messageData) => {
    try {
        const response = await axiosInstance.put(`/messages/${messageId}`, messageData);  // Cập nhật tin nhắn qua /messages/:messageId
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error updating message:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Xóa tin nhắn
export const deleteMessage = async (messageId) => {
    try {
        const response = await axiosInstance.delete(`/messages/${messageId}`);  // Xóa tin nhắn qua /messages/:messageId
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error deleting message:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};
