import React from 'react';
import LoginPage from './components/LoginPage/Login';
import ReactDOM from 'react-dom';
 // Nếu LoginPage.js nằm trong cùng thư mục với file hiện tại
 import App from './components/RoutePage';
import { BrowserRouter } from 'react-router-dom';


ReactDOM.render(
  <BrowserRouter>
      <App />
  </BrowserRouter>,
  document.getElementById('root')
);

