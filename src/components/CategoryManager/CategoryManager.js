import React, { useCallback, useEffect, useState } from 'react';
import { addCategory, deleteCategory, getAllCategories, searchCategories, updateCategory } from '../../services/Categoryservices';
import { Button, Table, Modal, message, Form, Input } from 'antd';
import LoadingCo from '../loading/loading';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from '@mui/material';

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
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Fetch categories from API
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            message.error('Lấy danh mục thất bại, vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    // Search categories
    const fetchCategoriesSearch = async (searchText) => {
        setLoading(true);
        try {
            const data = await searchCategories(searchText);
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch search categories:', error);
            message.error('Tìm kiếm danh mục thất bại, vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const debouncedFetchCategoriesSearch = useCallback(debounce(fetchCategoriesSearch, 1000), []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        debouncedFetchCategoriesSearch(value);
    };

    const handleRowClick = (record) => {
        setSelectedCategory(record);
        form.setFieldsValue({
            namecategory: record.namecategory, // Sửa lại tên trường
            description: record.description,
        });
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setSelectedCategory(null);
        setIsModalVisible(false);
        form.resetFields(); // Reset fields when closing modal
    };

    const handleDelete = async (categoryId) => {
        try {
            await deleteCategory(categoryId);
            message.success('Xóa danh mục thành công');
            fetchCategories(); // Update categories list
            setId('');
            setIsModalVisibleDel(false);
        } catch (error) {
            console.error('Failed to delete category:', error);
            message.error('Xóa danh mục thất bại, vui lòng kiểm tra lại!');
        }
    };

    const confirmDelete = () => {
        handleDelete(id);
    };

    const handleSubmit = async (values) => {
        try {
            const categoryAdd = {
                namecategory: values.namecategory,
                description: values.description,
            };
            await addCategory(categoryAdd);
            message.success('Thêm danh mục mới thành công');
            setIsModalVisibleAdd(false);
            fetchCategories(); // Update categories list
            form.resetFields();
        } catch (error) {
            console.error("Failed to add category:", error);
            message.error('Thêm danh mục thất bại, vui lòng kiểm tra lại!');
        }
    };

    const handleUpdate = async (values) => {
        try {
            const categoryUpdate = {
                namecategory: values.namecategory,
                description: values.description,
            };
            await updateCategory(selectedCategory._id, categoryUpdate);
            message.success('Cập nhật danh mục thành công');
            setIsModalVisible(false);
            fetchCategories(); // Update categories list
            setSelectedCategory(null);
            form.resetFields();
        } catch (error) {
            console.error('Failed to update category:', error);
            message.error('Cập nhật danh mục thất bại, vui lòng kiểm tra lại!');
        }
    };

    if (loading) {
        return <LoadingCo />;
    }

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'namecategory', // Sửa lại tên trường
            key: 'namecategory',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <div>
                    <Button type="primary" onClick={() => handleRowClick(record)} style={{ marginRight: '10px' }}>
                        Chi tiết
                    </Button>
                    <Button type="danger" onClick={() => {
                        setIsModalVisibleDel(true);
                        setId(record._id);
                    }}>
                        Xóa
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="container">
            <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchText}
                onChange={handleSearch}
                prefix={<SearchOutlined />}
                style={{ marginBottom: 16, width: 300 }}
            />
            <div className="headerPage">
                <h3 className="titlepage">Quản lý danh mục</h3>
                <p>Tổng: {categories.length} danh mục</p>
                <Button className="buttonAdd" onClick={() => setIsModalVisibleAdd(true)}>Thêm danh mục mới</Button>
            </div>
            <Table
                className="table"
                dataSource={categories}
                columns={columns}
                rowKey="_id"
                pagination={{
                    pageSize,
                    current: currentPage,
                    onChange: (page) => setCurrentPage(page),
                }}
            />

            {/* Modal for Category Details */}
            <Modal
                title="Chi tiết danh mục"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
            >
                {selectedCategory && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                    >
                        <Form.Item
                            label="Tên danh mục"
                            name="namecategory"
                            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Mô tả"
                            name="description"
                        >
                            <Input />
                        </Form.Item>

                        <Button type="primary" htmlType="submit">
                            Cập nhật
                        </Button>
                    </Form>
                )}
            </Modal>

            {/* Modal for Delete Confirmation */}
            <Modal
                title="Xóa danh mục"
                visible={isModalVisibleDel}
                onCancel={() => setIsModalVisibleDel(false)}
                footer={null}
            >
                <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
                <Button type="primary" danger onClick={confirmDelete}>
                    Xóa
                </Button>
                <Button onClick={() => setIsModalVisibleDel(false)}>
                    Hủy
                </Button>
            </Modal>

            {/* Modal for Adding New Category */}
            <Modal
                title="Thêm danh mục mới"
                visible={isModalVisibleAdd}
                onCancel={() => setIsModalVisibleAdd(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Tên danh mục"
                        name="namecategory"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <Input />
                    </Form.Item>

                    <Button type="primary" htmlType="submit">
                        Thêm
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManager;
