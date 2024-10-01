import React from 'react';
import LoginPage from './components/LoginPage/Login';
import ReactDOM from 'react-dom';
 // Nếu LoginPage.js nằm trong cùng thư mục với file hiện tại
 import App from './components/RoutePage';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './services/AppContext';


ReactDOM.render(
  <BrowserRouter>
  <AppProvider>
      <App />
  </AppProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

