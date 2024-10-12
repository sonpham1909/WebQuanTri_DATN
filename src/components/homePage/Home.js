import React, { useState } from 'react';
import './Sidebar.css';
import Header from '../Header/Header';
import Usermanager from '../UserManager/Usermanager';
import Dardboard from '../Dartboard/Dardboard';
import CategoryManager from '../CategoryManager/CategoryManager';
import ProductManager from '../ProductsManager/ProductManager';
import BillManager from '../BilManager/BillManager';
import AddressManager from '../AddressManager/AddressManager';
import { useNavigate } from 'react-router-dom';
function Home() {
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('item1');

  const handleSidebarItemClick = (itemId) => {
    setSelectedSidebarItem(itemId);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Gửi yêu cầu đăng xuất (nếu cần)
      await fetch('http://localhost:3000/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Xoá token khỏi localStorage
      localStorage.removeItem('token');

      // Sử dụng React Router để điều hướng
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
          </ul>
        


        </div>
        <div className="container">
          <div className="content">
            {selectedSidebarItem ? (
              <p>{getContent(selectedSidebarItem)}</p>
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
