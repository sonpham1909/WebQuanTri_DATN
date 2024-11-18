import React, { useCallback, useEffect, useState } from 'react';
import { addRole, addUser, deleteRole, deleteUser, getAllUsers, searchUsers, updateUser } from '../../services/UserService';
import { Button, Table, Modal, Avatar, Popconfirm, Alert, message, Form, Select, Input, Tag } from 'antd';
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
    const [roleSelected, setroleSelected] = useState(null);
    const [isVisitableRole, setisVisitableRole] = useState(false);
    const [roledel, setRoledel] = useState('');
    const [roleSearch, setRoleSearch] = useState('');

    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const onChange = (pagination) => {
        setCurrentPage(pagination.current); // Cập nhật trang hiện tại
    };

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

    const fetchUsersSearch = async (searchText) => {
        try {
            const data = await searchUsers(searchText,roleSearch);

            setUserSearch(data); // Lưu dữ liệu tìm kiếm vào state
            // Log dữ liệu tìm kiếm
        } catch (error) {
            console.error('Failed to fetch search users', error);
        } finally {
            setLoading(false);
        }

    };

    //handDle row

    const HandleRole = (user) => {
        setroleSelected(user.roles);
        setid(user._id);
        setisVisitableRole(true);



    }

    const handlecCancleRole = () => {
        setid('');
        setisVisitableRole(false);
        setroleSelected(null);
    }




    useEffect(() => {

        if (roleSearch) {
            fetchUsersSearch(searchText); // Call search function when role is selected
        } else {
            fetchUsers(); // Fetch all users when no role is selected
        }
    }, [roleSearch]);

    const handleRowClick2 = (record) => {
        setSelectedUser(record); // Lưu thông tin người dùng được chọn
        setIsModalVisibleDel(true); // Hiển thị modal
    };


    const debouncedFetchUsersSearch = useCallback(debounce(fetchUsersSearch, 1000), []);

    //check user có đc chọn ko


    // Hàm xử lý xóa người dùng
    const handleDelete = async () => {
        try {
            console.log("role:",roledel);
            
            await deleteRole(id,roledel); // Gọi API để xóa người dùng
            message.success('Xóa người dùng thành công');
            // Cập nhật lại danh sách người dùng sau khi xóa
            fetchUsers();
            setid('');
            setRoledel('');
            setisVisitableRole(false);
            fetchUsersSearch(searchText);
            setIsModalVisibleDel(false);
        } catch (error) {
            message.error('Xóa người dùng thất bại');
        }
    };

    const confirmDelete = () => {
        handleDelete();

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
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles) => (
                <>
                    {roles.map((role) => {
                        let color = role === 'admin' ? 'red' : 'green'; // Admin: đỏ, User: xanh
                        return (
                            <Tag color={color} key={role}>
                                {role.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <div style={{ display: 'flex' }}>
                    <Button type="primary" onClick={() => handleRowClick(record)} style={{ marginRight: '10px' }}>
                        Chi tiết
                    </Button>
                    <Button type="primary" onClick={() => HandleRole(record)} style={{ marginRight: '10px', background: 'orange' }}>
                        Role
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
                    {/* 
                    <Button type="danger"  onClick={() => {
                        setIsModalVisibleDel(true);
                        setid(record._id);
                    }}>Xóa</Button> */}
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
            statusU: record.block
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

    const handleAddRole = async (values) => {
        try {
            console.log('Form values:', values); 
            console.log('Role to add:', values.roleA); 
            // Gọi API để thêm người dùng mới
            const userAdd = {
               role:'admin'
            }
            await addRole(id,{role:values.roleA});
            message.success('Thêm role mới thành công');
            setid('');
            fetchUsers();
            setisVisitableRole(false);
            fetchUsers();
            form.resetFields(); // Reset form sau khi thêm thành công
        } catch (error) {
            message.error('Thêm người dùng thất bại');
        }
    };

    //xóa role
    const handleDelRole = (role) =>{
        setIsModalVisibleDel(true);
        setRoledel(role);

    }


    const handleUpdate = async (values) => {
        try {

            const userUpdate = {
                username: values.usernameU,

                email: values.emailU,
                phone_number: values.phone_numberU,
                full_name: values.full_nameU,
                block: values.statusU
            }
            console.log(userUpdate); // Log to verify the values before API request


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
                onChange={(value) => {
                    setRoleSearch(value); // Set roleSearch based on the selection
                    if (value === "") {
                        fetchUsers(); // Fetch all users immediately when "Tất cả" is selected
                    }
                }}
            >
                <Option value="">Tất cả</Option>
                <Option value="admin">Admin</Option>
                <Option value="user">User</Option>
            </Select>
            <div className="headerPage">
                <h3 className="titlepage">Quản lý người dùng</h3>
                <p>Tổng: {userSearch && userSearch.length > 0 && searchText !== '' ? userSearch.length : users.length} người dùng</p>

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
                                label="Trạng thái"
                                name="statusU"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    <Option value={true}>khóa Tài Khoản</Option>
                                    <Option value={false}>Đang hoạt động</Option>
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



            <FormDel isVisible={isModalVisibleDel} onclickCan={handleCancledel} onclickDel={() => handleDelete()} />
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

                  

                    <Form.Item>
                        <Button type="primary" htmlType="submit" onClick={() => handleSubmit(form.getFieldsValue())} >
                            Thêm
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                visible={isVisitableRole}
                onCancel={handlecCancleRole}
                footer={null}
            >

                <div>
                <Form form={form}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                       
                            <Form.Item
                                label="Role"
                                name="roleA"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                            ><Select placeholder="Chọn vai trò muốn thêm">
                                    <Option value={'admin'}>Admin</Option>
                                    <Option value={'user'}>User</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button style={{width:50}} type="primary" htmlType="submit" onClick={() => handleAddRole(form.getFieldsValue())} >
                                    Thêm
                                </Button>
                            </Form.Item>
               



                    </div>
                    </Form>

                    {
                        roleSelected && roleSelected.length > 0 ? (
                            roleSelected.map((role) => {
                                let color = role === 'admin' ? 'red' : 'green'; // Admin: đỏ, User: xanh
                                return (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Tag style={{ width: 150, margin: 10 }} color={color} key={role}>
                                            {role.toUpperCase()}
                                        </Tag>

                                        <Button onClick={()=>handleDelRole(role)} style={{ width: 50 }}>xóa</Button>
                                    </div>
                                );
                            })
                        ) : (
                            <Tag color="gray" key="no-role">
                                NO ROLES
                            </Tag>
                        )
                    }
                </div>



            </Modal>



        </div>
    );
};

export default Usermanager;
