import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import TicketManager from './pages/TicketManager';
import PromotionManager from './pages/PromotionManager';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Appearance from './pages/Appearance';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword'; // THÊM TRANG RESET

// Component bảo vệ
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔹 PUBLIC ROUTES – không cần đăng nhập */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Trang reset cần token */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🔹 PROTECTED ROUTES – cần token */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="lines" element={<div>🚧 Trang Quản lý Tuyến (Đang xây dựng)</div>} />
          <Route path="stations" element={<div>🚧 Trang Quản lý Ga (Đang xây dựng)</div>} />
          <Route path="tickets" element={<TicketManager />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="promotions" element={<PromotionManager />} />
          <Route path="settings" element={<Settings />} />
          <Route path="appearance" element={<Appearance />} />
        </Route>

        {/* 🔹 ROUTE KHÔNG TÌM THẤY */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
