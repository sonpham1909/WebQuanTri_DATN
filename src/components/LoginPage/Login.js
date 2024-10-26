import React, { useContext, useState } from 'react';
import axios from 'axios';
import './Login.css';
import { Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../services/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setState } = useContext(AppContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(
            'http://localhost:3000/v1/auth/login',
            {
                username,
                password
            },
            { withCredentials: true } // Đảm bảo rằng cookie được gửi
        );

        // Kiểm tra phản hồi từ máy chủ
        console.log('Login Response:', response.data);

        // Lưu token vào localStorage
        localStorage.setItem('token', response.data.accessToken);

        // Lưu userId vào localStorage và trạng thái
        const userId = response.data._id; // Đảm bảo rằng _id là trường đúng
        localStorage.setItem('userId', userId); // Lưu userId vào localStorage

        setState((prevState) => ({
            ...prevState,
            user: { _id: userId, username: response.data.username, avatar: response.data.avatar }
        }));

        setError(null);
        alert('Login Success');
        navigate('/Home');

    } catch (error) {
        console.error('Login error:', error);
        setError('Invalid username or password');
    }
};


  return (
    <div className='container'>
      <div className="login-container">
        <img src="logoShopHorizal.png" alt="Logo" style={{ width: 200, height: 200 }} />
        <h2 className='title'>Login with admin</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;