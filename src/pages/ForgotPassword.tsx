import React, { useState } from 'react';
import { Form, Input, Button, Typography, ConfigProvider, App } from 'antd';
import { MailOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

// ============================
// Type response backend trả về
// ============================
type ForgotResponse = {
  success: boolean;
  message?: string;
  reset_token?: string;
};

const ForgotPassword: React.FC = () => {
  const { message } = App.useApp();    // 👈 THÊM DÒNG NÀY
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const onFinish = async (values: any) => {
  setLoading(true);

  try {
    const res = await axiosClient.post('/auth/forgot-password', {
      email: values.email,
    });

    // Normalize response
    const api =
      (res as any).fn_auth_forgot_password_json ?? res;

    if (!api.success) {
      message.error(api.message || 'Email không tồn tại!');
      return;
    }

    message.success('Yêu cầu thành công! Kiểm tra email để đặt lại mật khẩu.');

    if (api.reset_token) {
      navigate(`/reset-password/${api.reset_token}`);
    } else {
      navigate('/reset-password');
    }

  } catch (err: any) {
    // -----------------------
    //  FIX LỖI KHÔNG HIỆN MESSAGE
    // -----------------------
    const apiError =
      err.response?.data?.fn_auth_forgot_password_json ??
      err.response?.data ??
      null;

    message.error(apiError?.message || 'Email không tồn tại!');

    console.log("ForgotPassword ERROR:", apiError);
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
        
        {/* LEFT COLUMN */}
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

            {/* HEADER */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src="/1992571.png"
                    alt="Metro Admin Logo"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: '#003eb3',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  METRO ADMIN
                </span>
              </div>

              <Title level={1} style={{ margin: 0, fontWeight: 800, fontSize: 30 }}>
                Quên mật khẩu
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Nhập email của bạn để đặt lại mật khẩu.
              </Text>
            </div>

            {/* FORM */}
            <Form layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
              <Form.Item
                label="Email công vụ"
                name="email"
                rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="admin@metro.local"
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
                  Gửi yêu cầu <ArrowRightOutlined />
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <a
                  onClick={() => navigate('/login')}
                  style={{ cursor: 'pointer', color: '#003eb3', fontWeight: 600 }}
                >
                  Quay lại đăng nhập
                </a>
              </div>
            </Form>

          </div>
        </div>

        {/* RIGHT COLUMN */}
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

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 62, 179, 0.2)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: -1,
              width: '30%',
              background:
                'linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.8) 20%, rgba(255,255,255,0) 100%)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        </div>

      </div>
    </ConfigProvider>
  );
};

export default ForgotPassword;

