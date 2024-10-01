import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './homePage/Home';
import Login from './LoginPage/Login';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home/*" element={<Home />} />
        </Routes>
    );
};

export default App;
