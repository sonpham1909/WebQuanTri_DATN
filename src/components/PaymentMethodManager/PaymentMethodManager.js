import React, { useEffect, useState } from 'react';
import { getAllPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../../services/PaymentMethodServices';
import { Button, Table, Modal, Input, notification, Upload } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import LoadingCo from '../loading/loading';

const PaymentMethodManager = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filteredMethods, setFilteredMethods] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Fetch all payment methods
    const fetchPaymentMethods = async () => {
        setLoading(true);
        try {
            const data = await getAllPaymentMethods();
            setPaymentMethods(data);
            setFilteredMethods(data);
        } catch (error) {
            console.error('Failed to fetch payment methods', error);
            notification.error({ message: 'Không thể tải danh sách phương thức thanh toán. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        const filtered = paymentMethods.filter(method => method.name.toLowerCase().includes(value));
        setFilteredMethods(filtered);
    };

    const handleRowClick = (record) => {
        setSelectedMethod(record);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setSelectedMethod(null);
        setIsModalVisible(false);
    };

    const handleSave = async () => {
        try {
            if (selectedMethod?._id) {
                // Update payment method
                await updatePaymentMethod(selectedMethod._id, {
                    name: selectedMethod.name,
                    description: selectedMethod.description,
                    image: selectedMethod.image,
                });
                notification.success({ message: 'Cập nhật phương thức thanh toán thành công.' });
            } else {
                // Add new payment method
                await addPaymentMethod({
                    name: selectedMethod.name,
                    description: selectedMethod.description,
                    image: selectedMethod.image,
                });
                notification.success({ message: 'Thêm phương thức thanh toán thành công.' });
            }
            fetchPaymentMethods(); // Refresh the list
            handleModalClose();
        } catch (error) {
            console.error('Failed to save payment method', error);
            notification.error({ message: 'Lỗi khi lưu phương thức thanh toán. Vui lòng thử lại.' });
        }
    };
    
    const confirmDelete = (id) => {
        Modal.confirm({
            title: 'Xóa phương thức thanh toán',
            content: 'Bạn có chắc chắn muốn xóa phương thức thanh toán này?',
            okText: 'Có',
            okType: 'danger',
            cancelText: 'Không',
            onOk: async () => {
                try {
                    await deletePaymentMethod(id);
                    notification.success({ message: 'Xóa phương thức thanh toán thành công.' });
                    fetchPaymentMethods(); // Refresh the list
                } catch (error) {
                    console.error('Failed to delete payment method', error);
                    notification.error({ message: 'Lỗi khi xóa phương thức thanh toán. Vui lòng thử lại.' });
                }
            },
        });
    };

    const handleImageUpload = (file) => {
        if (file && file instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedMethod((prev) => ({
                    ...prev,
                    image: reader.result, // Store the base64 image
                }));
            };
            reader.readAsDataURL(file);
        }
        return false; // Prevent automatic upload
    };
    
    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Tên phương thức thanh toán',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <img
                    src={image}
                    alt="payment method"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <>
                    <Button onClick={() => handleRowClick(record)}>Sửa</Button>
                    <Button danger onClick={() => confirmDelete(record._id)}>Xóa</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            {loading && <LoadingCo />}
            <Input
                placeholder="Tìm kiếm phương thức thanh toán"
                value={searchText}
                onChange={handleSearch}
                prefix={<SearchOutlined />}
                style={{ marginBottom: '20px', width: '300px' }}
            />
            <br />
            <Button type="primary" onClick={() => { setSelectedMethod(null); setIsModalVisible(true); }}>Thêm</Button>
            <h3 className="titlepage">Quản lý phương thức thanh toán</h3>
            <Table
                columns={columns}
                dataSource={filteredMethods}
                rowKey="_id"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    onChange: (page) => setCurrentPage(page),
                }}
            />
            <Modal
                title={selectedMethod ? 'Cập nhật phương thức thanh toán' : 'Thêm phương thức thanh toán'}
                visible={isModalVisible}
                onCancel={handleModalClose}
                onOk={handleSave}
            >
                <Input
                    placeholder="Tên phương thức thanh toán"
                    value={selectedMethod?.name || ''}
                    onChange={(e) => setSelectedMethod({ ...selectedMethod, name: e.target.value })}
                    style={{ marginBottom: '10px' }}
                />
                <Input
                    placeholder="Mô tả"
                    value={selectedMethod?.description || ''}
                    onChange={(e) => setSelectedMethod({ ...selectedMethod, description: e.target.value })}
                />
                <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handleImageUpload}
                >
                    <Button>Chọn ảnh</Button>
                </Upload>

                {selectedMethod?.image && (
                    <div style={{ marginTop: '10px' }}>
                        <img
                            src={selectedMethod.image}
                            alt="payment method"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PaymentMethodManager;