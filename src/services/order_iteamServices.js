// order_itemServices.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/orderitems';

// Khởi tạo instance axios với token trong headers
const getToken = () => {
    return localStorage.getItem('token'); // Có thể thay bằng sessionStorage nếu cần
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Bearer ${getToken()}`
    }
});

// Cập nhật token trong headers trước mỗi request
axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Hàm lấy tất cả order items
export const getAllOrderItems = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error) {
        console.error("Error fetching order items:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getOrderItemsByOrderId = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching order items:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Hàm lấy sản phẩm bán chạy nhất
export const getTopSellingProducts = async () => {
    try {
        const response = await axiosInstance.get('/top_selling');
        return response.data;
    } catch (error) {
        console.error("Error fetching top selling products:", error.response ? error.response.data : error.message);
        throw error;
    }
};
