import axios from 'axios';

const API_URL = 'http://localhost:3000/v1/PaymentMethod'; // Thay đổi đường dẫn API đến payment_methods

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

// Lấy danh sách phương thức thanh toán
export const getAllPaymentMethods = async () => { 
    try {
        const response = await axiosInstance.get('/'); 
        return response.data;
    } catch (error) {
        console.error("Error fetching payment methods:", error.response.data);
        throw error;
    }
};

// Thêm phương thức thanh toán
export const addPaymentMethod = async (paymentMethodData) => { 
    try {
        const response = await axiosInstance.post('/create_payment_method', paymentMethodData); 
        return response.data;
    } catch (error) {
        console.error("Error adding payment method:", error.response.data);
        throw error;
    }
};

// Cập nhật phương thức thanh toán
export const updatePaymentMethod = async (paymentMethodId, paymentMethodData) => { 
    try {
        const response = await axiosInstance.put(`/${paymentMethodId}/update_payment_method`, paymentMethodData); 
        return response.data;
    } catch (error) {
        console.error("Error updating payment method:", error.response.data);
        throw error;
    }
};

// Xóa phương thức thanh toán
export const deletePaymentMethod = async (paymentMethodId) => { 
    try {
        const response = await axiosInstance.delete(`/${paymentMethodId}/delete_payment_method`); 
        return response.data;
    } catch (error) {
        console.error("Error deleting payment method:", error.response.data);
        throw error;
    }
};

// Tìm kiếm phương thức thanh toán
export const searchPaymentMethods = async (searchTerm) => { 
    try {
        const response = await axiosInstance.get('/search', {
            params: { keyword: searchTerm },
        });
        return response.data;
    } catch (error) {
        console.error("Error searching payment methods:", error.response.data);
        throw error;
    }
};
