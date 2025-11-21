import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const TIMEOUT_MS = 10 * 60 * 1000; 

const IdleTimer: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timerRef = useRef<any>(null);

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsModalOpen(false);
    navigate('/login');
  };

  const resetTimer = () => {
    if (isModalOpen) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsModalOpen(true);
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'wheel', 'mousedown', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', color: '#faad14', gap: 8 }}>
          <ExclamationCircleOutlined style={{ fontSize: 24 }} />
          <span>Phiên làm việc đã hết hạn</span>
        </div>
      }
      open={isModalOpen}
      onOk={handleLogout}
      onCancel={handleLogout} 
      okText="Đăng nhập lại"
      cancelButtonProps={{ style: { display: 'none' } }} 
      closable={false} 
      maskClosable={false}
      centered
    >
      <p style={{ fontSize: 16, marginTop: 16 }}>
        Bạn đã không hoạt động trong 10 phút. Vì lý do bảo mật, hệ thống đã tự động đăng xuất.
      </p>
      <p>Vui lòng nhấn nút bên dưới để quay lại màn hình đăng nhập.</p>
    </Modal>
  );
};

export default IdleTimer;