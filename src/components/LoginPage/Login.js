import React, { useContext, useState, useEffect } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../services/AppContext';
import { socket } from '../../services/socketIo';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Welcome to StyleLife Shop Admin';

  const { setState } = useContext(AppContext);

  // Hiệu ứng gõ chữ lặp lại
  useEffect(() => {
    const startTypingEffect = () => {
      let index = 0;
      const typingInterval = setInterval(() => {
        setDisplayText((prev) => prev + fullText[index]);
        index += 1;

        // Khi gõ xong toàn bộ chữ, dừng lại và khởi động lại sau 2 giây
        if (index === fullText.length) {
          clearInterval(typingInterval); // Dừng gõ
          setTimeout(() => {
            setDisplayText(''); // Đặt lại chữ để gõ lại từ đầu
            startTypingEffect(); // Khởi động lại hiệu ứng
          }, 2000); // Thời gian dừng trước khi lặp lại
        }
      }, 150); // Tốc độ gõ chữ (150ms mỗi ký tự)
    };

    startTypingEffect(); // Bắt đầu hiệu ứng khi component mount

    return () => clearInterval(startTypingEffect); // Dọn dẹp interval khi component unmount
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/v1/auth/login_admin', { username, password }, { withCredentials: true });

      localStorage.setItem('token', response.data.accessToken);
      const userId = response.data._id;
      localStorage.setItem('userId', userId);

      setState((prevState) => ({
        ...prevState,
        user: { _id: userId, username: response.data.username, avatar: response.data.avatar },
      }));

     

      setError(null);
      navigate('/Home');
    } catch (error) {

      // Kiểm tra nếu server trả về response và chứa message
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Invalid username or password';

      setError(errorMessage);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100vw',
      minHeight: '100vh',
    }}>
      {/* Login form section */}
      <div className="login-container">
        <div className="login-form-wrapper">
          <img src="logoShopHorizal.png" alt="Logo" style={{ width: 80, height: 80, marginBottom: 20 }} />
          <h2 className="title">Login with Admin</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username:</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>

      {/* Right-side background image section with typing effect */}
      <div className="right-background">
        <div className="typing-container">{displayText}</div>
      </div>
    </div>
  );
};

export default Login;
