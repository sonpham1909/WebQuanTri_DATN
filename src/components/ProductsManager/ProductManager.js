import React, { useCallback, useEffect, useState } from 'react';
import { addProduct, addVariantToProduct, deleteProduct, deleteVariants, getAllProducts, getProductById, searchProducts, updateProduct } from '../../services/ProductService';
import { Button, Table, Modal, Input, Form, Upload, message, Spin, Select, InputNumber, Space } from 'antd';
import './index.css';
import LoadingCo from '../loading/loading';
import Icon, { DeleteFilled, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import FormDel from '../ActionForms/FormDel';
import debounce from 'lodash/debounce';
import { CreateVariant, getVariantsByProductId, updateVariantQuantity } from '../../services/VariantService';
import { Option } from 'antd/es/mentions';
import { deleteVariantss } from '../../services/VariantService';


const ProductManager = () => {
  const [form] = Form.useForm();
  const [product, setProducts] = useState([]);
  const [loadingAc, setLoadingAc] = useState(false);
  const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
  const [isModalVisibleUpdateImage, setIsModalVisibleUpdateImage] = useState(false);
  const [currentProductImages, setCurrentProductImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // State để lưu trữ hình ảnh mới
  const [IsModalRemove, setIsModalRemove] = useState(false);
  const [IsModalRemoveVariants, seTIsModalRemoveVariants] = useState(false);
  const [productSearch, setProductSearch] = useState([]);

  const [searchText, setSearchText] = useState('');

  const [ImageToDel, setImageToDel] = useState([]);
  const [Productss, setProductss] = useState([]);
  const [idDel, setIdDel] = useState('');
  const [idVariant, setIdVariant] = useState('');
  const [idPro, setIdPro] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);

  const handleUpdateClick = (record) => {
    setEditingKey(record._id);
    setNewQuantity(record.quantity); // Gán số lượng hiện tại vào Input
  };

  const handleSaveClick = async(variantId,record) => {
   
    
    // onUpdateSizeQuantity(record._id, newQuantity); // Gọi callback để cập nhật số lượng
    try {
      console.log(record);
      
      await updateVariantQuantity(variantId,record.size,newQuantity);
      setVariants((prevVariants) =>
        prevVariants.map((variant) => {
          if (variant._id === variantId) {
            // Tìm và cập nhật `size` trong mảng `sizes`
            const updatedSizes = variant.sizes.map((sizeObj) =>
              sizeObj.size === record.size
                ? { ...sizeObj, quantity: newQuantity }
                : sizeObj
            );
            return { ...variant, sizes: updatedSizes };
          }
          return variant;
        })
      );
      message.success('Cập nhật số lượng thành công');
    setEditingKey(null); // Đóng chế độ chỉnh sửa
    } catch (error) {
      message.error('Lỗi khi cập nhật số lượng: ',error)
    }
  };

  const handleCancelClick = () => {
    setEditingKey(null);
  };


  // Quản lý biến thể thông qua state riêng lẻ
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  const [variants, setVariants] = useState([]); // State lưu biến thể hiện có
  const [isModalVisibleVariant, setIsModalVisibleVariant] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const pageSize = 10;

  const [fileList, setFileList] = useState([]);

  const handleUpload = (info) => {
    setFileList(info.fileList.slice(-1)); // Giới hạn chỉ 1 ảnh
  };

  const onFinish = async (values) => {
    // Convert image file to URL
    try {
      const image = fileList[0]?.originFileObj;


      const sizes = values.sizes; // Giả sử sizes là mảng từ form

      // Kiểm tra và định dạng lại dữ liệu
      const variantData = {
        product_id: selectedProductId,
        color: values.color,
        color_code: values.color_code,
        sizes: sizes, // Đảm bảo đây là mảng đối tượng
        image: image // Tệp ảnh
      };console.log(Array.isArray(variantData.sizes)); // Kiểm tra xem sizes có phải là mảng không


      console.log(variantData);
      const formData = new FormData();
      formData.append('product_id', variantData.product_id);
      formData.append('color', variantData.color);
      formData.append('color_code', variantData.color_code);
      variantData.sizes.forEach(size => {
        formData.append('sizes[]', JSON.stringify(size)); // Chuyển từng size thành chuỗi JSON

      });
      formData.append('imageUrls', variantData.image);
      await CreateVariant(formData);
      message.success('Thêm biến thể thành công');
      form.resetFields();
      setSelectedProductId(null);
      setIsModalVisibleVariant(false);
    } catch (error) {
      console.error('Failed to create variants', error);
      message.error('Thêm biến thể không thành công')
    }


  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
      console.log(product);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (Productss) {
      form.setFieldsValue({
        nameU: Productss.name,
        materialU: Productss.material,
        descriptionU: Productss.description,
        priceU: Productss.price
      });
    }
  }, [Productss, form]);

  const handleImageChange = (info) => {
    if (info.fileList) {
      setNewImages(info.fileList.map(file => file.originFileObj)); // Lưu hình ảnh mới
    }
  };

  const fetchProductsSearch = async (searchText) => {
    try {
      const data = await searchProducts(searchText);

      setProductSearch(data); // Lưu dữ liệu tìm kiếm vào state
      // Log dữ liệu tìm kiếm
    } catch (error) {
      console.error('Failed to fetch search products', error);
    } finally {
      setLoading(false);
    }

  };

  const debouncedFetchProductsSearch = useCallback(debounce(fetchProductsSearch, 400), []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();  // Chuyển text thành chữ thường
    setSearchText(value);
    debouncedFetchProductsSearch(value);
  }

  if (loading) {
    return <LoadingCo />;
  }

  const handleProductClick = async (productId) => {
    try {

      const variants = await getVariantsByProductId(productId);
      setIsModalVisibleVariant(true);
      console.log(variants);

      setSelectedProductId(productId);
      setVariants(variants || []); // Đảm bảo đang set đúng

      // Log biến thể ngay sau khi set

    } catch (error) {console.error('Failed to fetch product:', error);
    }
  };

  const handlresetVariant = () => {
    setVariants([]);
  }



  const handleSubmit = async (values) => {
    setLoadingAc(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);

      formData.append('material', values.material);
      formData.append('description', values.description);
      formData.append('price', values.price);

      const imageFiles = values.imageUrls.fileList;
      imageFiles.forEach(file => {
        formData.append('imageUrls', file.originFileObj);
      });

      await addProduct(formData);
      alert('Product added successfully!');
      form.resetFields();
      setIsModalVisibleAdd(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoadingAc(false);
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
      formData.append('price', updatedData.priceU);

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
      }await updateProduct(selectedProductId, formData);
      message.success('Cập nhật hình ảnh thành công!');
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

  const handleRemoveProduct = async () => {

    try {
      await deleteProduct(idDel);
      setIsModalRemove(false);
      message.success('Xóa sản phẩm thành công');
      fetchProducts()



    } catch (error) {
      console.error('Error removing images:', error);
      alert('Xóa sản phẩm thất bại');
    }






  }

  const handleClickRemoveProduct = (product_id) => {

    setIsModalRemove(true);
    setIdDel(product_id);








  }

  const handleOncancelRemove = () => {
    setIsModalRemove(false)
    setIdDel('');
  }

  const handleOncancelRemoveVariants = () => {
    seTIsModalRemoveVariants(false);
    setIdVariant('');
  }

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
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => {
        if (price) {
          // Định dạng giá theo VND
          return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        }
        return 'Không có giá';
      },
    },

    {
      title: 'Tổng số lượng',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <div style={{ display: 'flex' }}>
          <Button style={{ width: 80, backgroundColor: 'blue', marginLeft: 10, color: '#FFFFFF' }} onClick={() => handleProductClickUpdate(record._id)}>Cập nhật</Button>
          <Button style={{ width: 80, backgroundColor: 'green', marginLeft: 10, color: '#FFFFFF' }} onClick={() => handleProductClick(record._id)}>Biến thể</Button>
          <Button style={{ width: 50, backgroundColor: 'red', marginLeft: 10 }} onClick={() => handleClickRemoveProduct(record._id)}><DeleteOutlined /></Button>
        </div>
      )
    }
  ];

  //Remove variants
  const handleClickRemoveVariants = (variantsId) => {
    seTIsModalRemoveVariants(true);
    setIdVariant(variantsId);



  }


  const handleRemoveVariants = async (idVariant) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa biến thể này?");
    
    if (!confirmDelete) {
      return; // Nếu người dùng không xác nhận, thoát hàm
    }
  
    try {
      console.log(idVariant);
      
      await deleteVariantss(idVariant);
      message.success('Xóa biến thể thành công');
  
      setVariants(prevVariants => prevVariants.filter(variant => variant._id !== idVariant));
      setIdVariant('');
      seTIsModalRemoveVariants(false);
    } catch (error) {
      console.error('Error removing variants:', error);
      alert('Xóa biến thể sản phẩm thất bại');
    }
  };


  //Render UI UX

  if (loading) {
    return <LoadingCo />;
  }

  return (
    <div className="container">
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        value={searchText}
        onChange={handleSearch}
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
        dataSource={productSearch && productSearch.length > 0 ? productSearch : product}
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
        {loadingAc && <Spin />}
        <Form form={form} layout="vertical">
          <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}>
            <Input required />
          </Form.Item>
          <Form.Item label="Images" name="imageUrls">
            <Upload accept="image/*" beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Chất liệu" name="material" rules={[{ required: true, message: 'Vui lòng nhập chất liệu!' }]}>
            <Input required />
          </Form.Item>
          <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <Input.TextArea required />
          </Form.Item>

          <Form.Item label="Giá của sản phẩm" name="price" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <Input type='number' required />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" 
            onClick={() => handleSubmit(form.getFieldsValue())}
            >Thêm sản phẩm</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật hình ảnh sản phẩm"
        visible={isModalVisibleUpdateImage}
        onCancel={() => {
          form.resetFields();setIsModalVisibleUpdateImage(false);
          setImageToDel([]);

        }}
        footer={null}
      >

        <h5>Id sản phẩm: {Productss._id}</h5>
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
        <Form form={form} layout="vertical" 

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
          <Form.Item label="Giá của sản phẩm" name="priceU" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <Input type='number' required />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit"
            onClick={() => handleUpdateImages(form.getFieldsValue())}
            >Cập nhật sản phẩm</Button>
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
    setFileList([]); // Reset fileList khi đóng modal
  }}
  footer={null}
  width={'50%'}>
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
    }}
  >
    {/* Hiển thị các biến thể */}
    <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  }}
>
  {variants.map((variant) => (
    <div
      style={{
        border: `1px solid ${variant.color_code || 'green'}`,
        borderRadius: '10px',
        padding: '15px',
        boxSizing: 'border-box',
      }}
      key={variant._id}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <div style={{ flex: 1 }}>
          <p>
            <strong>Màu sắc:</strong> {variant.color} {variant.color_code}
          </p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <img
            src={variant.image}
            alt={`Sản phẩm màu ${variant.color}`}
            width="100"
            style={{ borderRadius: '10px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <p>
            <strong>ID sản phẩm:</strong> {variant.product_id}
          </p>
        </div>
        <div>
          <button
            style={{
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
            onClick={() => handleRemoveVariants(variant._id)}
          >
            Xóa
          </button>
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <p>
          <strong>Kích thước và số lượng tồn kho:</strong>
        </p>
        <Table dataSource={variant.sizes} rowKey="_id" size="small">
          <Table.Column title="Size" dataIndex="size" key="size" />
          <Table.Column title="Số lượng" dataIndex="quantity" key="quantity" />
          <Table.Column
        title="Cập nhật số lượng"
        key="update"
        render={(text, record) => {
          if (editingKey === record._id) {
            return (
              <Space>
                <InputNumber
                  min={0}
                  value={newQuantity}
                  onChange={(value) => setNewQuantity(value)}
                />
                <Button type="primary" onClick={() => handleSaveClick(variant._id,record)}>
                  Lưu
                </Button>
                <Button onClick={handleCancelClick}>Hủy</Button>
              </Space>
            );
          }

          return (
            <Button type="link" onClick={() => handleUpdateClick(record)}>
              Cập nhật
            </Button>
          );
        }}
      />
    </Table>
       
      </div>
    </div>
  ))}
</div>



    {/* Phần form thêm biến thể */}
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="color"
        label="Color"
        rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="color_code"
        label="Color Code"
        rules={[{ required: true, message: 'Vui lòng nhập mã màu' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="sizes"
        label="Sizes"
        rules={[{ required: true, message: 'Vui lòng nhập size và số lượng' }]}
      >
        <Form.List name="sizes">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Form.Item key={field.key}>
                  <Input.Group compact><Form.Item
                      {...field}
                      name={[field.name, 'size']}
                      rules={[{ required: true, message: 'Nhập kích thước' }]}
                    >
                      <Input placeholder="Size" style={{ width: '50%' }} /></Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'quantity']}
                      rules={[{ required: true, message: 'Nhập số lượng' }]}
                    >
                      <InputNumber placeholder="Số lượng" style={{ width: '50%' }} />
                    </Form.Item>
                  </Input.Group>
                  <Button onClick={() => remove(field.name)} type="dashed" style={{ marginTop: '5px' }}>
                    Xóa Size
                  </Button>
                </Form.Item>
              ))}
              <Button type="dashed" onClick={() => add()} style={{ marginTop: '10px' }}>
                Thêm Size
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item
        name="image"
        label="Upload Image"
        rules={[{ required: true, message: 'Vui lòng tải lên 1 ảnh' }]}
      >
        <Upload
          beforeUpload={() => false}
          fileList={fileList}
          onChange={handleUpload}
          listType="picture"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
        </Upload>
      </Form.Item>

      <Button type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
        Tạo Biến Thể
      </Button>
    </Form>
  </div>
</Modal>

     
      {IsModalRemoveVariants && <FormDel isVisible={IsModalRemoveVariants} onclickCan={handleOncancelRemoveVariants} onclickDel={handleRemoveVariants} />}
      {IsModalRemove && <FormDel isVisible={IsModalRemove} onclickCan={handleOncancelRemove} onclickDel={handleRemoveProduct} />}
    </div>
  );
};

export default ProductManager;