import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './homePage/Home';
import Login from './LoginPage/Login';
import SubcategoryManager from './SubcategoryManager/SubcategoryManager';


const App = () => {
    // Lắng nghe thông báo từ server thông qua socket

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
