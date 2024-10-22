import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, InputNumber, DatePicker, message, Modal } from 'antd';
import { getAllUsers } from '../../services/UserService';
import { useForm } from 'antd/es/form/Form';
import { getAddressByUserID } from '../../services/AddressServices';
import { getAllProducts } from '../../services/ProductService';
import { getPaymentMethod } from '../../services/Payment_method';
import { getShippingMethod } from '../../services/Shipping_method_service';
import { createOrder } from '../../services/OrderService';

const { Option } = Select;

const CreateOrderForm = ({ onCreate, isVisitable, onCancle }) => {
    const [loading, setLoading] = useState(false);
    const [Users, setUsers] = useState([]);
    const [onUserSelect, setonUserSelect] = useState([]);
    const [defaultAddress, setDefaultAddress] = useState('');
    const [productPrices, setProductPrices] = useState({}); // Để lưu giá cho từng sản phẩm

    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]); // Sản phẩm đã chọn
    const [quantities, setQuantities] = useState({}); // Để lưu số lượng cho từng biến thể
    const [variants, setVariants] = useState({}); // Để lưu biến thể cho từng sản phẩm
    const [payments, setpayment] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState([]);
    const [totalAmount, setTotalAmount] = useState('');

    const [Shippngs, setShippings] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState([]);

    const [form] = Form.useForm();


    const fetchUsers = async () => {
        try {
            setLoading(true);
            const userList = await getAllUsers();


            setUsers(userList);
        } catch (error) {
            message.error('Không thể tải người dùng!');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const proList = await getAllProducts();
            setProducts(proList);






        } catch (error) {
            message.error('Không thể tải sản phẩm!');
        } finally {
            setLoading(false);
        }
    }


    const fetchPaymentModthod = async () => {
        try {
            setLoading(true);
            const payment = await getPaymentMethod();
            setpayment(payment);






        } catch (error) {
            message.error('Không thể tải phương thức thanh toán!');
        } finally {
            setLoading(false);
        }
    }


    const fetchShippingMethod = async () => {
        try {
            setLoading(true);
            const shipping = await getShippingMethod();
            setShippings(shipping);






        } catch (error) {
            message.error('Không thể tải phương thức thanh toán!');
        } finally {
            setLoading(false);
        }
    }



    useEffect(() => {


        fetchUsers();
        fetchProducts();

        console.log(products);

    }, []);

    useEffect(() => {
        fetchPaymentModthod();
        fetchShippingMethod();
        console.log(payments);

    }, []);



    const handleAddress = async (userId) => {
        try {

            const addresses = await getAddressByUserID(userId);

            // Lọc địa chỉ mặc định
            const defaultAddr = addresses.find(address => address.isDefault === true);

            if (defaultAddr) {
                setDefaultAddress(defaultAddr); // Lưu địa chỉ mặc định vào state
            } else {
                setDefaultAddress(''); // Không tìm thấy địa chỉ mặc định
                message.warning('Người dùng không có địa chỉ mặc định.');
            }

            console.log(defaultAddr); // Hiển thị địa chỉ mặc định trong console

        } catch (error) {
            if (error.response && error.response.data) {
                const errorMessage = error.response.data.message || 'Đã xảy ra lỗi';
                message.error(errorMessage);
                setDefaultAddress('');
            } else {
                console.error('Error fetching address', error);
                message.error('Đã xảy ra lỗi khi lấy địa chỉ');
            }
        }
    };




    const handleChooseUser = () => {
        const values = form.getFieldValue();
        const selectedUser = Users.find(user => user._id === values.userId);
        setonUserSelect(selectedUser);
        message.success(`Đã chọn người dùng: ${selectedUser.username}`);
        handleAddress(selectedUser._id);

    }

    const handleProductChange = (values) => {
        setSelectedProducts(values);
        const newQuantities = { ...quantities };
        const newVariants = { ...variants };
        const newPrices = { ...productPrices };

        values.forEach(value => {
            const product = products.find(p => p._id === value); // Tìm sản phẩm
            if (!newQuantities[value]) {
                newQuantities[value] = 1; // Khởi tạo số lượng mặc định là 1
            }
            if (!newVariants[value]) {
                newVariants[value] = null; // Khởi tạo biến thể mặc định là null
            }
            if (!newPrices[value]) {
                newPrices[value] = product.price; // Lưu giá sản phẩm
            }
        });

        setQuantities(newQuantities);
        setVariants(newVariants);
        setProductPrices(newPrices);
    };
    const handleVariantChange = (productId, selectedVariantId) => {
        const product = products.find(p => p._id === productId); // Tìm sản phẩm đã chọn
        const variant = product.variants.find(v => v._id === selectedVariantId); // Tìm biến thể đã chọn
        setVariants(prevVariants => ({ ...prevVariants, [productId]: variant })); // Lưu toàn bộ đối tượng biến thể
        console.log(variants);
        setProductPrices(prevPrices => ({ ...prevPrices, [productId]: variant.price }));

    };

    const handleQuantityChange = (productId, value) => {
        setQuantities({ ...quantities, [productId]: value });
    };

    const handleSubmit = () => {

        const orderItems = selectedProducts.map(productId => ({
            productId,
            variant: variants[productId], // Lưu toàn bộ đối tượng biến thể
            quantity: quantities[productId],
            totalPrice: (quantities[productId] || 1) * (productPrices[productId] || 0), // Tính giá tổng cho sản phẩm
        }));

        const totalAmount = orderItems.reduce((total, item) => total + item.totalPrice, 0);
        setTotalAmount(totalAmount);
        console.log('Sản phẩm đã chọn:', orderItems);
        // Xử lý gửi dữ liệu orderItems

    };

    const handleChangePayment = (paymentId) => {
        const payment = payments.find(p => p._id === paymentId);
        setSelectedPayment(payment);
        console.log(selectedPayment);


    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const create_Order = async()=>{
        try {
            const data = {
                user_id: onUserSelect?._id, // Sử dụng toán tử tùy chọn để tránh lỗi nếu onUserSelect không tồn tại
                shipping_method_id: selectedShipping?._id, // Kiểm tra nếu selectedShipping tồn tại
                payment_method_id: selectedPayment?._id, // Kiểm tra nếu selectedPayment tồn tại
                address_id: defaultAddress?._id, // Kiểm tra nếu defaultAddress tồn tại
                items: selectedProducts.map(productId => ({
                    product_id: productId,
                    size: variants[productId]?.size, // Lấy size từ biến thể
                    color: variants[productId]?.color, // Lấy color từ biến thể
                    quantity: quantities[productId], // Số lượng
                    price: productPrices[productId], // Giá sản phẩm
                })),
            };
    
            // Gọi API để tạo đơn hàng
            const response = await createOrder(data);
            
            // Giả sử bạn đã có hàm API để tạo đơn hàng

          
        
            // Gọi hàm onCreate để truyền dữ liệu đơn hàng mới về OrderManager
            onCreate(response.data); // Gọi hàm đã truyền từ OrderManager
    
           
                message.success('Đơn hàng đã được tạo thành công!');
                // Cập nhật danh sách đơn hàng sau khi tạo thành công
            
        } catch (error) {
            console.error('Error creating order', error);
            message.error('Đã xảy ra lỗi khi tạo đơn hàng');
        }
    }




    return (
        <Modal
            visible={isVisitable}
            onCancel={onCancle}
            footer={null}
            width={'80%'}

        >
            <Form
                form={form}
                layout="vertical"
                
                initialValues={{ status: 'pending' }} // Giá trị mặc định cho trạng thái đơn hàng
            >
                <Form.Item
                    name="userId"
                    label="Chọn người dùng"
                    rules={[{ required: true, message: 'Vui lòng chọn người dùng!' }]}
                >
                    <Select
                        placeholder="Chọn người dùng"
                        loading={loading}
                        showSearch // Bật tính năng tìm kiếm
                        filterOption={(input, option) => {
                            // Lấy giá trị username và email từ option
                            const username = option.children[0]; // username
                            const email = option.children[1]; // email
                            // Kiểm tra nếu bất kỳ giá trị nào chứa đầu vào tìm kiếm
                            return (
                                username.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                                email.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            );
                        }}
                    >
                        {Users.map(user => (
                            <Option key={user._id} value={user._id}>
                                {user.username} --- {user.email}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {defaultAddress ? (
                    <div style={{
                        border: '1px solid green',
                        borderRadius: '5px', // Làm tròn các góc
                        padding: '15px', // Khoảng cách giữa nội dung và viền
                        margin: '10px 0', // Khoảng cách giữa các phần tử
                        backgroundColor: '#f9f9f9', // Màu nền nhẹ
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' // Đổ bóng cho viền
                    }}>
                        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Tên người nhận: {defaultAddress.recipientName}</p>
                        <p style={{ fontSize: '14px', margin: '5px 0' }}>SDT người nhận: {defaultAddress.recipientPhone}</p>
                        <p style={{ fontSize: '14px', margin: '5px 0' }}>
                            Địa chỉ: {defaultAddress.addressDetail.street}, {defaultAddress.addressDetail.ward}, {defaultAddress.addressDetail.district}, {defaultAddress.addressDetail.city}
                        </p>
                        <p style={{ fontSize: '14px', margin: '5px 0', fontStyle: 'italic' }}>Ghi chú: {defaultAddress.notes}</p>
                    </div>
                ) : (
                    <div>
                        <h4>Không có địa chỉ</h4>
                    </div>
                )}

                <Form.Item>
                    <Button onClick={handleChooseUser} type="primary" >
                        Xác nhận
                    </Button>
                </Form.Item>

                {/* chọn sản phẩm*/}
                <Form.Item label="Chọn sản phẩm">
                    <Select
                        mode="multiple" // Cho phép chọn nhiều sản phẩm
                        placeholder="Chọn sản phẩm"
                        onChange={handleProductChange}
                        dropdownStyle={{ maxHeight: '300px' }}


                    >
                        {products.map(product => (
                            <Option
                                style={{ display: 'flex', alignItems: 'center' }}
                                key={product._id} value={product._id}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>

                                    <img
                                        src={product.imageUrls[0]} // Đảm bảo rằng variant có thuộc tính imageUrl

                                        style={{ width: '30px', height: '30px', marginRight: '10px' }} // Điều chỉnh kích thước theo ý muốn
                                    />
                                    <h4>{product.name}</h4>

                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Nhập số lượng và chọn biến thể cho từng sản phẩm đã chọn */}
                {selectedProducts.map(productId => {
                    const product = products.find(p => p._id === productId);
                    const totalPrice = (quantities[productId] || 1) * (productPrices[productId] || 0); // Tính giá tổng
                    return (
                        <div key={productId} style={{ marginBottom: '20px' }}>
                            <h4>{product.name}</h4>
                            <img
                                src={product.imageUrls[0]} // Đảm bảo rằng variant có thuộc tính imageUrl

                                style={{ width: '30px', height: '30px', marginRight: '10px' }} // Điều chỉnh kích thước theo ý muốn
                            />
                            <Form.Item label="Chọn biến thể">
                                <Select
                                    placeholder="Chọn biến thể"
                                    onChange={(variantId) => handleVariantChange(productId, variantId)}
                                >
                                    {product.variants.map(variant => (
                                        <Option key={variant._id} value={variant._id}>

                                            {variant.size} - {variant.color}  {/* Hiển thị tên biến thể */}
                                            -<span>Số lượng còn lại : {variant.quantity}</span>
                                            -<span>giá : {variant.price}</span>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Số lượng">
                                <InputNumber
                                    min={1}
                                    value={quantities[productId]}
                                    onChange={(value) => handleQuantityChange(productId, value)}
                                />
                                <p>Giá tổng: {totalPrice} VNĐ</p> {/* Hiển thị giá tổng */}
                            </Form.Item>
                        </div>
                    );
                })}


                <Form.Item>
                    <Button type="primary" onClick={handleSubmit}>
                        Xác nhận
                    </Button>
                </Form.Item>

                <Form.Item
                    name="orderCode"
                    label="phương thức thanh toán"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                >
                    <Select
                        // Cho phép chọn nhiều sản phẩm
                        placeholder="Chọn phương thức thanh toán"
                        onChange={handleChangePayment}
                        dropdownStyle={{ maxHeight: '300px' }}


                    >
                        {payments.map(payment => (
                            <Option
                                style={{ display: 'flex', alignItems: 'center' }}
                                key={payment._id} value={payment._id}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>

                                    <h4>{payment.name}</h4>

                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="shippingMethod"
                    label="Bên ship hàng"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức shipping' }]}
                >
                    <Select
                        // Cho phép chọn nhiều sản phẩm
                        placeholder="Chọn phương thức shipping"
                        onChange={handleChangePayment}
                        dropdownStyle={{ maxHeight: '300px' }}


                    >
                        {Shippngs.map(payment => (
                            <Option
                                style={{ display: 'flex', alignItems: 'center' }}
                                key={payment._id} value={payment._id}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>

                                    <h4>{payment.name}</h4>

                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item>
                    <p style={{ color: '#28a745', fontWeight: 'bold', fontSize:'20px' }}>Tổng tiền: {formatCurrency(totalAmount)}</p>
                </Form.Item>





                <Form.Item>
                    <Button onClick={create_Order} type="primary" htmlType="submit" loading={loading}>
                        Tạo đơn hàng
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateOrderForm;
