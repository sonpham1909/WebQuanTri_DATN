import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/ProductsubCategorys'; // Đổi URL thành endpoint cho product subcategories

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

// Lấy danh sách product subcategories
export const getAllProductSubCategories = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error) {
        console.error("Error fetching product subcategories:", error.response.data);
        throw error;
    }
};

// Thêm product subcategory
export const addProductSubCategory = async (subCategoryData) => {
    try {
        const response = await axiosInstance.post('/create_product_sub_category', subCategoryData);
        return response.data;
    } catch (error) {
        console.error("Error adding product subcategory:", error.response.data);
        throw error;
    }
};

// Cập nhật product subcategory
export const updateProductSubCategory = async (subCategoryId, subCategoryData) => {
    try {
        const response = await axiosInstance.put(`/${subCategoryId}/update_product_sub_category`, subCategoryData);
        return response.data;
    } catch (error) {
        console.error("Error updating product subcategory:", error.response.data);
        throw error;
    }
};

// Xóa product subcategory
export const deleteProductSubCategory = async (subCategoryId) => {
    try {
        const response = await axiosInstance.delete(`/${subCategoryId}/delete_product_sub_category`);
        return response.data;
    } catch (error) {
        console.error("Error deleting product subcategory:", error.response.data);
        throw error;
    }
};

// Tìm kiếm product subcategory
export const searchProductSubCategories = async (searchTerm) => {
    try {
        const response = await axiosInstance.get('/search', {
            params: { keyword: searchTerm },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching product subcategories:", error.response.data);
        throw error;
    }
};

// Lấy product subcategory theo ID
export const getProductSubCategoryById = async (id) => {
    try {
        const response = await axiosInstance.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product subcategory by ID:', error.response.data);
        throw error;
    }
};
export const checkProductExistsInSubcategory = async (productId, subcategoryId) => {
    try {
        const response = await axios.get(`${API_URL}/product_sub_categories`, {
            params: {
                product_id: productId,
                sub_categories_id: subcategoryId,
            },
        });
        return response.data.length > 0; // returns true if exists
    } catch (error) {
        throw new Error("Error checking product existence: " + error.message);
    }
};
