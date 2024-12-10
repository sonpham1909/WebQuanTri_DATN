import React, { useState, useEffect, useContext } from 'react';
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
import MessageManager from '../MessageManager/MessageManager';
import axios from 'axios';
import { AppContext } from '../../services/AppContext';
import NotifiManager from '../NotifiManager/NotifiManager';



function Home() {
  const location = useLocation();
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('item0');
  const navigate = useNavigate();
  const { setState } = useContext(AppContext);

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
    try {
      const response = await fetch('http://localhost:3000/v1/auth/logout', {
        method: 'POST',
        credentials: 'include', // Để gửi cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Đăng xuất thất bại: ${errorData.message || 'Lỗi không xác định'}`);
      }

      const data = await response.json();
      console.log(data.message);

      // Xoá token và điều hướng
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
      case 'item8':
        return <MessageManager />;
      case 'item9':
        return <NotifiManager />;

      default:
        return 'Không tìm thấy nội dung';
    }
  };

  return (
    <div>
      <Header handleLogout={handleLogout} />
      <div style={{ display: 'flex' }}>
        <div className="sidebar">
          <ul>
            <h4 className='titleul'>| Trang chủ</h4>
            <li
              className={selectedSidebarItem === 'item0' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item0')}
            >
              Thống kê
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
            <li
              className={selectedSidebarItem === 'item9' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item9')}
            >
              Quản lý thông báo
            </li>
            <li
              className={selectedSidebarItem === 'item8' ? 'active' : ''}
              onClick={() => handleSidebarItemClick('item8')}
            >
              Tin nhắn
            </li>
          </ul>

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
