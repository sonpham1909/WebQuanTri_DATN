import React, { useCallback, useEffect, useState } from 'react';
import { addUser, deleteUser, getAllUsers, searchUsers, updateUser } from '../../services/UserService';
import { Button, Table, Modal, Avatar, Popconfirm, Alert, message, Form, Select, Input } from 'antd';
import './index.css';
import LoadingCo from '../loading/loading';
import FormDel from '../ActionForms/FormDel';
import { Option } from 'antd/es/mentions';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from '@mui/material';

const Usermanager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null); // Để lưu thông tin người dùng được chọn
    const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị modal
    const [isModalVisibleDel, setIsModalVisibleDel] = useState(false);
    const [id, setid] = useState('');
    const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
    const [form] = Form.useForm();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [searchText, setsearchText] = useState('');
    const [userSearch, setUserSearch] = useState(null);
    const [roleFilter, setRoleFilter] = useState('');

    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const onChange = (pagination) => {
        setCurrentPage(pagination.current); // Cập nhật trang hiện tại
    };

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            const filteredUsers = data.filter(user => {
                if (roleFilter === '') return true; // Không lọc, trả về tất cả người dùng
                if (roleFilter === 'admin' ) return user.admin === true;
                return user.admin === false;
                 // Lọc theo vai trò
            });
            setUsers(filteredUsers);
            
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersSearch = async (searchText) => {
        try {
            const data = await searchUsers(searchText);
            const filteredUsers = data.filter(user => {
                if (roleFilter === '') return true; // Không lọc, trả về tất cả người dùng
                if (roleFilter === 'admin' ) return user.admin === true;
                return user.admin === false;
                 // Lọc theo vai trò
            });
            setUserSearch(filteredUsers); // Lưu dữ liệu tìm kiếm vào state
            // Log dữ liệu tìm kiếm
        } catch (error) {
            console.error('Failed to fetch search users', error);
        } finally {
            setLoading(false);
        }

    };




    useEffect(() => {

        fetchUsers();
    }, [roleFilter]);

    const handleRowClick2 = (record) => {
        setSelectedUser(record); // Lưu thông tin người dùng được chọn
        setIsModalVisibleDel(true); // Hiển thị modal
    };


    const debouncedFetchUsersSearch = useCallback(debounce(fetchUsersSearch, 1000), []);

    //check user có đc chọn ko
    const checkSelectedUser = (values) => {
        // Kiểm tra xem có ngưvalời dùng được chọn không (nếu có thì đang cập nhật)
        if (selectedUser) {
            handleUpdate(values);  // Gọi hàm cập nhật
        } else {
            handleSubmit(values);  // Gọi hàm thêm người dùng
        }
    }

    // Hàm xử lý xóa người dùng
    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId); // Gọi API để xóa người dùng
            message.success('Xóa người dùng thành công');
            // Cập nhật lại danh sách người dùng sau khi xóa
            setUsers(users.filter(user => user._id !== userId));
            setid('');
            setIsModalVisibleDel(false);
        } catch (error) {
            message.error('Xóa người dùng thất bại');
        }
    };

    const confirmDelete = (userId) => {
        handleDelete(userId);

    };

    const handleCancledel = () => {
        setid('');
        setIsModalVisibleDel(false);

    }
    //them

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1, // Số thứ tự (index + 1)
        },
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
                    {/* <Popconfirm
                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => confirmDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ size:10 }}  // Đặt kích thước nhỏ cho nút "Yes"
                        cancelButtonProps={{ size: 20 }}  // Đặt kích thước nhỏ cho nút "No"
                    > */}

                    <Button type="danger" onClick={() => {
                        setIsModalVisibleDel(true);
                        setid(record._id);
                    }}>Xóa</Button>
                    {/* </Popconfirm> */}
                </div>
            ),
        }
    ];

    // Hàm xử lý khi click vào một hàng
    const handleRowClick = (record) => {
        setSelectedUser(record);
        form.setFieldsValue({
            usernameU: record.username,
            emailU: record.email,
            phone_numberU: record.phone_number,
            full_nameU: record.full_name,
            adminU: record.admin
        });// Lưu thông tin người dùng được chọn
        setIsModalVisible(true); // Hiển thị modal
    };

    const handleModalClose = () => {
        setSelectedUser(null);
        setIsModalVisible(false); // Đóng modal
    };

    const handleModalAddClose = () => {
        setIsModalVisibleAdd(false)
    }

    // Hàm xử lý submit form
    const handleSubmit = async (values) => {
        try {
            // Gọi API để thêm người dùng mới
            const userAdd = {
                username: values.username,
                password: values.password,
                email: values.email,
                phone_number: values.phone_number,
                full_name: values.full_name,
                admin: values.admin
            }
            await addUser(userAdd);
            message.success('Thêm người dùng mới thành công');
            setIsModalVisibleAdd(false);
            fetchUsers();
            form.resetFields(); // Reset form sau khi thêm thành công
        } catch (error) {
            message.error('Thêm người dùng thất bại');
        }
    };

    const handleUpdate = async (values) => {
        try {

            const userUpdate = {
                username: values.usernameU,

                email: values.emailU,
                phone_number: values.phone_numberU,
                full_name: values.full_nameU,
                admin: values.adminU
            }

            await updateUser(selectedUser._id, userUpdate);
            message.success('Cập nhật người dùng thành công');
            setIsModalVisible(false);
            fetchUsers();
            setSelectedUser(null);
            form.resetFields();
        } catch (error) {
            message.error('Cập nhật thất bại');
        }
    }
    // useEffect(() => {
    //     // Fetch users whenever roleFilter or searchText changes
    //     if (searchText) {
    //         fetchUsersSearch(searchText);
    //     } else {
    //         fetchUsers();
    //     }
    // }, [roleFilter, searchText]);
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();  // Chuyển text thành chữ thường
        setsearchText(value);
        debouncedFetchUsersSearch(value);
    }

    if (loading) {
        return <LoadingCo />;
    }

    return (
        <div className="container">
            <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchText}
                onChange={handleSearch}

                prefix={<SearchOutlined />}
                style={{ marginBottom: 16, width: 300 }}
            />
            <Select
                placeholder="Chọn vai trò"
                style={{ marginBottom: 16, width: 200 }}
                onChange={(value) => setRoleFilter(value)}
            >
                <Option value="">Tất cả</Option>
                <Option value="admin">Admin</Option>
                <Option value="user">User</Option>
            </Select>
            <div className="headerPage">
                <h3 className="titlepage">Quản lý người dùng</h3>
                <p>Tổng: {userSearch && userSearch.length > 0 ? userSearch.length : users.length} người dùng</p>

                <Button className="buttonAdd" onClick={() => setIsModalVisibleAdd(true)}>Thêm người dùng mới</Button>
            </div>

            <div className="boxtable">
                <Table
                    className="table"
                    dataSource={userSearch && userSearch.length > 0 ? userSearch : users} // Nếu có kết quả tìm kiếm thì hiển thị, nếu không thì hiển thị tất cả
                    columns={columns}
                    rowKey="_id"
                    pagination={{
                        pageSize,
                        current: currentPage,
                        onChange: (page) => setCurrentPage(page),
                    }}
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Avatar src={selectedUser.avatar} alt="User Avatar" style={{ width: 70, height: 70 }} />
                            <p><strong>User id:</strong> {selectedUser._id}</p>

                        </div>
                        <Form
                            form={form}
                            layout="vertical"

                        >
                            <Form.Item
                                label="Username"
                                name="usernameU"
                                rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}

                            >
                                <Input />
                            </Form.Item>




                            <Form.Item
                                label="Email"
                                name="emailU"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Số điện thoại"
                                name="phone_numberU"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Họ và tên"
                                name="full_nameU"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên người dùng' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Role"
                                name="adminU"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    <Option value={true}>Admin</Option>
                                    <Option value={false}>User</Option>
                                </Select>
                            </Form.Item>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p><strong>Created at:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                                <p><strong>Updated at:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}</p>

                            </div>


                            <Form.Item style={{ textAlign: 'center' }}>
                                <Button type="primary" htmlType="submit" onClick={() => handleUpdate(form.getFieldsValue())} >
                                    Cập nhật
                                </Button>
                            </Form.Item>


                        </Form>

                        {/* Định dạng ngày tháng nếu có trường createdAt và updatedAt */}

                    </div>
                )}
            </Modal>



            <FormDel isVisible={isModalVisibleDel} onclickCan={handleCancledel} onclickDel={() => handleDelete(id)} />
            {/* <FormDel isVisible={isModalVisibleDel} onclickCan={()=>{setIsModalVisibleDel(false)}} onclickDel={confirmDelete(id)}/> */}

            {/*Thêm người dùng mới */}

            <Modal
                title="Thêm người dùng mới"
                visible={isModalVisibleAdd}
                onCancel={handleModalAddClose}
                footer={null} // Để tự thêm nút submit vào Form
            >
                <Form
                    form={form}
                    layout="vertical"


                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
                    >
                        <Input />
                    </Form.Item>


                    <Form.Item
                        label="mật khẩu"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone_number"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Họ và tên"
                        name="full_name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên người dùng' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Role"
                        name="admin"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select placeholder="Chọn vai trò">
                            <Option value={true}>Admin</Option>
                            <Option value={false}>User</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" onClick={() => handleSubmit(form.getFieldsValue())} >
                            Thêm
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>


        </div>
    );
};

export default Usermanager;
