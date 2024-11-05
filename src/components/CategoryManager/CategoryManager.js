// src/CategoryManager/CategoryManager.js
import React, { useCallback, useEffect, useState } from 'react';
import {
    addCategory,
    deleteCategory,
    getAllCategories,
    searchCategories,
    updateCategory
} from '../../services/Categoryservices';
import { Button, Table, Modal, message, Form, Input, Upload } from 'antd';
import LoadingCo from '../loading/loading';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
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
    const [imgFile, setImgFile] = useState(null);
    const navigate = useNavigate();

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
        });
        setImgFile(null);
        setIsModalVisible(true);
    };

    const handleAddCategory = async (values) => {
        try {
            if (!values.namecategory || !values.description || !values.imgcategory?.file) {
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

    const handleCategoryClick = (categoryId) => {
        navigate(`/home/subcategory?categoryId=${categoryId}`);
    };

    return (
        <div className="container">
            <Input
                placeholder="Tìm kiếm danh mục"
                value={searchText}
                onChange={onSearchChange}
                prefix={<SearchOutlined />}
                className="inputSearch"
            />
            <div className="headerPage">
                <h2 className="titlepage">Quản lý danh mục</h2>
                <div className="headerActions">
                    <span className="totalCategories">Tổng danh mục: {categories.length}</span>
                    <Button className="buttonAdd" type="primary" onClick={showModalAdd}>
                        Thêm danh mục
                    </Button>
                </div>
            </div>

            {loading ? (
                <LoadingCo />
            ) : (
                <Table dataSource={categories} rowKey="_id" pagination={{ pageSize: 5 }}>
                    <Table.Column title="STT" render={(text, record, index) => index + 1} />
                    <Table.Column
                        title="Tên danh mục"
                        dataIndex="namecategory"
                        render={(text, record) => (
                            <span onClick={() => handleCategoryClick(record._id)} style={{ cursor: 'pointer', color: 'blue' }}>
                                {text}
                            </span>
                        )}
                    />
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
                                return false; // Prevent automatic upload
                            }}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                        </Upload>
                    </Form.Item>
                    {imgFile && (
                        <div style={{ marginTop: '10px' }}>
                            <img src={URL.createObjectURL(imgFile)} alt="Selected" style={{ width: '100px', marginBottom: '10px' }} />
                        </div>
                    )}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Thêm danh mục</Button>
                    </Form.Item>
                </Form>
            </Modal>

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
                    <Form.Item name="imgcategory" label="Hình ảnh">
                        <Upload
                            accept="image/*"
                            beforeUpload={(file) => {
                                setImgFile(file);
                                return false; // Prevent automatic upload
                            }}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                        </Upload>
                    </Form.Item>
                    {imgFile ? (
                        <div style={{ marginTop: '10px' }}>
                            <img src={URL.createObjectURL(imgFile)} alt="Selected" style={{ width: '100px', marginBottom: '10px' }} />
                        </div>
                    ) : (
                        <div style={{ marginTop: '10px' }}>
                            <img src={selectedCategory?.imgcategory} alt="Current" style={{ width: '100px', marginBottom: '10px' }} />
                        </div>
                    )}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Cập nhật danh mục</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Xác nhận xóa"
                visible={isModalVisibleDel}
                onOk={() => handleDelete(id)}
                onCancel={() => setIsModalVisibleDel(false)}
            >
                <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
            </Modal>
        </div>
    );
};

export default CategoryManager;