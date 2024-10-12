import React, { useCallback, useEffect, useState } from 'react';
import { addSubcategory, deleteSubcategory, getAllSubcategories, searchSubcategories, updateSubcategory } from '../../services/SubcategoryServices';
import { getAllCategories } from '../../services/Categoryservices'; 
import { Button, Table, Modal, message, Form, Input, Upload } from 'antd';
import LoadingCo from '../loading/loading';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { useNavigate, useLocation } from 'react-router-dom';

const SubcategoryManager = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const categoryId = query.get('categoryId'); // Lấy categoryId từ URL
    const [categoryName, setCategoryName] = useState(''); 
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleDel, setIsModalVisibleDel] = useState(false);
    const [id, setId] = useState('');
    const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [imgFile, setImgFile] = useState(null);
    const [categories, setCategories] = useState([]); 
    const navigate = useNavigate();




    const fetchSubcategories = async () => {
        setLoading(true);
        try {
            const result = await getAllSubcategories();
            const filteredSubcategories = result.filter(sub => sub.id_category === categoryId); // Lọc subcategories theo categoryId
            setSubcategories(filteredSubcategories);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
      try {
          const result = await getAllCategories();
          console.log("Categories fetched:", result); // Kiểm tra danh sách categories
          setCategories(result);
          const category = result.find(cat => cat._id === categoryId);
          console.log("Found category:", category); // Kiểm tra category tìm thấy
          if (category) {
              setCategoryName(category.namecategory);
          }
      } catch (error) {
          console.error("Error fetching categories:", error);
      }
  };
  

    const handleSearch = useCallback(
        debounce(async (searchTerm) => {
            if (searchTerm) {
                const result = await searchSubcategories(searchTerm);
                const filteredSubcategories = result.filter(sub => sub.id_category === categoryId); // Lọc theo categoryId
                setSubcategories(filteredSubcategories);
            } else {
                fetchSubcategories();
            }
        }, 300),
        [categoryId]
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

    const showModalUpdate = (subcategory) => {
        form.resetFields();
        setSelectedSubcategory(subcategory);
        form.setFieldsValue({
            name: subcategory.name,
            description: subcategory.description,
            imgsubcategory: undefined, // Không cần thiết lập trường này cho input
        });
        setImgFile(null);
        setIsModalVisible(true);
    };

    const handleAddSubcategory = async (values) => {
        try {
            if (!values || !values.name || !values.imgsubcategory?.file) {
                throw new Error("Thông tin không đầy đủ");
            }

            const imgFile = values.imgsubcategory.file;
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('image', imgFile);
            formData.append('id_category', categoryId); // Thêm categoryId vào formData

            await addSubcategory(formData);
            message.success("Thêm danh mục con thành công!");
            setIsModalVisibleAdd(false);
            fetchSubcategories();
        } catch (error) {
            console.error("Error while adding subcategory:", error);
            message.error("Có lỗi xảy ra khi thêm danh mục con: " + error.message);
        }
    };

    const handleUpdateSubcategory = async (values) => {
        try {
            const formData = new FormData();
            formData.append('name', values.name); // Sử dụng 'name' cho trường tên

            if (imgFile) {
                formData.append('image', imgFile);
            }

            await updateSubcategory(selectedSubcategory._id, formData);
            message.success("Cập nhật danh mục con thành công!");
            setIsModalVisible(false);
            fetchSubcategories();
        } catch (error) {
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
            message.error("Có lỗi xảy ra khi xóa danh mục con");
        }
    };

    useEffect(() => {
        fetchSubcategories();
        fetchCategories(); // Gọi hàm fetchCategories khi component mount
    }, [categoryId]); // Thêm categoryId vào dependency array

    return (
        <div className="container">
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
                    <span className="totalSubcategories">Tổng danh mục con: {subcategories.length}</span>
                    <Button className="buttonAdd" type="primary" onClick={showModalAdd}>Thêm </Button>
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
                    />
                    <Table.Column
                        title="Hình ảnh"
                        dataIndex="image"
                        render={(text) => <img src={text} alt="Subcategory" style={{ width: '50px' }} />}
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
                title="Thêm danh mục con"
                visible={isModalVisibleAdd}
                onCancel={() => setIsModalVisibleAdd(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleAddSubcategory}>
                    <Form.Item name="name" label="Tên danh mục con" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục con!' }]}>
                        <Input />
                    </Form.Item>
            
                    <Form.Item name="imgsubcategory" label="Hình ảnh" rules={[{ required: true, message: 'Vui lòng chọn hình ảnh!' }]}>
                        <Upload 
                            accept="image/*" 
                            beforeUpload={(file) => {
                                setImgFile(file); 
                                return false; // Ngăn chặn tự động tải lên
                            }} 
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}></Button>
                        </Upload>
                    </Form.Item>
                    
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
                        <Button type="primary" htmlType="submit">Thêm danh mục con</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Cập nhật danh mục con"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleUpdateSubcategory}>
                    <Form.Item name="name" label="Tên danh mục con" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục con!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="imgsubcategory" label="Hình ảnh">
                        <Upload 
                            accept="image/*" 
                            beforeUpload={(file) => {
                                setImgFile(file); 
                                return false; // Ngăn chặn tự động tải lên
                            }} 
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}></Button>
                        </Upload>
                    </Form.Item>

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
                        <Button type="primary" htmlType="submit">Cập nhật danh mục con</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Xóa danh mục con"
                visible={isModalVisibleDel}
                onOk={() => handleDelete(id)}
                onCancel={() => setIsModalVisibleDel(false)}
            >
                <p>Bạn có chắc chắn muốn xóa danh mục con này?</p>
            </Modal>
        </div>
    );
};

export default SubcategoryManager;
