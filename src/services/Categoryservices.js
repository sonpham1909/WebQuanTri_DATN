import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/categorys';

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

// Lấy danh sách danh mục
export const getAllCategories = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error.response.data);
        throw error;
    }
};

// Thêm danh mục
export const addCategory = async (categoryData) => {
    try {
        const response = await axiosInstance.post('/create_category', categoryData);
        return response.data;
    } catch (error) {
        console.error("Error adding category:", error.response.data);
        throw error;
    }
};

// Cập nhật danh mục
export const updateCategory = async (categoryId, categoryData) => {
    try {
        const response = await axiosInstance.put(`/${categoryId}/update_category`, categoryData);
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error.response.data);
        throw error;
    }
};

// Xóa danh mục
export const deleteCategory = async (categoryId) => {
    try {
        const response = await axiosInstance.delete(`/${categoryId}/delete_category`);
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error.response.data);
        throw error;
    }
};

// Tìm kiếm danh mục
export const searchCategories = async (searchTerm) => {
    try {
        const response = await axiosInstance.get('/search', {
            params: { keyword: searchTerm },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching categories:", error.response.data);
        throw error;
    }
};
