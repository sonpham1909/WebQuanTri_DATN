import React, { useContext } from 'react';
 // Nhập AppContext
import './Header.css'; // Nhập CSS nếu cần
import { AppContext } from '../../services/AppContext';
import { Image } from 'antd';
import { PoweroffOutlined } from '@ant-design/icons';

const Header = ({handleLogout}) => {
  const { state } = useContext(AppContext); // Lấy thông tin người dùng từ Context

  return (
    <header className="header">
      {/* <h1 className="header-title">StyleLife</h1> */}
      <img src="logoShopHorizal.png" alt="Logo" style={{ width: 100, height: 70 }} />
      <div className="user-info">
        


        {state.user && (
          <>
            <img src={state.user.avatar} alt="User Avatar" className="user-avatar" />
            <span className="user-name">{state.user.username}</span>
          </>
        )}
        <PoweroffOutlined onClick={handleLogout}/>
      </div>
    </header>
  );
};

export default Header;
