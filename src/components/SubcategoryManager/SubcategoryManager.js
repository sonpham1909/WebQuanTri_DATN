import React, { useCallback, useEffect, useState } from 'react';


import {
    addSubcategory,
    deleteSubcategory,
    getAllSubcategories,
    updateSubcategory,
} from '../../services/SubcategoryServices';
import { getAllProducts,searchProducts } from '../../services/ProductService';
import { addProductSubCategory, getAllProductSubCategories, deleteProductSubCategory } from '../../services/Product_sub_categoriesServices';
import { getAllCategories } from '../../services/Categoryservices';
import { Button, Table, Modal, message, Form, Input, Upload, Select } from 'antd';

import LoadingCo from '../loading/loading';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

const { Option } = Select;

const SubcategoryManager = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const categoryId = query.get('categoryId');

    const [categoryName, setCategoryName] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleDel, setIsModalVisibleDel] = useState(false);
    const [id, setId] = useState('');
    const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
    const [isModalVisibleProducts, setIsModalVisibleProducts] = useState(false);
    const [isModalVisibleAddProduct, setIsModalVisibleAddProduct] = useState(false);
    const [form] = Form.useForm();
    const [productForm] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [imgFile, setImgFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allSubcategories, setAllSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [productSubCategories, setProductSubCategories] = useState([]);
    const [productNames, setProductNames] = useState({});
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isModalVisibleDelProduct, setIsModalVisibleDelProduct] = useState(false);
    const [productSubCategoryId, setProductSubCategoryId] = useState(null);
    const navigate = useNavigate();


    const handleBackToHome = () => {
      navigate('/home', { state: { selectedItem: 'item2' } });
    };
    const handleSearchProducts = async (searchTerm) => {
        try {
            const result = await searchProducts(searchTerm);  // Gọi hàm tìm kiếm sản phẩm
            setProducts(result);  // Lưu kết quả vào state 'products'
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        }
    };
    
    const fetchSubcategories = async () => {
        setLoading(true);
        try {
            const result = await getAllSubcategories();
            const filteredSubcategories = result.filter(sub => sub.id_category === categoryId);
            setSubcategories(filteredSubcategories);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục con:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const result = await getAllCategories();

            setCategories(result);
            const category = result.find(cat => cat._id === categoryId);

            if (category) {
                setCategoryName(category.namecategory);
            }
        } catch (error) {

            console.error("Lỗi khi lấy danh mục:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const result = await getAllProducts();
            setProducts(result);

            const names = {};
            result.forEach(product => {
                names[product._id] = product.name;
            });
            setProductNames(names);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
        }
    };

    const fetchProductSubCategories = async () => {
        try {
            const result = await getAllProductSubCategories();
            setProductSubCategories(result);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục sản phẩm:", error);
        }
    };


    const fetchAllSubcategories = async () => {
        try {
            const result = await getAllSubcategories(); // Gọi hàm bất đồng bộ
            setAllSubcategories(result); // Lưu kết quả vào state
            setSubcategories(result); // Cập nhật subcategories ban đầu
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    // Gọi hàm fetchAllSubcategories khi component được tải
    useEffect(() => {
        fetchAllSubcategories();
    }, []);

    const handleSearch = useCallback(
        debounce((searchTerm) => {
            if (searchTerm) {
                if (Array.isArray(allSubcategories)) {
                    const filteredSubcategories = allSubcategories.filter(sub =>
                        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) // So sánh trường name
                    );
                    setSubcategories(filteredSubcategories);
                } else {
                    console.error('allSubcategories is not an array:', allSubcategories);
                }
            } else {
                setSubcategories(allSubcategories); // Hiển thị lại tất cả khi không có từ khóa tìm kiếm
            }
        }, 300),
        [allSubcategories] // Chỉ theo dõi allSubcategories
    );

    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value); // Cập nhật trạng thái tìm kiếm
        handleSearch(value);   // Gọi hàm tìm kiếm đã được debounce
    };

    const showModalAdd = () => {
        setIsModalVisibleAdd(true);
        form.resetFields();
        setImgFile(null);
    };

    const showModalUpdate = (subcategory) => {
        form.resetFields();
        setSelectedSubcategory(subcategory);
        form.setFieldsValue({
            name: subcategory.name,
        });
        setImgFile(null);
        setIsModalVisible(true);
    };

    const handleAddSubcategory = async (values) => {
        try {
            if (!values || !values.name || !imgFile) {
                throw new Error("Thông tin không đầy đủ");
            }

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('image', imgFile);
            formData.append('id_category', categoryId);

            const newSubcategory = await addSubcategory(formData);
            message.success("Thêm danh mục con thành công!");

            setSubcategories(prev => [...prev, newSubcategory]);
            setIsModalVisibleAdd(false);
        } catch (error) {
            console.error("Lỗi khi thêm danh mục con:", error);
            message.error("Lỗi khi thêm danh mục con: " + error.message);
        }
    };

    const handleUpdateSubcategory = async (values) => {
        try {
            const formData = new FormData();
            formData.append('name', values.name);
    
            if (imgFile) {
                console.log('Đang gửi file ảnh:', imgFile);
                formData.append('image', imgFile);
            }
    
            await updateSubcategory(selectedSubcategory._id, formData);
            message.success("Cập nhật danh mục con thành công!");
    
            setIsModalVisible(false);
            fetchSubcategories(); // Gọi lại API để làm mới dữ liệu
        } catch (error) {
            console.error("Có lỗi khi cập nhật:", error);
            message.error("Có lỗi xảy ra khi cập nhật danh mục con: " + error.message);
        }
    };
    
    
    const handleDelete = async (id) => {
        try {
            await deleteSubcategory(id);
            message.success("Xóa danh mục con thành công!");
            setIsModalVisibleDel(false);
            fetchSubcategories();
        } catch (error) {
            message.error("Lỗi khi xóa danh mục con");
        }
    };

    const handleDeleteProductSubCategory = async () => {
        try {
            await deleteProductSubCategory(productSubCategoryId);
            message.success("Xóa sản phẩm khỏi danh mục con thành công!");
            setIsModalVisibleDelProduct(false);
            fetchProductSubCategories();
        } catch (error) {
            message.error("Lỗi khi xóa sản phẩm khỏi danh mục con: " + error.message);
        }
    };

    const handleAddProductToSubcategory = async () => {
        try {
            if (!selectedProductId) {
                throw new Error("Vui lòng chọn sản phẩm!");
            }

            const isDuplicate = productSubCategories.some(
                (item) => item.product_id === selectedProductId && item.sub_categories_id === selectedSubcategory._id
            );

            if (isDuplicate) {
                throw new Error("Sản phẩm đã tồn tại trong danh mục con này!");
            }

            const newProductSubCategory = await addProductSubCategory({
                product_id: selectedProductId,
                sub_categories_id: selectedSubcategory._id
            });

            setProductSubCategories(prev => [
                ...prev,
                newProductSubCategory
            ]);

            message.success("Thêm sản phẩm vào danh mục con thành công!");
            setSelectedProductId(null);
            setIsModalVisibleAddProduct(false);
        } catch (error) {
            message.error("Lỗi khi thêm sản phẩm vào danh mục con: " + error.message);
        }
    };

    const fetchProductsForSubcategory = () => {
        return productSubCategories
            .filter(productSub => productSub.sub_categories_id === selectedSubcategory?._id)
            .map(item => {
                const product = products.find(product => product._id === item.product_id);
                return {
                    ...item,
                    productName: productNames[item.product_id] || 'Không tìm thấy tên sản phẩm',
                    productImages: product?.imageUrls || [],
                };
            });
    };

    useEffect(() => {
        fetchSubcategories();
        fetchCategories();
        fetchProducts();
        fetchProductSubCategories();
    }, [categoryId]);

    const showModalAddProduct = () => {
        setIsModalVisibleAddProduct(true);
        setSelectedProductId(null);
        productForm.resetFields();
    };

    return (
        <div className="container">

             <button onClick={handleBackToHome}>Quay về </button>
             

            <Input
                placeholder="Tìm kiếm danh mục con"
                value={searchText}
                onChange={onSearchChange}
                prefix={<SearchOutlined />}
                className="inputSearch"
            />

            <div className="headerPage">
                <h2 className="titlepage">Quản lý danh mục con: {categoryName}</h2>
                <div className="headerActions">
                    <span className="totalSubcategories">Tổng số danh mục con: {subcategories.length}</span>
                    <Button className="buttonAdd" type="primary" onClick={showModalAdd}>Thêm</Button>
                </div>
            </div>

            {loading ? (
                <LoadingCo />
            ) : (
                <Table dataSource={subcategories} rowKey="_id" pagination={{ pageSize: 5 }}>
                    <Table.Column title="STT" render={(text, record, index) => index + 1} />

                    <Table.Column 
                        title="Tên danh mục con" 
                        dataIndex="name" 
                        render={(text, record) => (
                            <Button type="link" onClick={() => {
                                setSelectedSubcategory(record);
                                setIsModalVisibleProducts(true);
                            }}>{text}</Button>
                        )} 

                    />
                    <Table.Column
                        title="Hình ảnh"
                        dataIndex="image"
                        render={(text) => <img src={text} alt="Danh mục con" style={{ width: '50px' }} />}
                    />
                    <Table.Column 
                        title="Hành động" 
                        render={(text, record) => (
                            <>
                                <Button type="link" onClick={() => showModalUpdate(record)}>Cập nhật</Button>
                                <Button type="link" danger onClick={() => {
                                    setId(record._id);
                                    setIsModalVisibleDel(true);
                                }}>Xóa</Button>
                            </>
                        )} 
                    />
                </Table>
            )}


            {/* Modal Thêm Danh Mục Con */}

            <Modal
                title="Thêm Danh Mục Con"
                visible={isModalVisibleAdd}
                onCancel={() => setIsModalVisibleAdd(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleAddSubcategory}>
                    <Form.Item name="name" label="Tên danh mục con" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục con!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="imgsubcategory" label="Hình ảnh" rules={[{ required: true, message: 'Vui lòng tải lên một hình ảnh!' }]}>
                    <Upload
    beforeUpload={(file) => {
        setImgFile(file);
        return false; // Ngăn không upload tự động
    }}
    showUploadList={true}
    listType="picture"
    maxCount={1}
>
    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
</Upload>

                    </Form.Item>


                    <Form.Item>
                        <Button type="primary" htmlType="submit">Thêm</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Cập Nhật Danh Mục Con */}
            <Modal
                title="Cập Nhật Danh Mục Con"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleUpdateSubcategory}>
                    <Form.Item name="name" label="Tên danh mục con" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục con!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="imgsubcategory" label="Hình ảnh (tùy chọn)">
                        <Upload 
                            beforeUpload={(file) => {
                                setImgFile(file);
                                return false; // Ngăn chặn tự động tải lên
                            }} 
                            maxCount={1} // Giới hạn chỉ cho phép 1 hình ảnh

                        >
                            <Button icon={<UploadOutlined />}></Button>
                        </Upload>
                    </Form.Item>


                    <Form.Item>
                        <Button type="primary" htmlType="submit">Cập nhật</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Xác Nhận Xóa Danh Mục Con */}
            <Modal
                title="Xác Nhận Xóa"
                visible={isModalVisibleDel}
                onCancel={() => setIsModalVisibleDel(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisibleDel(false)}>Hủy</Button>,
                    <Button key="delete" type="primary" danger onClick={() => handleDelete(id)}>Xóa</Button>,
                ]}
            >
                <p>Bạn có chắc chắn muốn xóa danh mục con này không?</p>
            </Modal>

            {/* Modal Danh Sách Sản Phẩm */}
            <Modal
                title="Danh Sách Sản Phẩm"
                visible={isModalVisibleProducts}
                onCancel={() => setIsModalVisibleProducts(false)}
                footer={null}
            >
                <Button onClick={showModalAddProduct}>Thêm Sản Phẩm</Button>
                <Table dataSource={fetchProductsForSubcategory()} rowKey="_id" pagination={{ pageSize: 5 }}>
                    <Table.Column title="Tên Sản Phẩm" dataIndex="productName" />
                    <Table.Column 
                        title="Hình Ảnh Sản Phẩm" 
                        render={(text, record) => (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {record.productImages.map((image, index) => (
                                    <img key={index} src={image} alt={`Sản phẩm ${index + 1}`} style={{ width: '50px' }} />
                                ))}
                            </div>
                        )} 
                    />
                    <Table.Column
                        title="Hành Động"
                        render={(text, record) => (
                            <Button type="link" danger onClick={() => {
                                setProductSubCategoryId(record._id);
                                setIsModalVisibleDelProduct(true);
                            }}>
                                Xóa
                            </Button>
                        )}
                    />
                </Table>
            </Modal>

            {/* Modal Xóa Sản Phẩm Khỏi Danh Mục Con */}
            <Modal
                title="Xác Nhận Xóa Sản Phẩm Khỏi Danh Mục Con"
                visible={isModalVisibleDelProduct}
                onCancel={() => setIsModalVisibleDelProduct(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisibleDelProduct(false)}>Hủy</Button>,
                    <Button key="delete" type="primary" danger onClick={handleDeleteProductSubCategory}>Xóa</Button>,
                ]}
            >
                <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh mục con không?</p>
            </Modal>

            {/* Modal Thêm Sản Phẩm Vào Danh Mục Con */}
            <Modal
    title="Thêm Sản Phẩm Vào Danh Mục Con"
    visible={isModalVisibleAddProduct}
    onCancel={() => setIsModalVisibleAddProduct(false)}
    footer={null}
>
    <Form form={productForm} onFinish={handleAddProductToSubcategory}>
        <Form.Item name="product_id" label="Chọn Sản Phẩm" rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}>
            <Select
                placeholder="Chọn Sản Phẩm"
                onChange={(value) => setSelectedProductId(value)}
                value={selectedProductId || undefined}
                showSearch // Kích hoạt chức năng tìm kiếm
                filterOption={(input, option) => 
                    option.children.toLowerCase().includes(input.toLowerCase()) // Lọc các lựa chọn dựa trên đầu vào
                }
            >
                {products.map(product => (
                    <Select.Option key={product._id} value={product._id}>
                        {product.name}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>
        <Form.Item>
            <Button type="primary" htmlType="submit">Thêm Sản Phẩm</Button>
        </Form.Item>
    </Form>
</Modal>
        </div>
    );
};

export default SubcategoryManager;