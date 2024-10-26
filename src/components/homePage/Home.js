import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import Header from '../Header/Header';
import Usermanager from '../UserManager/Usermanager';
import Dardboard from '../Dartboard/Dardboard';
import CategoryManager from '../CategoryManager/CategoryManager';
import ProductManager from '../ProductsManager/ProductManager';
import BillManager from '../BilManager/BillManager';
import AddressManager from '../AddressManager/AddressManager';
import ReviewManager from '../ReviewManager/ReviewManager';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentMethodManager from '../PaymentMethodManager/PaymentMethodManager';


function Home() {
  const location = useLocation();
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('item1');
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra nếu có state từ màn hình khác
    if (location.state && location.state.selectedItem) {
      setSelectedSidebarItem(location.state.selectedItem);
    }
  }, [location.state]);

  const handleSidebarItemClick = (itemId) => {
    setSelectedSidebarItem(itemId);
  };

const handleLogout = async () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Log token để kiểm tra

    try {
        await fetch('http://localhost:3000/v1/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Đảm bảo token được thêm vào
            },
        });

        localStorage.removeItem('token');
        navigate('/login');
    } catch (error) {
        console.error('Đăng xuất thất bại:', error);
    }
};


  const getContent = (itemId) => {
    switch (itemId) {
      case 'item1':
        return <Usermanager />;
      case 'item2':
        return <CategoryManager />;
      case 'item0':
        return <Dardboard />;
      case 'item3':
        return <ProductManager />;
      case 'item4':
        return <BillManager />;
      case 'item5':
        return <AddressManager />;
        case 'item6':
          return <ReviewManager />;
          case 'item7':
            return <PaymentMethodManager />;
      default:
        return 'Không tìm thấy nội dung';
    }
  };

  return (
    <div>
      <Header />
      <div style={{ display: 'flex' }}>
        <div className="sidebar">
          <ul>
            <li
              className={selectedSidebarItem === 'item0' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item0')}
            >
              Trang chủ
            </li>

            <h4 className='titleul'>| Quản lý</h4>
            <li
              className={selectedSidebarItem === 'item1' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item1')}
            >
              Quản lý người dùng
            </li>
            <li
              className={selectedSidebarItem === 'item2' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item2')}
            >
              Quản lý danh mục
            </li>
            <li
              className={selectedSidebarItem === 'item3' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item3')}
            >
              Quản lý sản phẩm
            </li>
            <li
              className={selectedSidebarItem === 'item4' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item4')}
            >
              Quản lý đơn hàng
            </li>
            <li
              className={selectedSidebarItem === 'item5' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item5')}
            >
              Quản lý địa chỉ
            </li>
            <li
              className={selectedSidebarItem === 'item6' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item6')}
            >
              Quản lý đánh giá
            </li>
            <li
              className={selectedSidebarItem === 'item7' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item7')}
            >
              Quản lý thanh toán
            </li>
          </ul>
          {/* Nút đăng xuất */}
          <button className="logout-button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
        <div className="container">
          <div className="content">
            {selectedSidebarItem ? (
              getContent(selectedSidebarItem)
            ) : (
              <p>Vui lòng chọn một mục từ sidebar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
