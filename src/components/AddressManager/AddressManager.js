import React, { useCallback, useEffect, useState } from 'react';
import { getAllUsers } from '../../services/UserService';
import { Button, Table, Modal, Input, Form, List, notification } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from '@mui/material';
import LoadingCo from '../loading/loading';
import { getAllAddresses, addAddress, deleteAddress, updateAddress } from '../../services/AddressServices';

const AddressManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddAddressModalVisible, setIsAddAddressModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [userSearch, setUserSearch] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [addresses, setAddresses] = useState([]);
    const [allAddresses, setAllAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({ city: '', district: '', ward: '', street: '', notes: '' });
    const [editAddressIndex, setEditAddressIndex] = useState(null);

const fetchUsers = async () => {
    try {
        const data = await getAllUsers();
        // Filter users who have "user" in their roles array
        const filteredUsers = data.filter(user => user.roles.includes("user"));
        setUsers(filteredUsers);
    } catch (error) {
        console.error('Failed to fetch users', error);
        notification.error({ message: 'Không thể tải danh sách người dùng. Vui lòng thử lại.' });
    } finally {
        setLoading(false);
    }
};


    const fetchAddresses = async () => {
        try {
            const data = await getAllAddresses();
            setAllAddresses(data);
        } catch (error) {
            console.error('Failed to fetch addresses', error);
            notification.error({ message: 'Không thể tải danh sách địa chỉ. Vui lòng thử lại.' });
        }
    };

    const fetchUsersSearch = async (searchText) => {
        try {
            const data = await getAllUsers();
            const filteredUsers = data.filter(user => user.full_name.toLowerCase().includes(searchText));
            setUserSearch(filteredUsers);
        } catch (error) {
            console.error('Failed to fetch users', error);
            notification.error({ message: 'Không thể tìm kiếm người dùng. Vui lòng thử lại.' });
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchAddresses();
    }, []);

    const debouncedFetchUsersSearch = useCallback(debounce(fetchUsersSearch, 1000), []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        debouncedFetchUsersSearch(value);
    };

    const handleRowClick = async (record) => {
        setSelectedUser(record);
        const userAddresses = allAddresses.filter(address => address.id_user === record._id);
        setAddresses(userAddresses);

        form.setFieldsValue({
            full_name: record.full_name,
            phone_number: record.phone_number
        });

        setIsModalVisible(true);
    };

    const handleModalClose = async () => {
        setSelectedUser(null);
        setIsModalVisible(false);
        setAddresses([]);
        await fetchAddresses(); // Cập nhật danh sách địa chỉ khi modal được đóng
    };

    const handleAddAddressModalClose = () => {
        setIsAddAddressModalVisible(false);
        setNewAddress({ city: '', district: '', ward: '', street: '', notes: '' });
        setEditAddressIndex(null);
    };

    const handleAddAddress = async () => {
        const hasAddresses = addresses.length > 0;
    
        if (!newAddress.full_name || !newAddress.city || !newAddress.district || !newAddress.ward || !newAddress.street||!newAddress.phone) {
            notification.error({ message: 'Tất cả các trường bắt buộc phải được điền đầy đủ.' });
            return;
        }
     // Kiểm tra hợp lệ số điện thoại
     if (!/^\d{10,}$/.test(newAddress.phone)) {
        notification.error({ message: 'Số điện thoại phải là số và có ít nhất 10 chữ số.' });
        return;
    }
    
        const addressData = {
            addressDetail: {
                street: newAddress.street,
                ward: newAddress.ward,
                district: newAddress.district,
                city: newAddress.city,
            },
            recipientName: newAddress.full_name,
            recipientPhone: newAddress.phone,  // Số điện thoại mới
            notes: newAddress.notes,
            isDefault: !hasAddresses,
            id_user: selectedUser._id,
        };
    
        try {
            if (editAddressIndex !== null) {
                const addressId = addresses[editAddressIndex]._id;
                await updateAddress(addressId, addressData);
                const updatedAddresses = [...addresses];
                updatedAddresses[editAddressIndex] = { ...updatedAddresses[editAddressIndex], ...addressData };
                setAddresses(updatedAddresses);
                notification.success({ message: 'Cập nhật địa chỉ thành công!' });
            } else {
                const result = await addAddress(addressData);
                setAddresses([...addresses, result]);
                notification.success({ message: 'Thêm địa chỉ thành công!' });
            }
    
            handleAddAddressModalClose();
        } catch (error) {
            console.error("Failed to add/update address", error);
            notification.error({ message: editAddressIndex !== null ? 'Cập nhật địa chỉ không thành công' : 'Thêm địa chỉ không thành công' });
        }
    };
   
    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Họ và tên',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone_number',
            key: 'phone_number',
        },
        {
            title: 'Địa chỉ mặc định',
            key: 'default_address',
            render: (text, record) => {
                const defaultAddress = allAddresses.find(addr => addr.id_user === record._id && addr.isDefault);
                return defaultAddress
                    ? `${defaultAddress.addressDetail.street}, ${defaultAddress.addressDetail.ward}, ${defaultAddress.addressDetail.district}, ${defaultAddress.addressDetail.city}`
                    : 'Chưa chọn địa chỉ';
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (text, record) => (
                <Button type="primary" onClick={() => handleRowClick(record)} style={{ marginRight: '10px' }}>
                    Xem địa chỉ
                </Button>
            ),
        },
    ];

    return (
        <div>
            {loading && <LoadingCo />}
            <Input
                placeholder="Tìm kiếm người dùng"
                value={searchText}
                onChange={handleSearch}
                prefix={<SearchOutlined />}
                style={{ marginBottom: '20px', width: '300px' }}
            />
               <h3 className="titlepage">Quản lý địa chỉ</h3>
            <Table
                columns={columns}
                dataSource={searchText ? userSearch : users}
                rowKey="_id"
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                })}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    onChange: (page) => setCurrentPage(page),
                }}
            />
            <Modal
                visible={isModalVisible}
                title={`Địa chỉ của ${selectedUser?.full_name}`}
                onCancel={handleModalClose}
                footer={[
                   
                ]}
                width={800}
            >
                {addresses.length > 0 ? (
                    <>
                        <List
                            itemLayout="horizontal"
                            dataSource={addresses}
                            renderItem={(item, index) => (
                                <List.Item
                                >
                                    <div>
                                        <p><strong>Họ và Tên: </strong> {item.recipientName}</p>
                                        <p><strong>Số điện thoại: </strong> {item.recipientPhone}</p>
                                        <p><strong>Địa chỉ: </strong>{`${item.addressDetail.street}, ${item.addressDetail.ward}, ${item.addressDetail.district}, ${item.addressDetail.city}`}</p>
                                        {item.notes && <div><strong>Ghi chú: </strong> {item.notes}</div>}
                                        {item.isDefault && <div><strong>(Địa chỉ mặc định)</strong></div>}
                                    </div>
                                </List.Item>
                            )}
                        />
                    </>
                ) : (
                    <p>Chưa có địa chỉ nào.</p>
                )}
            </Modal>

          
        </div>
    );
};

export default AddressManager;
