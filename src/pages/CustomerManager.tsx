import React, { useState, useMemo } from 'react';
import {
  Table, Tag, Space, Button, Input, Card, Typography,
  Avatar, Tooltip, Row, Col, Divider, Modal, List, Badge, message, Alert, Select
} from 'antd';
import {
  UserOutlined, SearchOutlined, ReloadOutlined, GiftOutlined,
  LockOutlined, UnlockOutlined, HistoryOutlined, PhoneOutlined, MailOutlined, EyeOutlined, UsergroupAddOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCustomerManager } from '../hooks/useCustomerManager';

const { Title, Text } = Typography;

const CustomerManager: React.FC = () => {
  const {
    customers, loading, refresh,
    updateUserStatus, fetchAvailableCodes, sendGiftToUser,
    // Các biến phục vụ Lịch sử mua vé
    customerTickets, selectedTicket, isTicketDetailOpen,
    fetchCustomerTickets, fetchTicketDetail, setIsTicketDetailOpen, sendBulkGifts,
  } = useCustomerManager();
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [availableCodes, setAvailableCodes] = useState<any[]>([]);

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



  const [bulkData, setBulkData] = useState({
    userIds: [] as string[],
    promoCode: '',
    title: 'Quà tặng từ Ban Quản Trị',
    content: 'Cảm ơn quý khách đã đồng hành cùng Metro HCMC.'
  });
  const handleOpenBulkModal = async () => {
    const codes = await fetchAvailableCodes(); // Tái sử dụng hàm lấy mã
    setAvailableCodes(codes);
    setIsBulkModalOpen(true);
  };

  const handleBulkSend = async () => {
    // 1. Validate: Chưa chọn ai
    if (bulkData.userIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 khách hàng');
      return;
    }

    // 2. Validate: Kiểm tra số lượng mã còn lại (MỚI)
    if (bulkData.promoCode) {
      const selectedCodeInfo = availableCodes.find(c => c.code === bulkData.promoCode);
      // Nếu tìm thấy thông tin mã và số người chọn > số còn lại
      if (selectedCodeInfo && bulkData.userIds.length > selectedCodeInfo.remaining) {
        message.error(`Số lượng khách (${bulkData.userIds.length}) vượt quá số lượt còn lại của mã (${selectedCodeInfo.remaining})!`);
        return; // Dừng lại, không gửi
      }
    }

    setBulkLoading(true);
    message.loading({ content: `Đang xử lý gửi cho ${bulkData.userIds.length} người...`, key: 'bulk_send' });

    // Gọi hàm loop từ hook
    const { successCount, failCount } = await sendBulkGifts(
      bulkData.userIds,
      bulkData.promoCode,
      bulkData.title,
      bulkData.content
    );

    setBulkLoading(false);
    setIsBulkModalOpen(false);

    // Reset form
    setBulkData({ ...bulkData, userIds: [], promoCode: '' });

    if (failCount === 0) {
      // Thành công 100%
      Modal.success({
        title: 'Hoàn tất!',
        content: `Đã tặng quà thành công cho ${successCount} khách hàng.`,
      });
    } else {
      // Có lỗi vài người
      Modal.warning({
        title: 'Hoàn tất một phần',
        content: `Đã tặng: ${successCount} người. Thất bại: ${failCount} người.`,
      });
    }
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

  const selectedCodeInfo = availableCodes.find(c => c.code === bulkData.promoCode);
  const isOverLimit = selectedCodeInfo && bulkData.userIds.length > selectedCodeInfo.remaining;

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

  const handleShowHistory = (user: any) => {
    setSelectedUser(user);
    setHistoryModalVisible(true);
    fetchCustomerTickets(user.user_id); // Gọi hàm lấy data từ Backend
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
          <Tooltip title="Lịch sử mua vé">
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
              <Button
                type="primary"
                icon={<UsergroupAddOutlined />}
                style={{ backgroundColor: '#722ed1' }} // Màu tím cho khác biệt
                onClick={handleOpenBulkModal}
              >
                Tặng hàng loạt
              </Button>

              <Button icon={<ReloadOutlined />} onClick={refresh}>Làm mới</Button>

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
              onChange={e => setMsgModal({ ...msgModal, title: e.target.value })}
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Nội dung lời nhắn:</Text>
            <Input.TextArea
              rows={5}
              placeholder="Nhập lời nhắn gửi tới khách hàng..."
              value={msgModal.content}
              onChange={e => setMsgModal({ ...msgModal, content: e.target.value })}
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
        title={`Lịch sử mua vé: ${selectedUser?.full_name}`} // Dùng selectedUser
        open={historyModalVisible} // Đổi từ historyModal.open thành historyModalVisible
        onCancel={() => setHistoryModalVisible(false)} // Đổi hàm đóng Modal
        width={800}
        footer={null}
      >
        <Table
          dataSource={customerTickets} // Dữ liệu vé từ Hook
          rowKey="ticket_id"
          size="small"
          columns={[
            { title: 'Tên gói vé', dataIndex: 'product_name' },
            { title: 'Giá', dataIndex: 'final_price', render: (p) => `${p.toLocaleString()}₫` },
            { title: 'Ngày mua', dataIndex: 'created_at', render: (d) => dayjs(d).format('DD/MM/YYYY') },
            { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color="blue">{s}</Tag> },
            {
              title: 'Thao tác',
              render: (_, record) => (
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => fetchTicketDetail(record.ticket_id)} // Gọi hàm lấy chi tiết vé
                >
                  Chi tiết
                </Button>
              )
            }
          ]}
        />
      </Modal>

      {/* Modal 4: Chi tiết vé & QR Code */}
      <Modal
        title="Chi tiết vé điện tử"
        open={isTicketDetailOpen}
        onCancel={() => setIsTicketDetailOpen(false)}
        footer={null}
        centered
      >
        {selectedTicket && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket.qr_data}`}
              alt="QR"
            />
            <Title level={4} style={{ marginTop: 10 }}>{selectedTicket.ticket_code}</Title>
            <Divider />
            <Row style={{ textAlign: 'left' }}>
              <Col span={12}><Text type="secondary">Ga đi:</Text><br /><Text strong>{selectedTicket.from_station_name || 'Tất cả ga'}</Text></Col>
              <Col span={12}><Text type="secondary">Ga đến:</Text><br /><Text strong>{selectedTicket.to_station_name || 'Tất cả ga'}</Text></Col>
              <Col span={24} style={{ marginTop: 10 }}><Text type="secondary">Hết hạn:</Text><br /><Text strong>{dayjs(selectedTicket.expiry_date).format('DD/MM/YYYY HH:mm')}</Text></Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <UsergroupAddOutlined style={{ color: '#722ed1' }} />
            <span>Gửi quà & Thông báo hàng loạt</span>
          </Space>
        }
        open={isBulkModalOpen}
        onCancel={() => setIsBulkModalOpen(false)}
        onOk={handleBulkSend}
        okText={`Gửi cho ${bulkData.userIds.length} người`} // Hiện số lượng lên nút luôn cho ngầu
        okButtonProps={{ disabled: isOverLimit || bulkData.userIds.length === 0 }} // Khóa nút nếu vượt quá
        confirmLoading={bulkLoading}
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">

          {/* 1. Chọn người dùng */}
          <div>
            <Text strong>1. Chọn khách hàng nhận quà:</Text>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Chọn danh sách khách hàng..."
              value={bulkData.userIds}
              onChange={(values) => setBulkData({ ...bulkData, userIds: values })}
              optionFilterProp="children"
              maxTagCount="responsive"
            >
              {customers.map((u: any) => (
                <Select.Option key={u.user_id} value={u.user_id}>
                  {u.full_name} ({u.phone || 'No Phone'})
                </Select.Option>
              ))}
            </Select>

            {/* Hiển thị số lượng đã chọn */}
            <div style={{ marginTop: 5, display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Đã chọn: <b style={{ color: isOverLimit ? 'red' : 'inherit' }}>{bulkData.userIds.length}</b> người
              </Text>
              {isOverLimit && (
                <Text type="danger" style={{ fontSize: 12 }}>
                  (Vượt quá giới hạn {selectedCodeInfo?.remaining} lượt của mã)
                </Text>
              )}
            </div>
          </div>

          {/* 2. Chọn Mã quà */}
          <div>
            <Text strong>2. Mã quà tặng đính kèm (Tùy chọn):</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Chọn mã Giftcode (nếu có)"
              allowClear
              value={bulkData.promoCode} // Bind value để reset được
              onChange={(val) => setBulkData({ ...bulkData, promoCode: val })}
              status={isOverLimit ? 'error' : ''} // Đỏ viền nếu lỗi
            >
              {availableCodes.map((c: any) => (
                <Select.Option key={c.code} value={c.code} disabled={c.remaining <= 0}>
                  {c.code} (Còn {c.remaining} lượt) - {c.reward_type}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* 3. Nội dung thông báo (Giữ nguyên) */}
          <div>
            <Text strong>3. Nội dung thông báo:</Text>
            <Input
              style={{ marginTop: 8, marginBottom: 8 }}
              placeholder="Tiêu đề thông báo"
              value={bulkData.title}
              onChange={e => setBulkData({ ...bulkData, title: e.target.value })}
            />
            <Input.TextArea
              rows={4}
              placeholder="Nội dung lời nhắn..."
              value={bulkData.content}
              onChange={e => setBulkData({ ...bulkData, content: e.target.value })}
            />
          </div>

          {/* Alert cảnh báo */}
          {isOverLimit ? (
            <Alert
              message="Lỗi số lượng"
              description={`Mã giảm giá này chỉ còn ${selectedCodeInfo?.remaining} lượt, nhưng bạn đang chọn gửi cho ${bulkData.userIds.length} người. Vui lòng bỏ bớt người nhận hoặc chọn mã khác.`}
              type="error"
              showIcon
            />
          ) : (
            <div style={{ backgroundColor: '#FFF7E6', padding: 10, borderRadius: 6, border: '1px solid #FFD591' }}>
              <Text type="warning">
                ⚠️ Lưu ý: Hệ thống sẽ gửi lần lượt cho từng người. Vui lòng không tắt trình duyệt trong quá trình gửi.
              </Text>
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default CustomerManager;