import axios from 'axios';

// Đường dẫn API gốc cho phản hồi
const API_URL = 'http://localhost:3000/v1/reply';

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

// Gửi phản hồi cho một tin nhắn
export const createReply = async (replyData) => {
    try {
        const response = await axiosInstance.post('/replies', replyData); // Gửi phản hồi đến /replies
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error creating reply:", error.response?.data || error.message);
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

// Cập nhật phản hồi
export const updateReply = async (replyId, replyData) => {
    try {
        const response = await axiosInstance.put(`replies/${replyId}`, replyData); // Cập nhật phản hồi qua /replies/:replyId
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error updating reply:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};

// Xóa một phản hồi
export const deleteReply = async (replyId) => {
    try {
        const response = await axiosInstance.delete(`replies/${replyId}`); // Xóa phản hồi qua /replies/:replyId
        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Error deleting reply:", error.response?.data || error.message);
        throw error; // Ném lỗi ra ngoài để xử lý
    }
};
