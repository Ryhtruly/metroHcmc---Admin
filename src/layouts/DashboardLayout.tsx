import React, { useState } from 'react';
import { 
  Layout, Menu, Button, theme, Badge, Popover, List, Avatar, Typography, 
  Modal, Descriptions, Tag, Drawer, Divider, Space, ColorPicker // 🔥 Thêm ColorPicker vào đây
} from 'antd';
import { 
  DashboardOutlined, BarChartOutlined, EnvironmentOutlined, LogoutOutlined,
  QrcodeOutlined, SettingOutlined, GiftOutlined, BellOutlined, 
  BgColorsOutlined, UserOutlined, ReloadOutlined, MessageOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'; 
import IdleTimer from '../components/IdleTimer';

// Import Hook & Context
import { useTheme } from '../contexts/ThemeContext'; 
import { useTranslation } from 'react-i18next';     
import { useAdminFeedbacks } from '../hooks/useAdminFeedbacks'; 

dayjs.extend(relativeTime);
dayjs.locale('vi'); 

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
  siderColor, setSiderColor, 
  primaryColor, setPrimaryColor, 
  contentColor, setContentColor // 🔥 Thêm 2 cái này vào
} = useTheme();
  const { t } = useTranslation();      
  const { token: { borderRadiusLG } } = theme.useToken();

  // Hook lấy Feedback
  const { 
    feedbacks, unreadCount, loading, refetch, markAsRead, markAllAsRead 
  } = useAdminFeedbacks();
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false); // Điều khiển ngăn kéo giao diện
  
  // --- STATE CHO MODAL CHI TIẾT ---
  // Lưu feedback đang được chọn để hiển thị
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null); 

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  // Hàm xử lý khi click vào 1 dòng feedback
  const handleFeedbackClick = (item: any) => {
      markAsRead(item.id); // 1. Đánh dấu đã đọc
      setSelectedFeedback(item); // 2. Lưu item vào state để hiện Modal
      setIsPopoverOpen(false); // 3. Đóng popover cho gọn
  };

  // Nội dung Popover: Danh sách Góp ý
  const notificationContent = (
    <div style={{ width: 360 }}>
      {/* Header Popover */}
      <div style={{ 
        padding: '12px 16px', borderBottom: '1px solid #f0f0f0', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#fafafa'
      }}>
        <span style={{ fontWeight: 'bold', fontSize: 15 }}>
          <MessageOutlined style={{ marginRight: 8 }} />
          Góp ý mới ({unreadCount})
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && <Button type="link" size="small" onClick={markAllAsRead}>Đọc hết</Button>}
          <Button type="link" size="small" onClick={refetch} icon={<ReloadOutlined />} loading={loading} />
        </div>
      </div>
      
      {/* List Góp ý */}
      <List
        itemLayout="horizontal"
        dataSource={feedbacks}
        loading={loading}
        locale={{ emptyText: 'Chưa có góp ý nào' }}
        style={{ maxHeight: 400, overflowY: 'auto' }}
        renderItem={(item: any) => {
          const isRead = item.isRead;
          return (
            <List.Item 
              style={{ 
                padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: isRead ? '#fff' : '#e6f7ff', // Màu xanh nhạt nếu chưa đọc
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => handleFeedbackClick(item)} // <--- GỌI HÀM MỞ MODAL
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!isRead} offset={[-2, 2]} color="blue">
                    <Avatar style={{ backgroundColor: isRead ? '#ccc' : '#1890ff' }} icon={<UserOutlined />} />
                  </Badge>
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong={!isRead} style={{ fontSize: 13, maxWidth: 180 }} ellipsis>
                        {item.user_name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                        {dayjs(item.created_at).fromNow()}
                      </Text>
                  </div>
                }
                description={
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{item.title || '(Không tiêu đề)'}</div>
                    <div style={{ 
                        maxHeight: 40, overflow: 'hidden', 
                        textOverflow: 'ellipsis', display: '-webkit-box', 
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' 
                    }}>
                      {item.content}
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
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
    { key: '/customers', icon: <TeamOutlined />, label: t('Khách hàng'), onClick: () => navigate('/customers') },
    { key: '/promotions', icon: <GiftOutlined />, label: t('promotions'), onClick: () => navigate('/promotions') },
    { type: 'divider' },
    { key: '/settings', icon: <SettingOutlined />, label: t('settings_log'), onClick: () => navigate('/settings') },
    { key: '/giftcodes', icon: <GiftOutlined />, label: t('Quản lý Giftcode'), onClick: () => navigate('/giftcodes') },
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

          <Button 
              type="text" 
              shape="circle" 
              icon={<BgColorsOutlined style={{ fontSize: 20 }} />} 
              onClick={() => setIsAppearanceOpen(true)} // Mở ngăn kéo khi nhấn
            />
          
          <Popover 
            content={notificationContent} 
            trigger="click" 
            placement="bottomRight" 
            arrow={false}
            open={isPopoverOpen}
            onOpenChange={(v) => setIsPopoverOpen(v)}
            overlayInnerStyle={{ padding: 0 }}
          >
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
<Drawer
  title={<Space><BgColorsOutlined /> Tùy chỉnh Giao diện</Space>}
  placement="right"
  onClose={() => setIsAppearanceOpen(false)}
  open={isAppearanceOpen}
  width={380}
>
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 32 }}>
    
    {/* PHẦN 1: MÀU CHÍNH - Dàn trải linh hoạt */}
    <section style={{ flex: 1 }}>
      <Title level={5}>Màu Chính (Nút bấm, Highlight)</Title>
      <Text type="secondary">Màu sắc hiển thị cho các nút thao tác và tiêu đề chính.</Text>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        {[
          '#6C63FF', '#4834d4', '#1890ff', '#ff4d4f', 
          '#52c41a', '#faad14', '#722ed1', '#eb2f96'
        ].map(color => (
          <div
            key={color}
            onClick={() => setPrimaryColor?.(color)}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: color,
              cursor: 'pointer', border: primaryColor === color ? '3px solid #ddd' : 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ))}
        <ColorPicker value={primaryColor} onChange={(c) => setPrimaryColor?.(c.toHexString())} />
      </div>
    </section>

    <Divider />

    {/* PHẦN 2: MÀU SIDEBAR - Dàn trải linh hoạt */}
    <section style={{ flex: 1 }}>
      <Title level={5}>Màu Menu Trái (Sidebar)</Title>
      <Text type="secondary">Tùy chỉnh màu nền cho thanh điều hướng bên trái.</Text>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        {[
          '#195B99', '#111827', '#1a1a1a', '#2d3436', 
          '#001529', '#2c3e50', '#4b4b4b', '#000000'
        ].map(color => (
          <div
            key={color}
            onClick={() => setSiderColor?.(color)}
            style={{
              width: 40, height: 40, borderRadius: 8, background: color,
              cursor: 'pointer', border: siderColor === color ? '3px solid #1890ff' : '1px solid #d9d9d9',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ))}
      </div>
    </section>

    <div style={{ textAlign: 'center', paddingBottom: 20, opacity: 0.5 }}>
      <Divider />
      <Text style={{ fontSize: 12 }}>Thiết kế bởi Trí - HCMC Metro Management</Text>
    </div>
  </div>
</Drawer>

        {/* --- MODAL CHI TIẾT FEEDBACK (MỚI) --- */}
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontSize: 16 }}>{selectedFeedback?.user_name}</div>
                        <div style={{ fontSize: 12, color: '#888', fontWeight: 'normal' }}>
                            {selectedFeedback && dayjs(selectedFeedback.created_at).format('HH:mm - DD/MM/YYYY')}
                        </div>
                    </div>
                </div>
            }
            open={!!selectedFeedback} // Mở khi có dữ liệu
            onCancel={() => setSelectedFeedback(null)} // Đóng modal
            footer={[
                <Button key="close" type="primary" onClick={() => setSelectedFeedback(null)}>
                    Đóng
                </Button>
            ]}
            width={600}
        >
            {selectedFeedback && (
                <div style={{ marginTop: 20 }}>
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Tiêu đề">
                            <Text strong>{selectedFeedback.title || '(Không tiêu đề)'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {selectedFeedback.user_phone || 'Không có'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung">
                            <div style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
                                {selectedFeedback.content}
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )}
        </Modal>

      </Layout>
    </Layout>
  );
};

export default DashboardLayout;