import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import TicketManager from './pages/TicketManager';
import PromotionManager from './pages/PromotionManager'; // Import trang mới
import Statistics from './pages/Statistics'; // Import trang mới
import Settings from './pages/Settings';
import Appearance from './pages/Appearance';

// Component bảo vệ: Kiểm tra token
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  // Nếu không có token -> chuyển hướng về Login
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Route Công khai */}
        <Route path="/login" element={<Login />} />

        {/* 2. Route Bảo mật (Cần đăng nhập) */}
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

          {/* Các trang con (Vĩ sẽ làm sau) */}
          <Route path="lines" element={<div>🚧 Trang Quản lý Tuyến (Đang xây dựng)</div>} />
          <Route path="stations" element={<div>🚧 Trang Quản lý Ga (Đang xây dựng)</div>} />
          <Route path="tickets" element={<TicketManager />} />
          <Route path="statistics" element={<Statistics />} />   {/* Trang thống kê */}
          <Route path="promotions" element={<PromotionManager />} /> {/* Trang khuyến mãi */}
          <Route path="settings" element={<Settings />} />
          <Route path="appearance" element={<Appearance />} />
        </Route>

        {/* Route không tìm thấy -> Quay về dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;