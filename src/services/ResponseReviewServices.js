import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/respone'; // Cập nhật endpoint cho phản hồi

// Khởi tạo instance axios
const getToken = () => {
    return localStorage.getItem('token'); // Hoặc sử dụng sessionStorage nếu cần
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Bearer ${getToken()}` // Thêm token vào header
    }
});

// Cập nhật token trong headers
axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Lấy danh sách phản hồi
export const getAllResponses = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error) {
        console.error("Error fetching responses:", error.response.data);
        throw error;
    }
};

// Thêm phản hồi
export const addResponse = async (responseData) => {
    try {
        const response = await axiosInstance.post('/create_response', responseData);
        return response.data;
    } catch (error) {
        console.error("Error adding response:", error.response.data);
        throw error;
    }
};

// Cập nhật phản hồi
export const updateResponse = async (responseId, responseData) => {
    try {
        const response = await axiosInstance.put(`/${responseId}/update_response`, responseData);
        return response.data;
    } catch (error) {
        console.error("Error updating response:", error.response.data);
        throw error;
    }
};

// Xóa phản hồi
export const deleteResponse = async (responseId) => {
    try {
        const response = await axiosInstance.delete(`/${responseId}/delete_response`);
        return response.data;
    } catch (error) {
        console.error("Error deleting response:", error.response.data);
        throw error;
    }
};

// Tìm kiếm phản hồi
export const searchResponses = async (searchTerm) => {
    try {
        const response = await axiosInstance.get('/search', {
            params: { keyword: searchTerm },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching responses:", error.response.data);
        throw error;
    }
};

// Lấy phản hồi theo ID
export const getResponseById = async (responseId) => {
    try {
        const response = await axiosInstance.get(`/${responseId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching response by ID:", error.response.data);
        throw error;
    }
};
