import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/address'; // Đổi URL thành endpoint địa chỉ

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

// Lấy danh sách địa chỉ
export const getAllAddresses = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error) {
        console.error("Error fetching addresses:", error.response.data);
        throw error;
    }
};

// Thêm địa chỉ
export const addAddress = async (addressData) => {
    try {
        const response = await axiosInstance.post('/create_address', addressData);
        return response.data;
    } catch (error) {
        console.error("Error adding address:", error.response.data);
        throw error;
    }
};

// Cập nhật địa chỉ
export const updateAddress = async (addressId, addressData) => {
    try {
        const response = await axiosInstance.put(`/${addressId}/update_address`, addressData);
        return response.data;
    } catch (error) {
        console.error("Error updating address:", error.response.data);
        throw error;
    }
};

// Xóa địa chỉ
export const deleteAddress = async (addressId) => {
    try {
        const response = await axiosInstance.delete(`/${addressId}/delete_address`);
        return response.data;
    } catch (error) {
        console.error("Error deleting address:", error.response.data);
        throw error;
    }
};
