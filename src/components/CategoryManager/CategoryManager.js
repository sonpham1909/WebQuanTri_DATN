import React, { useCallback, useEffect, useState } from 'react';
import { addCategory, deleteCategory, getAllCategories, searchCategories, updateCategory } from '../../services/Categoryservices';
import { Button, Table, Modal, message, Form, Input, Upload } from 'antd';
import LoadingCo from '../loading/loading';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import './Category.css';  

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleDel, setIsModalVisibleDel] = useState(false);
    const [id, setId] = useState('');
    const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [imgFile, setImgFile] = useState(null); // Thêm trạng thái để theo dõi hình ảnh đã chọn

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const result = await getAllCategories();
            setCategories(result);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback(
        debounce(async (searchTerm) => {
            if (searchTerm) {
                const result = await searchCategories(searchTerm);
                setCategories(result);
            } else {
                fetchCategories();
            }
        }, 300),
        []
    );

    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        handleSearch(value);
    };

    const showModalAdd = () => {
        setIsModalVisibleAdd(true);
        form.resetFields();
        setImgFile(null);
    };

    const showModalUpdate = (category) => {
        form.resetFields(); 
        setSelectedCategory(category);
        form.setFieldsValue({
            namecategory: category.namecategory,
            description: category.description,
            imgcategory: undefined, // Đặt lại trường imgcategory trong form
        });
        setImgFile(null); // Reset trạng thái hình ảnh
        setIsModalVisible(true);
    };

    const handleAddCategory = async (values) => {
        try {
            if (!values || !values.namecategory || !values.description || !values.imgcategory?.file) {
                throw new Error("Thông tin không đầy đủ");
            }

            const imgFile = values.imgcategory.file;
            const formData = new FormData();
            formData.append('namecategory', values.namecategory);
            formData.append('description', values.description);
            formData.append('imgcategory', imgFile);

            await addCategory(formData);
            message.success("Thêm danh mục thành công!");
            setIsModalVisibleAdd(false);
            fetchCategories();
        } catch (error) {
            console.error("Error while adding category:", error);
            message.error("Có lỗi xảy ra khi thêm danh mục: " + error.message);
        }
    };

    const handleUpdateCategory = async (values) => {
        try {
            const formData = new FormData();
            formData.append('namecategory', values.namecategory);
            formData.append('description', values.description);
    
            // Chỉ thêm hình ảnh nếu có file mới
            if (imgFile) {
                formData.append('imgcategory', imgFile);
            }
    
            await updateCategory(selectedCategory._id, formData);
            message.success("Cập nhật danh mục thành công!");
            setIsModalVisible(false);
            fetchCategories();
        } catch (error) {
            message.error("Có lỗi xảy ra khi cập nhật danh mục");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            message.success("Xóa danh mục thành công!");
            setIsModalVisibleDel(false);
            fetchCategories();
        } catch (error) {
            message.error("Có lỗi xảy ra khi xóa danh mục");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="container">
            {/* Hàng tìm kiếm */}
            <Input
                placeholder="Tìm kiếm danh mục"
                value={searchText}
                onChange={onSearchChange}
                prefix={<SearchOutlined />}
                className="inputSearch" 
            />
            
            {/* Hàng tiêu đề và tổng danh mục */}
            <div className="headerPage">
                <h2 className="titlepage">Quản lý danh mục</h2>
                <div className="headerActions">
                    <span className="totalCategories">Tổng danh mục: {categories.length}</span>
                    <Button className="buttonAdd" type="primary" onClick={showModalAdd}>Thêm danh mục</Button>
                </div>
            </div>
            
            {loading ? (
                <LoadingCo />
            ) : (
                <Table dataSource={categories} rowKey="_id" pagination={{ pageSize: 5 }}>
                    <Table.Column title="STT" render={(text, record, index) => index + 1} />
                    <Table.Column title="Tên danh mục" dataIndex="namecategory" />
                    <Table.Column title="Mô tả" dataIndex="description" />
                    <Table.Column
                        title="Hình ảnh"
                        dataIndex="imgcategory"
                        render={(text) => <img src={text} alt="Category" style={{ width: '50px' }} />}
                    />
                    <Table.Column
                        title="Thao tác"
                        render={(text, record) => (
                            <>
                                <Button onClick={() => showModalUpdate(record)}>Cập nhật</Button>
                                <Button danger onClick={() => { setId(record._id); setIsModalVisibleDel(true); }}>Xóa</Button>
                            </>
                        )}
                    />
                </Table>
            )}
            
            {/* Modal Thêm danh mục */}
            <Modal
                title="Thêm danh mục"
                visible={isModalVisibleAdd}
                onCancel={() => setIsModalVisibleAdd(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleAddCategory}>
                    <Form.Item name="namecategory" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="imgcategory" label="Hình ảnh" rules={[{ required: true, message: 'Vui lòng chọn hình ảnh!' }]}>
                        <Upload 
                            accept="image/*" 
                            beforeUpload={(file) => {
                                setImgFile(file); 
                                return false; // Ngăn chặn tự động tải lên
                            }} 
                            maxCount={1} // Chỉ cho phép chọn 1 ảnh
                        >
                            <Button icon={<UploadOutlined />}></Button>
                        </Upload>
                    </Form.Item>
                    
                    {/* Hiển thị hình ảnh đã chọn */}
                    {imgFile && (
                        <div style={{ marginTop: '10px' }}>
                            <img 
                                src={URL.createObjectURL(imgFile)} 
                                alt="Selected" 
                                style={{ width: '100px', marginBottom: '10px' }} 
                            />
                        </div>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit">Thêm danh mục</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Cập nhật danh mục */}
            <Modal
                title="Cập nhật danh mục"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleUpdateCategory}>
                    <Form.Item name="namecategory" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                        <Input.TextArea />
                    </Form.Item>
                    
                    {/* Hiển thị ảnh cũ hoặc ảnh mới */}
                    <Form.Item label="Hình ảnh">
                        {imgFile ? (
                            <img src={URL.createObjectURL(imgFile)} alt="New Category" style={{ width: '100px', marginBottom: '10px' }} />
                        ) : (
                            selectedCategory?.imgcategory && (
                                <img src={selectedCategory.imgcategory} alt="Old Category" style={{ width: '100px', marginBottom: '10px' }} />
                            )
                        )}
                    </Form.Item>

                    <Form.Item name="imgcategory" label="Chọn hình ảnh mới">
                        <Upload 
                            accept="image/*" 
                            beforeUpload={(file) => { setImgFile(file); return false; }} // Cập nhật hình ảnh
                            maxCount={1}
                            >
                            <Button icon={<UploadOutlined />}></Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">Cập nhật danh mục</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Xóa danh mục */}
            <Modal
                title="Xóa danh mục"
                visible={isModalVisibleDel}
                onCancel={() => setIsModalVisibleDel(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisibleDel(false)}>
                        Hủy
                    </Button>,
                    <Button key="delete" danger onClick={() => handleDelete(id)}>
                        Xóa
                    </Button>,
                ]}
            >
                <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
            </Modal>
        </div>
    );
};

export default CategoryManager;
