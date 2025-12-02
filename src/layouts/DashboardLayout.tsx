import React, { useState } from 'react';
import { 
  Layout, Menu, Button, theme, Badge, Popover, List, Avatar, Typography, Modal, Descriptions 
} from 'antd';
import { 
  DashboardOutlined, BarChartOutlined, EnvironmentOutlined, LogoutOutlined,
  QrcodeOutlined, SettingOutlined, GiftOutlined, BellOutlined, NotificationOutlined,
  BgColorsOutlined, InfoCircleOutlined, ClockCircleOutlined, CheckOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'; 
import IdleTimer from '../components/IdleTimer';

dayjs.extend(relativeTime);
dayjs.locale('vi'); 

import { useTheme } from '../contexts/ThemeContext'; 
import { useTranslation } from 'react-i18next';     
import { useNotifications } from '../hooks/useNotifications';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { siderColor, contentColor } = useTheme(); 
  const { t } = useTranslation();      
  const { token: {  borderRadiusLG } } = theme.useToken();

  // Data & Logic từ Hook mới
  const { 
    notifications, unreadCount, loading, refetch, markAsRead, markAllAsRead 
  } = useNotifications();
  
  // State Modal Chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<any>(null);

  // State đóng mở Popover
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  // Hàm mở Modal xem chi tiết & Đánh dấu đã đọc
  const handleViewDetail = (item: any) => {
    markAsRead(item.ann_id); // <--- Đánh dấu đã đọc ngay khi xem
    setSelectedAnn(item);
    setIsModalOpen(true);
    setIsPopoverOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsPopoverOpen(newOpen);
  };

  // Helper đoán màu icon
  const getAnnType = (title: string) => {
    const lower = title ? title.toLowerCase() : '';
    if (lower.includes('bảo trì') || lower.includes('lỗi') || lower.includes('cảnh báo')) 
      return { color: '#ff4d4f', icon: <InfoCircleOutlined /> }; 
    if (lower.includes('khuyến mãi') || lower.includes('ưu đãi')) 
      return { color: '#faad14', icon: <GiftOutlined /> }; 
    return { color: '#1890ff', icon: <NotificationOutlined /> }; 
  };

  // Nội dung Popover Thông báo
  const notificationContent = (
    <div style={{ width: 320 }}>
      <div style={{ 
        padding: '8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 8, 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <span style={{ fontWeight: 'bold' }}>Thông báo mới ({unreadCount})</span>
        
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <Button 
              type="link" size="small" icon={<CheckOutlined />} 
              onClick={markAllAsRead}
            >
              Đọc hết
            </Button>
          )}
          <Button type="link" size="small" onClick={refetch} loading={loading}>Làm mới</Button>
        </div>
      </div>
      
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        loading={loading}
        locale={{ emptyText: 'Không có thông báo mới' }}
        renderItem={(item) => {
          const typeInfo = getAnnType(item.title);
          const isRead = item.isRead; // Lấy trạng thái đã đọc

          return (
            <List.Item 
              style={{ 
                padding: '12px 8px', cursor: 'pointer', transition: 'background 0.2s',
                // Style khác biệt giữa Đã đọc và Chưa đọc
                backgroundColor: isRead ? 'transparent' : '#f0f7ff',
                opacity: isRead ? 0.6 : 1
              }}
              className="notification-item"
              onClick={() => handleViewDetail(item)}
            >
              <List.Item.Meta
                avatar={
                  // Nếu chưa đọc thì hiện chấm đỏ trên avatar
                  <Badge dot={!isRead} offset={[-2, 2]} color="red">
                    <Avatar style={{ backgroundColor: typeInfo.color }} icon={typeInfo.icon} />
                  </Badge>
                }
                title={
                  <Text style={{ fontSize: 13, fontWeight: isRead ? 400 : 700 }}>
                    {item.title}
                  </Text>
                }
                description={
                  <div style={{ fontSize: 11, color: '#888' }}>
                    <div style={{ marginBottom: 4, maxHeight: 32, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.content_md}
                    </div>
                    <ClockCircleOutlined style={{ fontSize: 10, marginRight: 4 }} />
                    {dayjs(item.created_at).fromNow()}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      <Button 
        type="link" block size="small" style={{ marginTop: 8 }} 
        onClick={() => {
            navigate('/settings');
            setIsPopoverOpen(false);
        }}
      >
        Quản lý tất cả thông báo
      </Button>
    </div>
  );

  // Menu items
  const items: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: t('dashboard'), onClick: () => navigate('/') },
    { key: '/statistics', icon: <BarChartOutlined />, label: t('stats_report'), onClick: () => navigate('/statistics') },
    { type: 'divider' },
    { 
      key: '/lines', icon: <EnvironmentOutlined />, label: t('infrastructure'), 
      children: [
        { key: '/lines', label: t('lines'), onClick: () => navigate('/lines') },
        { key: '/stations', label: t('stations'), onClick: () => navigate('/stations') }
      ]
    },
    { key: '/tickets', icon: <QrcodeOutlined />, label: t('tickets_pricing'), onClick: () => navigate('/tickets') },
    { key: '/promotions', icon: <GiftOutlined />, label: t('promotions'), onClick: () => navigate('/promotions') },
    { type: 'divider' },
    { key: '/settings', icon: <SettingOutlined />, label: t('settings_log'), onClick: () => navigate('/settings') },
    { key: '/appearance', icon: <BgColorsOutlined />, label: t('appearance'), onClick: () => navigate('/appearance') },
    { key: '/giftcodes', icon: <GiftOutlined />, label: 'Giftcode', onClick: () => navigate('/giftcodes') },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <IdleTimer />
      <Sider 
        collapsible breakpoint="lg" collapsedWidth="0"
        style={{ 
          background: `linear-gradient(170deg, ${siderColor || '#111827'} 20%, #000000 100%)`,
          boxShadow: '4px 0 10px rgba(0,0,0,0.1)', transition: 'all 0.3s ease'
        }}
        trigger={null}
      >
        <div style={{ height: 64, margin: '16px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/1992571.png" alt="Logo" className="logo-glow" style={{ maxHeight: '100%', maxWidth: '80%', objectFit: 'contain' }} />
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} style={{ background: 'transparent', borderRight: 0, marginTop: 40 }} theme="dark" items={items} />
      </Sider>
      
      <Layout>
        <Header style={{ 
            padding: '0 24px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10, 
            display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 
        }}>
          
          <Popover 
            content={notificationContent} 
            trigger="click" 
            placement="bottomRight" 
            arrow={false}
            open={isPopoverOpen}
            onOpenChange={handleOpenChange}
          >
            {/* Chỉ hiển thị số lượng CHƯA ĐỌC */}
            <Badge count={unreadCount} size="small" style={{ cursor: 'pointer' }}>
              <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 20 }} />} />
            </Badge>
          </Popover>

          <div style={{ height: 24, width: 1, background: '#f0f0f0' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500 }}>{t('welcome')}, Admin</span>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>{t('logout')}</Button>
          </div>
        </Header>
        
        <Content style={{ margin: '16px' }}>
          <div className="animate-fade-in" style={{ padding: 24, minHeight: 360, background: contentColor || '#ffffff', borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* MODAL CHI TIẾT */}
      <Modal
        title="Chi tiết thông báo"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>]}
      >
        {selectedAnn && (
          <Descriptions layout="vertical" bordered column={1}>
            <Descriptions.Item label="Tiêu đề"><b>{selectedAnn.title}</b></Descriptions.Item>
            <Descriptions.Item label="Thời gian gửi">{dayjs(selectedAnn.created_at).format('HH:mm - DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedAnn.content_md}</div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Layout>
  );
};

export default DashboardLayout;