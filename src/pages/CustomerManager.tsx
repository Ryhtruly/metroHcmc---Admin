import React, { useState, useMemo } from 'react';
import { 
  Table, Tag, Space, Button, Input, Card, Typography, 
  Avatar, Tooltip, Row, Col, Divider, Modal, List, Badge, message, Alert
} from 'antd';
import { 
  UserOutlined, SearchOutlined, ReloadOutlined, GiftOutlined, 
  LockOutlined, UnlockOutlined, HistoryOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCustomerManager } from '../hooks/useCustomerManager';

const { Title, Text } = Typography;

const CustomerManager: React.FC = () => {
  const { 
    customers, loading, refresh, 
    updateUserStatus, fetchRideHistory, fetchAvailableCodes,
    sendGiftToUser 
  } = useCustomerManager();
  
  const [searchText, setSearchText] = useState('');
  
  // State cho Modal chọn mã giảm giá
  const [promoModal, setPromoModal] = useState({ open: false, user: null as any, codes: [] as any[] });
  
  // State cho Modal soạn thảo lời nhắn
  const [msgModal, setMsgModal] = useState({ 
    open: false, 
    user: null as any, 
    code: '', 
    title: 'Phản hồi từ Ban Quản Trị Metro',
    content: '' 
  });

  // State cho Modal lịch sử đi tàu
  const [historyModal, setHistoryModal] = useState({ open: false, user: null as any, data: [] as any[] });

  // 1. Mở Modal chọn mã quà tặng
  const handleOpenPromo = async (user: any) => {
    const codes = await fetchAvailableCodes();
    setPromoModal({ open: true, user, codes });
  };

  // 2. Chuyển sang Modal soạn thảo sau khi chọn mã
  const handleSelectCode = (code: string) => {
    setMsgModal({
      ...msgModal,
      open: true,
      user: promoModal.user,
      code: code,
      content: `Chào ${promoModal.user?.full_name}, chúng tôi rất tiếc về sự cố bạn gặp phải. Ban Quản Trị xin gửi tặng bạn mã ${code} để thay lời xin lỗi và mong bạn tiếp tục đồng hành cùng Metro.`
    });
    setPromoModal({ ...promoModal, open: false });
  };

  // 3. Gửi thông báo và quà tặng chính thức
  const onConfirmSend = async () => {
    message.loading({ content: 'Đang gửi thông báo...', key: 'send_msg' });
    const success = await sendGiftToUser(msgModal.user.user_id, msgModal.code, msgModal.title, msgModal.content);
    
    if (success) {
      message.success({ content: 'Đã gửi thông báo thành công!', key: 'send_msg' });
      setMsgModal({ ...msgModal, open: false });
      refresh();
    } else {
      message.error({ content: 'Gửi thất bại, vui lòng thử lại!', key: 'send_msg' });
    }
  };

  // 4. Xem lịch sử đi tàu
  const handleShowHistory = async (user: any) => {
    const data = await fetchRideHistory(user.user_id);
    setHistoryModal({ open: true, user, data });
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'user',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatar_url} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.full_name || 'N/A'}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>ID: {record.user_id?.substring(0, 8)}...</Text>
          </div>
        </Space>
      ),
    },
    { 
      title: 'Liên hệ', 
      render: (_: any, record: any) => (
        <div style={{ fontSize: 13 }}>
          <div><PhoneOutlined /> {record.phone || 'N/A'}</div>
          <div><MailOutlined /> {record.email || 'N/A'}</div>
        </div>
      )
    },
    {
      title: 'Vé đã mua',
      dataIndex: 'total_tickets',
      align: 'center' as const,
      render: (count: number) => <Badge count={count} showZero color="#108ee9" />
    },
    {
      title: 'Trạng thái',
      dataIndex: 'state',
      render: (state: boolean) => (
        <Tag color={state ? 'success' : 'error'}>{state ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ KHÓA'}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Tặng quà & Phản hồi">
            <Button type="primary" shape="circle" icon={<GiftOutlined />} onClick={() => handleOpenPromo(record)} />
          </Tooltip>
          <Tooltip title="Lịch sử đi tàu">
            <Button shape="circle" icon={<HistoryOutlined />} onClick={() => handleShowHistory(record)} />
          </Tooltip>
          <Divider type="vertical" />
          <Button 
            type="text" danger={record.state}
            icon={record.state ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => updateUserStatus(record.user_id, !record.state)}
          >
            {record.state ? 'Khóa' : 'Mở'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
         <Row justify="space-between" align="middle">
            <Col><Title level={3} style={{ margin: 0 }}>Quản lý Khách hàng</Title></Col>
            <Col>
              <Space>
                <Input 
                  placeholder="Tìm theo tên hoặc SĐT..." 
                  prefix={<SearchOutlined />} 
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Button icon={<ReloadOutlined />} onClick={refresh}>Làm mới</Button>
              </Space>
            </Col>
         </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table columns={columns} dataSource={customers} loading={loading} rowKey="user_id" />
      </Card>

      {/* Modal 1: Chọn mã giảm giá */}
      <Modal
        title={`Chọn quà tặng cho ${promoModal.user?.full_name}`}
        open={promoModal.open}
        onCancel={() => setPromoModal({ ...promoModal, open: false })}
        footer={null}
      >
        <List
          dataSource={promoModal.codes}
          renderItem={(item: any) => (
            <List.Item actions={[<Button type="link" onClick={() => handleSelectCode(item.code)}>Chọn mã này</Button>]}>
              <List.Item.Meta 
                title={<b>{item.code}</b>} 
                description={`Hết hạn: ${item.expires_at ? dayjs(item.expires_at).format('DD/MM/YYYY') : 'Vĩnh viễn'}`} 
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có mã nào còn hạn' }}
        />
      </Modal>

      {/* Modal 2: Soạn thảo tin nhắn [MỚI] */}
      <Modal
        title="Soạn thảo thông báo gửi khách hàng"
        open={msgModal.open}
        onOk={onConfirmSend}
        onCancel={() => setMsgModal({ ...msgModal, open: false })}
        okText="Gửi ngay"
        cancelText="Hủy"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Người nhận:</Text> <Tag color="blue">{msgModal.user?.full_name}</Tag>
          </div>
          <div>
            <Text strong>Tiêu đề thông báo:</Text>
            <Input 
              placeholder="Nhập tiêu đề..." 
              value={msgModal.title} 
              onChange={e => setMsgModal({...msgModal, title: e.target.value})} 
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Nội dung lời nhắn:</Text>
            <Input.TextArea 
              rows={5} 
              placeholder="Nhập lời nhắn gửi tới khách hàng..."
              value={msgModal.content} 
              onChange={e => setMsgModal({...msgModal, content: e.target.value})} 
              style={{ marginTop: 8 }}
            />
          </div>
          {msgModal.code && (
            <Alert 
              message={`Mã quà tặng đính kèm: ${msgModal.code}`} 
              type="info" 
              showIcon 
              style={{ borderRadius: 8 }}
            />
          )}
        </Space>
      </Modal>

      {/* Modal 3: Lịch sử đi tàu */}
      <Modal
        title={`Lịch sử đi tàu: ${historyModal.user?.full_name}`}
        open={historyModal.open}
        onCancel={() => setHistoryModal({ ...historyModal, open: false })}
        width={700}
        footer={null}
      >
        <Table
          dataSource={historyModal.data}
          size="small"
          columns={[
            { title: 'Thời gian', dataIndex: 'time', render: (t) => dayjs(t).format('HH:mm DD/MM/YYYY') },
            { title: 'Ga', dataIndex: 'station_name' },
            { title: 'Ghi chú', dataIndex: 'action_type' }
          ]}
        />
      </Modal>
    </div>
  );
};

export default CustomerManager;