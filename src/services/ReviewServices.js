import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/review'; // Update to the reviews endpoint

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

// Lấy danh sách đánh giá
export const getAllReviews = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error) {
        console.error("Error fetching reviews:", error.response.data);
        throw error;
    }
};

// Thêm đánh giá
export const addReview = async (reviewData) => {
    try {
        const response = await axiosInstance.post('/create_review', reviewData);
        return response.data;
    } catch (error) {
        console.error("Error adding review:", error.response.data);
        throw error;
    }
};

// Cập nhật đánh giá
export const updateReview = async (reviewId, reviewData) => {
    try {
        const response = await axiosInstance.put(`/${reviewId}/update_review`, reviewData);
        return response.data;
    } catch (error) {
        console.error("Error updating review:", error.response.data);
        throw error;
    }
};

// Xóa đánh giá
export const deleteReview = async (reviewId) => {
    try {
        const response = await axiosInstance.delete(`/${reviewId}/delete_review`);
        return response.data;
    } catch (error) {
        console.error("Error deleting review:", error.response.data);
        throw error;
    }
};

// Tìm kiếm đánh giá
export const searchReviews = async (searchTerm) => {
    try {
        const response = await axiosInstance.get('/search', {
            params: { keyword: searchTerm },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching reviews:", error.response.data);
        throw error;
    }
};

