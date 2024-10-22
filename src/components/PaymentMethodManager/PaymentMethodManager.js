import React, { useEffect, useState } from 'react';
import { getAllPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../../services/PaymentMethodServices';
import { Button, Table, Modal, Input, notification } from 'antd';
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
                // Update existing method
                await updatePaymentMethod(selectedMethod._id, selectedMethod);
                notification.success({ message: 'Cập nhật phương thức thanh toán thành công.' });
            } else {
                // Add new method
                await addPaymentMethod(selectedMethod);
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
            <br></br>
            <Button type="primary" onClick={() => { setSelectedMethod(null); setIsModalVisible(true); }}>Thêm </Button>
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
            </Modal>
        </div>
    );
};

export default PaymentMethodManager;
