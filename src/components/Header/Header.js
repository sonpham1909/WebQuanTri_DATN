import React, { useContext } from 'react';
 // Nhập AppContext
import './Header.css'; // Nhập CSS nếu cần
import { AppContext } from '../../services/AppContext';

const Header = () => {
  const { state } = useContext(AppContext); // Lấy thông tin người dùng từ Context

  return (
    <header className="header">
      <h1 className="header-title">StyleLife</h1>
      <div className="user-info">
        {state.user && (
          <>
            <img src={state.user.avatar} alt="User Avatar" className="user-avatar" />
            <span className="user-name">{state.user.username}</span>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
