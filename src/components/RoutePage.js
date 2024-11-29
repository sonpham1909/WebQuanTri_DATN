import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './homePage/Home';
import Login from './LoginPage/Login';
import SubcategoryManager from './SubcategoryManager/SubcategoryManager';
import { socket } from '../services/socketio';

const App = () => {
    // Lắng nghe thông báo từ server thông qua socket
  useEffect(() => {
    socket.on('pushnotification', (data) => {
      console.log('Notification received:', data);

      // Hiển thị thông báo cục bộ
   
    });

    // Cleanup khi component bị unmount
    return () => {
      socket.off('pushnotification');
      socket.off('connect');
    };
  }, []);
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home/*" element={<Home />} />
            <Route path="/home/subcategory" element={<SubcategoryManager />} /> 
        </Routes>
    );
};

export default App;
