import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 前端路由入口 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
