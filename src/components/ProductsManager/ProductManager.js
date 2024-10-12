import React, { useEffect, useState } from 'react';
import { addProduct, addVariantToProduct, getAllProducts, getProductById, updateProduct } from '../../services/ProductService';
import { Button, Table, Modal, Input, Form, Upload } from 'antd';
import './index.css';
import LoadingCo from '../loading/loading';
import { DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';

const ProductManager = () => {
  const [form] = Form.useForm();
  const [product, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
  const [isModalVisibleUpdateImage, setIsModalVisibleUpdateImage] = useState(false);
  const [currentProductImages, setCurrentProductImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // State để lưu trữ hình ảnh mới

  const [ImageToDel, setImageToDel] = useState([]);
  const [Productss, setProductss] = useState([]);

  // Quản lý biến thể thông qua state riêng lẻ
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  const [variants, setVariants] = useState([]); // State lưu biến thể hiện có
  const [isModalVisibleVariant, setIsModalVisibleVariant] = useState(false);
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

  const handleDeleteImage = (imageToDelete) => {
    const updatedImages = currentProductImages.filter((image) => image !== imageToDelete);
    setCurrentProductImages(updatedImages);
    setImageToDel(imageToDelete);
  };

  const handleImageChange = (info) => {
    if (info.fileList) {
      setNewImages(info.fileList.map(file => file.originFileObj)); // Lưu hình ảnh mới
    }
  };

  const handleProductClick = async (productId) => {
    try {

      const product = await getProductById(productId);
      setIsModalVisibleVariant(true)
      setSelectedProductId(productId);
      setVariants(product.variants || []); // Đảm bảo đang set đúng

      // Log biến thể ngay sau khi set
      console.log('Current variants after set:', variants); // Có thể vẫn trả về giá trị cũ
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };

  const handlresetVariant = () => {
    setVariants([]);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('material', values.material);
      formData.append('description', values.description);

      const imageFiles = values.imageUrls.fileList;
      imageFiles.forEach(file => {
        formData.append('imageUrls', file.originFileObj);
      });

      await addProduct(formData);
      alert('Product added successfully!');
      setIsModalVisibleAdd(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const resetVariantForm = () => {
    setSize('');
    setColor('');
    setQuantity(0);
    setPrice(0);
  };

  const handleVariantSubmit = async () => {
    const newVariant = { size, color, quantity, price };
    try {
      await addVariantToProduct(selectedProductId, newVariant);
      alert('Variant added successfully!');
      handlresetVariant();
      resetVariantForm();
      setIsModalVisibleVariant(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding variant:', error);
      alert('Failed to add variant');
    }
  };

  const handleProductClickUpdate = async (productId) => {
    try {
      const product = await getProductById(productId);
      setProductss(product);
      
      console.log(product);
      
      setSelectedProductId(productId);
      
      setCurrentProductImages(product.imageUrls || []); // Lưu trữ hình ảnh hiện có
      setIsModalVisibleUpdateImage(true);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };

  const handleUpdateImages = async (updatedData) => {
    try {
      const formData = new FormData();
      formData.append('name', updatedData.nameU);
      
      formData.append('material', updatedData.materialU);
      formData.append('description', updatedData.descriptionU);
  
      // Kiểm tra nếu có hình ảnh mới
      const allImages = [...newImages];

      console.log(allImages);
      
      
      // Loại bỏ các ảnh trùng lặp nếu cần
      const uniqueImages = [...new Set(allImages.map(image => image))];

      // Thêm các ảnh vào formData
      uniqueImages.forEach(image => {
          formData.append('imageUrls', image); // Nếu hình ảnh hiện có đã được lưu dưới dạng file, có thể bỏ qua
      });
  
      // Gửi danh sách hình ảnh muốn xóa
      if (ImageToDel && ImageToDel.length > 0) {
          formData.append('imagesToDelete', JSON.stringify(ImageToDel)); // Gửi danh sách hình ảnh cần xóa
      }

        await updateProduct(selectedProductId, formData);
        alert('Cập nhật hình ảnh thành công!');
        setImageToDel([]);
        fetchProducts();
        setNewImages([]);
        setCurrentProductImages([]);
       
        setIsModalVisibleUpdateImage(false);
        form.resetFields();
        fetchProducts(); // Tải lại danh sách sản phẩm
    } catch (error) {
        console.error('Error updating images:', error);
        alert('Cập nhật hình ảnh thất bại');
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
      title: 'Tổng số lượng',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <div>
          <Button onClick={() => handleProductClickUpdate(record._id)}>Cập nhật</Button>
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

          <Form.Item>
            <Button type="primary" htmlType="submit">Thêm sản phẩm</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật hình ảnh sản phẩm"
        visible={isModalVisibleUpdateImage}
        onCancel={() => {
          form.resetFields();
          setIsModalVisibleUpdateImage(false);
          setImageToDel([]);
          
        }}
        footer={null}
      >
        <h4>Hình ảnh hiện tại</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {currentProductImages.map((image, index) => (
            <div key={index} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
              <img
                src={image}
                alt={`Current Product Image ${index + 1}`}
                style={{ width: '100px', height: '100px' }}
              />
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                size="small"
                style={{ position: 'absolute', top: 0, right: 0 }}
                onClick={() => handleDeleteImage(image)}
              />
            </div>
          ))}
          {newImages.map((image, index) => (
            <div key={`new-${index}`} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
              <img
                src={URL.createObjectURL(image)} // Tạo URL tạm thời cho hình ảnh mới
                alt={`New Product Image ${index + 1}`}
                style={{ width: '100px', height: '100px' }}
              />
            </div>
          ))}
        </div>
        <Form form={form} layout="vertical" onFinish={handleUpdateImages}
        initialValues={{
          nameU: Productss.name,
          materialU: Productss.material,
          descriptionU: Productss.description,
        }}
        >
          <Form.Item label="Hình ảnh mới" name="imageUrls">
            <Upload accept="image/*" beforeUpload={() => false} multiple onChange={handleImageChange}>
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Tên sản phẩm" name="nameU" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}>
      <Input required />
    </Form.Item>
   
    <Form.Item label="Chất liệu" name="materialU" rules={[{ required: true, message: 'Vui lòng nhập chất liệu!' }]}>
      <Input required />
    </Form.Item>
    <Form.Item label="Mô tả" name="descriptionU" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
      <Input.TextArea required />
    </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Cập nhật hình ảnh</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm biến thể cho sản phẩm"
        visible={isModalVisibleVariant}
        onCancel={() => {
          setIsModalVisibleVariant(false);
          handlresetVariant();
          setVariants([]);
        }}
        footer={null}
      >
        <Table
            dataSource={variants}
            columns={[
              { title: 'Size', dataIndex: 'size', key: 'size' },
              { title: 'Màu sắc', dataIndex: 'color', key: 'color' },
              { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
              { title: 'Giá', dataIndex: 'price', key: 'price' }
            ]}
            rowKey="_id"
            pagination={false}
          />
        <Form layout="vertical" onFinish={handleVariantSubmit}>
          <Form.Item label="Kích thước" rules={[{ required: true, message: 'Vui lòng nhập kích thước!' }]}>
            <Input value={size} onChange={(e) => setSize(e.target.value)} required />
          </Form.Item>
          <Form.Item label="Màu sắc" rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }]}>
            <Input value={color} onChange={(e) => setColor(e.target.value)} required />
          </Form.Item>
          <Form.Item label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </Form.Item>
          <Form.Item label="Giá" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Thêm biến thể</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManager;
