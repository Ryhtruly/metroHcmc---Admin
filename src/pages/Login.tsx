import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Checkbox, ConfigProvider } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import type { LoginResponse } from '../types/auth.type';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await axiosClient.post<any, LoginResponse>('/auth/login', values);
      if (res.success && res.user.role === 'ADMIN') {
        localStorage.setItem('admin_token', res.token);
        message.success('Chào mừng Admin quay trở lại!');
        navigate('/');
      } else {
        message.error('Bạn không có quyền truy cập Admin!');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Đăng nhập thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: { fontFamily: "'Inter', sans-serif", colorPrimary: '#003eb3' },
        components: {
          Input: { controlHeight: 48, borderRadius: 8 },
          Button: { controlHeight: 52, borderRadius: 8, fontWeight: 600 }
        }
      }}
    >
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        
        {/* --- CỘT TRÁI: FORM TRẮNG (450px) --- */}
        <div style={{ 
          flex: '0 0 450px', 
          background: '#fff', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',     
          position: 'relative',
          zIndex: 10,
          boxShadow: '5px 0 30px rgba(0,0,0,0.05)' // Thêm bóng nhẹ ngăn cách
        }}>
          
          {/* Wrapper nội dung */}
          <div style={{ width: '100%', maxWidth: 360 }}>
            
            {/* Header: Logo & Tiêu đề */}
            <div style={{ marginBottom: 40 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  {/* LOGO HÌNH ẢNH */}
                  <div style={{ 
                    width: 48, height: 48, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    borderRadius: 10, 
                    overflow: 'hidden' 
                  }}>
                    <img 
                      src="/1992571.png" 
                      alt="Metro Admin Logo" 
                      style={{ 
                        maxHeight: '100%', maxWidth: '100%', 
                        objectFit: 'contain' 
                      }} 
                    />
                  </div>
                  {/* Tên hệ thống */}
                  <span style={{ 
                    fontSize: 20, fontWeight: 900, color: '#003eb3', 
                    letterSpacing: 0.5, fontFamily: "'Inter', sans-serif" 
                  }}>
                    METRO ADMIN
                  </span>
               </div>

               <Title level={1} style={{ margin: 0, fontWeight: 800, fontSize: 30, fontFamily: "'Inter', sans-serif" }}>
                 Đăng nhập
               </Title>
               <Text type="secondary" style={{ fontSize: 15, fontFamily: "'Inter', sans-serif" }}>
                 Chào mừng quay trở lại hệ thống.
               </Text>
            </div>

            {/* Form Nhập liệu */}
            <Form name="login_form" onFinish={onFinish} layout="vertical" size="large" requiredMark={false}>
              <Form.Item label="Email công vụ" name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
                <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="admin@metro.local" />
              </Form.Item>

              <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]} style={{ marginBottom: 12 }}>
                <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="••••••••" />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ tôi</Checkbox>
                </Form.Item>
                <a
                  onClick={() => navigate('/forgot-password')}
                  className="hover-link"
                  style={{ 
                    fontWeight: 600, 
                    fontFamily: "'Inter', sans-serif", 
                    color: '#003eb3',
                    cursor: 'pointer' 
                  }}
                  >
                  Quên mật khẩu?
                </a>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block 
                  className="login-btn" // Class cho hiệu ứng hover/click từ CSS
                  style={{ 
                    fontSize: 16, 
                    background: '#003eb3', 
                    boxShadow: '0 4px 12px rgba(0, 62, 179, 0.3)',
                    border: 'none'
                  }}
                >
                  Đăng nhập <ArrowRightOutlined />
                </Button>
              </Form.Item>
            </Form>

            <div style={{ marginTop: 40, textAlign: 'center' }}>
               <Text type="secondary" style={{ fontSize: 12 }}>© 2025 HCMC Metro Management System</Text>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: ẢNH FULL + HIỆU ỨNG LAN MÀU --- */}
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          background: '#001529',
          overflow: 'hidden'
        }}>
          {/* 1. Ảnh nền gốc */}
          <div style={{
             position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
             backgroundImage: 'url(/Ticket-fees-of-Saigon-Metro.jpg)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
          }} />
          
          {/* 2. Lớp phủ màu xanh nhẹ (Tint) */}
          <div style={{
             position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
             background: 'rgba(0, 62, 179, 0.2)'
          }} />

          {/* 3. Gradient Lan Tỏa (Trắng -> Trong suốt) */}
          {/* Mẹo: left: -1px để che khe hở giữa 2 cột */}
          <div style={{
             position: 'absolute', top: 0, bottom: 0, left: -1, 
             width: '30%', // Lan ra 30% chiều rộng của ảnh
             background: 'linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.8) 20%, rgba(255,255,255,0) 100%)',
             zIndex: 1,
             pointerEvents: 'none'
          }} />

          {/* 4. Chữ trang trí bên phải */}
          <div style={{ 
             position: 'absolute', bottom: 60, right: 60, color: 'white', textAlign: 'right', zIndex: 2 
          }}>
             <h1 style={{ 
               fontSize: 60, margin: 0, fontWeight: 800, lineHeight: 1.1, 
               textShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: "'Inter', sans-serif" 
             }}>
                Metro Line 1 <br/>
                <span style={{ opacity: 0.9 }}>Bến Thành - Suối Tiên</span>
             </h1>
             <p style={{ 
               fontSize: 18, marginTop: 20, opacity: 0.9, maxWidth: 500, lineHeight: 1.6, 
               marginLeft: 'auto', textShadow: '0 1px 5px rgba(0,0,0,0.3)', fontFamily: "'Inter', sans-serif" 
             }}>
                Hệ thống quản lý vận hành hiện đại, đảm bảo an toàn và trải nghiệm tốt nhất cho hành khách.
             </p>
          </div>
        </div>

      </div>
    </ConfigProvider>
  );
};

export default Login;