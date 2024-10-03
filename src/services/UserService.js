// src/services/userService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/users'; // URL của backend

const getToken = () => {
    return localStorage.getItem('token'); // Hoặc sử dụng sessionStorage nếu cần
};
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Bearer ${getToken()}` // Thêm token vào header
    }
});

axiosInstance.interceptors.request.use((config) => {
    const token = getToken(); // Lấy token mới nhất
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // Cập nhật header với token
    }
    return config;
});
// Lấy danh sách người dùng
export const getAllUsers = async () => {
    try {
        console.log("Token being sent:", getToken());
        const response = await axiosInstance.get();
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const deleteUser = async (userId) => {
    try {
        const response = await axiosInstance.delete(`/${userId}/delete_user`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const addUser = async (userData) => {
    try {
        const response = await axiosInstance.post(`/add_user`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const updateUser = async (userId, userData) => {
    try {
        const response = await axiosInstance.put(`/${userId}/update_user`, userData); // Gửi yêu cầu cập nhật
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const searchUsers = async (searchTerm) => {
    try {
        const response = await axiosInstance.get('/search', {
            params: { keyword: searchTerm }, // Thay thế 'name' bằng trường bạn muốn tìm kiếm
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};