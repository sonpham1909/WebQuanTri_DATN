import React, { useEffect, useState } from 'react';
import { addProduct, addVariantToProduct, getAllProducts, getProductById } from '../../services/ProductService';
import { Button, Table, Modal, Input, Form, Upload } from 'antd';
import './index.css';
import LoadingCo from '../loading/loading';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { render } from '@testing-library/react';

const ProductManager = () => {
  const [form] = Form.useForm();

  const [product, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
  const [variants, setVariants] = useState([]);
  const [isModalVisibleVariant, setIsModalVisibleVariant] = useState(false); // State cho 
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const pageSize = 5;

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (productId) => {
    try {
      const product = await getProductById(productId);
      setSelectedProductId(productId); // Lưu ID sản phẩm đã chọn
      setVariants(product.variants || []); // Lấy các biến thể của sản phẩm đã chọn
      setIsModalVisibleVariant(true); // Hiển thị modal biến thể
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };



  useEffect(() => {
    fetchProducts();
  }, []);

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', quantity: 0, price: 0 }]);
  };

  const handleVariantChange = (index, event) => {
    const { name, value } = event.target;
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [name]: value };
    setVariants(updatedVariants);
  };

  const removeVariant = (index) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Thêm các trường dữ liệu vào FormData
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('material', values.material);
      formData.append('description', values.description);

      // Thêm tất cả hình ảnh vào FormData
      const imageFiles = values.imageUrls.fileList; // Lấy danh sách tệp hình ảnh từ form
      imageFiles.forEach(file => {
        formData.append('imageUrls', file.originFileObj); // Thêm tệp vào FormData
      });

      // Thêm các biến thể sản phẩm vào FormData nếu có
      variants.forEach((variant, index) => {
        formData.append(`variants[${index}][size]`, variant.size);
        formData.append(`variants[${index}][color]`, variant.color);
        formData.append(`variants[${index}][quantity]`, variant.quantity);
        formData.append(`variants[${index}][price]`, variant.price);
      });

      // Gửi FormData đến server
      await addProduct(formData); // Thay đổi hàm này nếu cần
      alert('Product added successfully!');
      setIsModalVisibleAdd(false);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };


  const showVariantModal = (product) => {
    setSelectedProductId(product._id); // Lưu ID sản phẩm đã chọn
    setVariants(product.variants || []); // Lấy các biến thể của sản phẩm đã chọn
    setIsModalVisibleVariant(true); // Hiển thị modal biến thể
  };

  const handleVariantSubmit = async () => {
    const variant = variants[variants.length - 1]; // Giả sử bạn muốn thêm biến thể mới nhất
    try {
      await addVariantToProduct(selectedProductId, variant);
      alert('Variant added successfully!');
      setIsModalVisibleVariant(false);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error('Error adding variant:', error);
      alert('Failed to add variant');
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrls",
      render: (imageUrls) => {
        const imageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : '';
        return imageUrl ? <img src={imageUrl} alt="Img Product" style={{ width: '50px' }} /> : 'No Image';
      }
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "category.namecategory",
      render: (text, record) => <span>{record.category ? record.category.namecategory : 'Không có danh mục'}</span>,
    },
    {
      title: 'Tổng số lượng',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <div>
          <Button>Cập nhật</Button>
          <Button onClick={() => handleProductClick(record._id)}>Biến thể</Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingCo />;
  }

  return (
    <div className="container">
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16, width: 300 }}
      />
      <div className="headerPage">
        <h3 className="titlepage">Quản lý sản phẩm</h3>
        <p>Tổng: {product.length} sản phẩm</p>
        <Button className="buttonAdd" onClick={() => setIsModalVisibleAdd(true)}>Thêm sản phẩm mới</Button>
      </div>

      <Table
        className="table"
        dataSource={product}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
        }}
      />

      <Modal
        title="Thêm sản phẩm mới"
        visible={isModalVisibleAdd}
        onCancel={() => setIsModalVisibleAdd(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}>
            <Input required />
          </Form.Item>
          <Form.Item label="Images" name="imageUrls">
            <Upload accept="image/*" beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Danh mục" name="category" rules={[{ required: true, message: 'Vui lòng nhập danh mục!' }]}>
            <Input required />
          </Form.Item>
          <Form.Item label="Chất liệu" name="material" rules={[{ required: true, message: 'Vui lòng nhập chất liệu!' }]}>
            <Input required />
          </Form.Item>
          <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <Input.TextArea required />
          </Form.Item>

          <h3>Biến thể sản phẩm</h3>
          {variants.map((variant, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <Form.Item label="Size">
                <Input
                  name="size"
                  placeholder="Size"
                  value={variant.size}
                  onChange={(event) => handleVariantChange(index, event)}
                  required
                />
              </Form.Item>
              <Form.Item label="Màu sắc">
                <Input
                  name="color"
                  placeholder="Color"
                  value={variant.color}
                  onChange={(event) => handleVariantChange(index, event)}
                  required
                />
              </Form.Item>
              <Form.Item label="Số lượng">
                <Input
                  type="number"
                  name="quantity"
                  placeholder="Số lượng"
                  value={variant.quantity}
                  onChange={(event) => handleVariantChange(index, event)}
                  required
                />
              </Form.Item>
              <Form.Item label="Giá">
                <Input
                  type="number"
                  name="price"
                  placeholder="Giá"
                  value={variant.price}
                  onChange={(event) => handleVariantChange(index, event)}
                  required
                />
              </Form.Item>
              <Button type="danger" onClick={() => removeVariant(index)}>Xóa biến thể</Button>
            </div>
          ))}
          <Button type="primary" onClick={addVariant}>Thêm biến thể</Button>

          <Form.Item>
            <Button type="primary" htmlType="submit">Thêm sản phẩm</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm biến thể cho sản phẩm"
        visible={isModalVisibleVariant}
        onCancel={() => setIsModalVisibleVariant(false)}
        footer={null}
      >
        <div>
          <h4>Biến thể hiện có</h4>
          {variants.map((variant, index) => (
            <div key={index}>
              <p>Size: {variant.size}, Color: {variant.color}, Quantity: {variant.quantity}, Price: {variant.price}</p>
            </div>
          ))}
          <h4>Thêm biến thể mới</h4>
          {variants.map((variant, index) => (
            <div key={index}>
              <Form.Item label="Size">
                <Input
                  name="size"
                  placeholder="Size"
                  value={variant.size}
                  onChange={(event) => handleVariantChange(index, event)}
                />
              </Form.Item>
              <Form.Item label="Màu sắc">
                <Input
                  name="color"
                  placeholder="Color"
                  value={variant.color}
                  onChange={(event) => handleVariantChange(index, event)}
                />
              </Form.Item>
              <Form.Item label="Số lượng">
                <Input
                  type="number"
                  name="quantity"
                  placeholder="Số lượng"
                  value={variant.quantity}
                  onChange={(event) => handleVariantChange(index, event)}
                />
              </Form.Item>
              <Form.Item label="Giá">
                <Input
                  type="number"
                  name="price"
                  placeholder="Giá"
                  value={variant.price}
                  onChange={(event) => handleVariantChange(index, event)}
                />
              </Form.Item>

              <Button type="danger" onClick={() => removeVariant(index)}>Xóa biến thể</Button>
            </div>
          ))}
          <Button type="primary" onClick={addVariant}>Thêm biến thể</Button>
          <Button type="primary" onClick={handleVariantSubmit}>Lưu biến thể</Button>
        </div>
      </Modal>

    </div>
  );
};

export default ProductManager;
