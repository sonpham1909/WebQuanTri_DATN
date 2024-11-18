import axios from 'axios';

// Đường dẫn API gốc
const API_URL = 'http://localhost:3000/v1/message';

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

// Gửi tin nhắn từ khách hàng
export const sendMessage = async (messageData) => {
    try {
        const response = await axiosInstance.post('/messages', messageData); // Gửi tin nhắn đến /messages
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Admin trả lời tin nhắn của khách hàng
export const replyMessage = async (replyData) => {
    try {
        const response = await axiosInstance.post('/replies', replyData); // Trả lời tin nhắn qua endpoint /messages/replies
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error replying to message:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Lấy tất cả tin nhắn của một người dùng
export const getAllMessagesByUserId = async (userId) => {
    try {
        const response = await axiosInstance.get('/messages', {
            params: { userId: userId }, // Gửi userId như là tham số truy vấn
        });
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Lấy tất cả phản hồi của một tin nhắn
export const getRepliesByMessageId = async (messageId) => {
    try {
        const response = await axiosInstance.get(`/messages/${messageId}/replies`); // Lấy phản hồi cho một tin nhắn
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error fetching replies:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Cập nhật nội dung của một tin nhắn
export const updateMessage = async (messageId, messageData) => {
    try {
        const response = await axiosInstance.put(`/messages/${messageId}`, messageData); // Cập nhật tin nhắn qua /messages/:messageId
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error updating message:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Xóa một tin nhắn
export const deleteMessage = async (messageId) => {
    try {
        const response = await axiosInstance.delete(`/messages/${messageId}`); // Xóa tin nhắn qua /messages/:messageId
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error deleting message:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};