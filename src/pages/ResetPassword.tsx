import React, { useState } from 'react';
import { Form, Input, Button, Typography, ConfigProvider, App } from 'antd';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res: any = await axiosClient.post('/auth/reset-password', {
        token: values.token,
        new_password: values.password
      });

      if (res.success) {
        message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        message.error(res.message || 'Token sai hoặc hết hạn');
      }
    } catch (err: any) {
      message.error('Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { fontFamily: "'Inter', sans-serif", colorPrimary: '#003eb3' } }}>
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
        <div style={{ width: 400, background: '#fff', padding: 40, borderRadius: 10 }}>
          <Title level={2} style={{ textAlign: 'center' }}>Đặt lại mật khẩu</Title>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 20 }}>
            Nhập Token từ Terminal Backend
          </Text>
          
          <Form layout="vertical" onFinish={onFinish}>
            {/* Ô NHẬP TOKEN */}
            <Form.Item name="token" label="Mã Token" rules={[{ required: true, message: 'Vui lòng nhập Token' }]}>
              <Input prefix={<KeyOutlined />} placeholder="Paste token vào đây..." size="large" />
            </Form.Item>
            
            <Form.Item name="password" label="Mật khẩu mới" rules={[{ required: true, min: 6 }]}>
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>
            
            <Button type="primary" htmlType="submit" loading={loading} block size="large">Xác nhận</Button>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
};
export default ResetPassword;