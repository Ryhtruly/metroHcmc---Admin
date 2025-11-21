import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Button } from 'antd';
import { 
  DollarCircleFilled, 
  TeamOutlined, 
  QrcodeOutlined, 
  RiseOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import Hook logic
import { useDashboardStats } from '../hooks/useDashboardStats';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  // Lấy dữ liệu thật từ Hook
  const { stats, loading, refetch } = useDashboardStats();

  // Cấu hình cột cho bảng Audit Log thật
  const columns = [
    { 
      title: 'Người dùng / ID', 
      dataIndex: 'actor_user', 
      key: 'actor', 
      render: (text: string) => (
        // Nếu null thì là System, nếu có ID thì cắt ngắn cho đẹp
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          {text ? text.substring(0, 8) + '...' : 'System/Khách'}
        </span>
      )
    },
    { 
      title: 'Hành động', 
      dataIndex: 'action', 
      key: 'action', 
      render: (text: string) => {
        let color = 'blue';
        if (text.includes('UPSERT')) color = 'orange'; // Cấu hình
        if (text.includes('VALIDATE') || text.includes('USE')) color = 'green'; // Soát vé
        if (text.includes('PAYMENT')) color = 'gold'; // Thanh toán
        return <Tag color={color}>{text}</Tag>;
      }
    },
    { 
      title: 'Đối tượng', 
      dataIndex: 'object_type', 
      key: 'object_type',
      render: (text: string) => <b>{text}</b>
    },
    { 
      title: 'Thời gian', 
      dataIndex: 'created_at', 
      key: 'time',
      // Format ngày giờ Việt Nam
      render: (text: string) => dayjs(text).format('HH:mm DD/MM/YYYY')
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Tổng quan hệ thống (Tháng {dayjs().format('MM/YYYY')})</Title>
        <Button icon={<SyncOutlined spin={loading} />} onClick={refetch}>Làm mới</Button>
      </div>
      
      {/* PHẦN THẺ SỐ LIỆU (GIỮ NGUYÊN) */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            bordered={false} 
            style={{ 
              background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)', 
              borderRadius: 16, color: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Doanh thu tháng này</span>}
              value={stats.revenue}
              precision={0}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}
              prefix={<DollarCircleFilled />}
              suffix="₫"
              loading={loading}
            />
            <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.8)' }}>
              <RiseOutlined /> Dữ liệu thực tế từ Payment
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card 
            bordered={false} 
            style={{ 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
              borderRadius: 16, color: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Lượt quét vé hôm nay</span>}
              value={stats.passengers}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}
              prefix={<TeamOutlined />}
              loading={loading}
            />
            <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.8)' }}>
              <RiseOutlined /> Dữ liệu thực tế từ Máy quét
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card 
            bordered={false} 
            style={{ 
              background: 'linear-gradient(135deg, #EE9CA7 0%, #FFDDE1 100%)', 
              borderRadius: 16, boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Statistic
              title={<span style={{ color: '#555' }}>Vé đã quét</span>}
              value={stats.scans}
              valueStyle={{ color: '#333', fontSize: 28, fontWeight: 'bold' }}
              prefix={<QrcodeOutlined style={{ color: '#ff4d4f' }} />}
              loading={loading}
            />
             <div style={{ marginTop: 10, color: '#777' }}>Hoạt động ổn định</div>
          </Card>
        </Col>
      </Row>

      {/* PHẦN BẢNG HOẠT ĐỘNG (DỮ LIỆU THẬT) */}
      <div style={{ marginTop: 32 }}>
        <Title level={4}>Hoạt động gần đây (Audit Log)</Title>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table 
            dataSource={stats.recentLogs} // <-- Dùng dữ liệu thật
            columns={columns} 
            rowKey="log_id" // Database dùng log_id làm khóa chính
            pagination={false} 
            loading={loading}
            locale={{ emptyText: 'Chưa có hoạt động nào' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;