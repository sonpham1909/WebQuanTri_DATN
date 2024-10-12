import React, { useState } from 'react';

// Dữ liệu mẫu cho các biến thể sản phẩm
const productVariants = [
  { size: 'S', color: 'Đen', price: 200000, quantity: 10 },
  { size: 'M', color: 'Đen', price: 220000, quantity: 15 },
  { size: 'L', color: 'Đen', price: 240000, quantity: 8 },
  { size: 'S', color: 'Trắng', price: 210000, quantity: 12 },
  { size: 'M', color: 'Trắng', price: 230000, quantity: 5 },
  { size: 'L', color: 'Trắng', price: 250000, quantity: 7 },
];

const ProductVariants = () => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    updateSelectedVariant(size, selectedColor);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    updateSelectedVariant(selectedSize, color);
  };

  const updateSelectedVariant = (size, color) => {
    if (size && color) {
      const variant = productVariants.find(v => v.size === size && v.color === color);
      setSelectedVariant(variant);
    }
  };

  return (
    <div>
      <h3>Chọn Kích Cỡ</h3>
      {['S', 'M', 'L'].map(size => (
        <button key={size} onClick={() => handleSizeSelect(size)}>
          {size}
        </button>
      ))}

      <h3>Chọn Màu</h3>
      {['Đen', 'Trắng'].map(color => (
        <button key={color} onClick={() => handleColorSelect(color)}>
          {color}
        </button>
      ))}

      {selectedVariant && (
        <div>
          <h4>Thông tin Biến Thể Đã Chọn:</h4>
          <p>Kích cỡ: {selectedVariant.size}</p>
          <p>Màu: {selectedVariant.color}</p>
          <p>Số lượng: {selectedVariant.quantity}</p>
          <p>Giá: {selectedVariant.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
        </div>
      )}
    </div>
  );
};


// Component chính để hiển thị
const BillManager1 = () => {
  return (
    <div>
      <h1>Sản phẩm của chúng tôi</h1>
      <ProductVariants />
    </div>
  );
};

// Xuất component App1
export default BillManager1;
