import axios from "axios";

const API_URL = 'http://localhost:3000/v1/variants'; // Đổi URL thành endpoint địa chỉ

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

//get Variants by productId
export const getVariantsByProductId = async (ProductID) => { // Đổi tên hàm
    try {
        const response = await axiosInstance.get(`/${ProductID}/getVariantByProductId`);
        return response.data;
    } catch (error) {
        console.error("Error searching products:", error.response.data);
        throw error;
    }
};

export const CreateVariant = async (variantData) =>{
    try {
        const response = await axiosInstance.post('/create_variant',variantData);
        return response.data;
    } catch (error) {
        console.error("Error create variants:", error.response.data);
        throw error;
    }
}

export const deleteVariantss = async (variantID) =>{
    try {
        const response = await axiosInstance.post('/deleteVariant',{variantId:variantID});
        return response.data;
    } catch (error) {
        console.error("Error create variants:", error.response.data);
        throw error;
    }
}

export const updateVariantQuantity = async (variantID,size, quantity) =>{
    try {
        const response = await axiosInstance.put(`/${variantID}/update-quantity`,{size,quantity});
        return response.data;
    } catch (error) {
        console.error("Error create variants:", error.response.data);
        throw error;
    }
}