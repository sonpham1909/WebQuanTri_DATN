import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/orders'; // Đổi URL thành endpoint địa chỉ

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

export const getAllOrder = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error) {
        console.error("Error fetching order:", error.response.data);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post('/create_order', orderData);
        console.log('Order created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getOrderItemByOrderId = async(orderId) => {
    try {
        const response = await axiosInstance.get('/')
    } catch (error) {
        console.error('Error fetching order items:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export const ChangeStatusOrder = async(orderId, status) => {
    try {
        const response = await axiosInstance.patch(`/${orderId}/change_status`,{status});
        return response.data;
    } catch (error) {
        console.error('Error fetching order items:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export const cancelOrder = async (orderId, reason) => {
    try {
        const cancelReason = String(reason).trim(); // Đảm bảo lý do là chuỗi và không rỗng

        const response = await axiosInstance.patch('/cancel', { 
            orderId, 
            cancelReason 
        });
        return response.data;
    } catch (error) {
        console.error('Error canceling order:', error.response ? error.response.data : error.message);
        throw error;
    }
};