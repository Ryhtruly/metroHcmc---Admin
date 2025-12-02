import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'antd/dist/reset.css';
import './i18n/i18n';
import { ThemeProvider } from './contexts/ThemeContext'; 
import { App as AntdApp } from 'antd'; // 👈 THÊM DÒNG NÀY
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 👇 BỌC TẤT CẢ BẰNG ANT DESIGN APP */}
    <AntdApp>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AntdApp>
  </React.StrictMode>,
)
