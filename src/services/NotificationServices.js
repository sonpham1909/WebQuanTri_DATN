import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/notification'; // Đổi URL thành endpoint địa chỉ

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

export const pushNotification = async (notifiData) => {
    try {
        const response = await axiosInstance.post('/genaral', notifiData);
        console.log('Order created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error.response ? error.response.data : error.message);
        throw error;
    }
};