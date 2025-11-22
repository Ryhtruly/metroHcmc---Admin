import React, { useState } from 'react';
import { Form, Input, Button, Typography, ConfigProvider, App, message } from 'antd';
import { LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { token } = useParams(); // lấy token từ URL
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/reset-password', {
        token,
        new_password: values.password
      });

      const apiRes = (res as any).fn_auth_reset_password_json ?? res;

      if (!apiRes.success) {
        message.error(apiRes.message || 'Không thể đặt lại mật khẩu!');
        return;
      }

      message.success('Đặt lại mật khẩu thành công!');
      navigate('/login');

    } catch (err: any) {
      const apiError =
        err.response?.data?.fn_auth_reset_password_json ??
        err.response?.data ??
        null;

      message.error(apiError?.message || 'Lỗi hệ thống');
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
          Button: { controlHeight: 52, borderRadius: 8, fontWeight: 600 },
        },
      }}
    >
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        
        {/* LEFT PANEL */}
        <div
          style={{
            flex: '0 0 450px',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '5px 0 30px rgba(0,0,0,0.05)',
            zIndex: 10,
          }}
        >
          <div style={{ width: '100%', maxWidth: 360 }}>

            <Title level={1} style={{ margin: 0, fontWeight: 800, fontSize: 30 }}>
              Đặt lại mật khẩu
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Text>

            <Form layout="vertical" size="large" onFinish={onFinish} style={{ marginTop: 30 }}>
              
              <Form.Item
                label="Mật khẩu mới"
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Ít nhất 6 ký tự!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="••••••••"
                />
              </Form.Item>

              <Form.Item
                label="Nhập lại mật khẩu"
                name="confirm"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu không trùng khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="••••••••"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    fontSize: 16,
                    background: '#003eb3',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 62, 179, 0.3)',
                  }}
                >
                  Xác nhận <ArrowRightOutlined />
                </Button>
              </Form.Item>

            </Form>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: '#001529',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(/Ticket-fees-of-Saigon-Metro.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

      </div>
    </ConfigProvider>
  );
};

export default ResetPassword;
