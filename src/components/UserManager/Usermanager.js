import React, { useEffect, useState } from 'react';
import { deleteUser, getAllUsers } from '../../services/UserService';
import { Button, Table, Modal, Avatar, Popconfirm, Alert, message } from 'antd';
import './index.css';
import LoadingCo from '../loading/loading';

const Usermanager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null); // Để lưu thông tin người dùng được chọn
    const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị modal
    const [isModalVisibleDel, setIsModalVisibleDel] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleRowClick2 = (record) => {
        setSelectedUser(record); // Lưu thông tin người dùng được chọn
        setIsModalVisibleDel(true); // Hiển thị modal
    };

    // Hàm xử lý xóa người dùng
    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId); // Gọi API để xóa người dùng
            message.success('Xóa người dùng thành công');
            // Cập nhật lại danh sách người dùng sau khi xóa
            setUsers(users.filter(user => user._id !== userId));
        } catch (error) {
            message.error('Xóa người dùng thất bại');
        }
    };

    const confirmDelete = (userId) => {
        handleDelete(userId);
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone_number',
            key: 'phone_number',
        },
        {
            title: 'Role',
            dataIndex: 'admin',
            key: 'admin',
            render: (admin) => (admin ? 'Admin' : 'User'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <div>
                    <Button type="primary" onClick={() => handleRowClick(record)} style={{ marginRight: '10px' }}>
                        Chi tiết
                    </Button>
                    {/* Nút Xóa */}
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => confirmDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ size:10 }}  // Đặt kích thước nhỏ cho nút "Yes"
                        cancelButtonProps={{ size: 20 }}  // Đặt kích thước nhỏ cho nút "No"
                    >
                        <Button type="danger">Xóa</Button>
                    </Popconfirm>
                </div>
            ),
        }
    ];

    // Hàm xử lý khi click vào một hàng
    const handleRowClick = (record) => {
        setSelectedUser(record); // Lưu thông tin người dùng được chọn
        setIsModalVisible(true); // Hiển thị modal
    };

    const handleModalClose = () => {
        setIsModalVisible(false); // Đóng modal
    };

    if (loading) {
        return <LoadingCo />;
    }

    return (
        <div className="container">
            <div className="headerPage">
                <h3 className="titlepage">Quản lý người dùng</h3>
                
                <Button className="buttonAdd">Thêm người dùng mới</Button>
            </div>

            <div className="boxtable">
                <Table
                    className="table"
                    dataSource={users}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 5 }}
                    onRow={(record) => ({
                        onClick: () => handleRowClick2(record), // Gọi hàm khi click vào hàng
                    })}
                />
            </div>
            

            {/* Modal hiển thị chi tiết người dùng */}
            <Modal
                title="Chi tiết người dùng"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
            >
                {selectedUser && (
                    <div>
                        <Avatar src={selectedUser.avatar} alt="User Avatar" />
                        <p><strong>id:</strong> {selectedUser._id}</p>
                        <p><strong>Username:</strong> {selectedUser.username}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Số điện thoại:</strong> {selectedUser.phone_number}</p>
                        <p><strong>Role:</strong> {selectedUser.admin ? 'Admin' : 'User'}</p>
                        <p><strong>Full name:</strong> {selectedUser.full_name}</p>

                        {/* Định dạng ngày tháng nếu có trường createdAt và updatedAt */}
                        <p><strong>Created at:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                        <p><strong>Updated at:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Usermanager;
