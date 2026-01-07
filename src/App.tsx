import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp } from 'antd'; // import Ant Design App

// 1. IMPORT CÁC COMPONENT (Đã loại bỏ trùng lặp)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';

// Quản lý
import TicketManager from './pages/TicketManager';
import StationManager from './pages/StationManager';
import LineManager from './pages/LineManager';
import PromotionManager from './pages/PromotionManager';
import GiftcodeManager from "./pages/GiftcodeManager";

// Khác
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Appearance from './pages/Appearance';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CustomerManager from './pages/CustomerManager';

// Component bảo vệ: Kiểm tra token
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    // <AntApp> phải bọc ngoài cùng để cung cấp Context cho các hook như message/notification
    <AntApp>
      <BrowserRouter>
        <Routes>
          
          {/* 🔹 1. PUBLIC ROUTES (Không cần đăng nhập) */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Trang reset cần token (từ email), không cần token admin */}
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* 🔹 2. PROTECTED ROUTES (Cần token admin) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* Trang chủ (Dashboard) */}
            <Route index element={<Dashboard />} />

            {/* Các trang Quản lý */}
            <Route path="lines" element={<LineManager />} />
            <Route path="stations" element={<StationManager />} />
            <Route path="tickets" element={<TicketManager />} />
            <Route path="promotions" element={<PromotionManager />} />
            <Route path="giftcodes" element={<GiftcodeManager />} />
            <Route path="customers" element={<CustomerManager />} />
            
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="appearance" element={<Appearance />} />
            
          </Route>

          {/* 🔹 3. ROUTE KHÔNG TÌM THẤY (Mọi đường dẫn không khớp sẽ chuyển về Dashboard/Login) */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AntApp>
  );
}

export default App;