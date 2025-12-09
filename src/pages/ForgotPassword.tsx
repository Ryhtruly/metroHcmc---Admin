import React, { useState } from 'react';
import { Form, Input, Button, Typography, ConfigProvider, App } from 'antd';
import { MailOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res: any = await axiosClient.post('/auth/forgot-password', { email: values.email });
      if (res.success) {
        message.success(res.message);
        // 👇 CHUYỂN HƯỚNG SANG TRANG NHẬP TOKEN
        navigate('/reset-password'); 
      } else {
        message.error(res.message || 'Email không tồn tại');
      }
    } catch (err: any) {
      message.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { fontFamily: "'Inter', sans-serif", colorPrimary: '#003eb3' } }}>
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
        <div style={{ width: 400, background: '#fff', padding: 40, borderRadius: 10 }}>
          <Title level={2} style={{ textAlign: 'center' }}>Quên mật khẩu</Title>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" rules={[{ required: true }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">Gửi yêu cầu</Button>
          </Form>
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Quay lại</a>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};
export default ForgotPassword;