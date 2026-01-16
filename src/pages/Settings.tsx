import React from 'react';
import { 
  Tabs, Table, Tag, Button, Input, Space, DatePicker, Card, Modal, Form, Select 
} from 'antd';
import { 
  NotificationOutlined, FileSearchOutlined, DollarCircleOutlined, 
  PlusOutlined, SearchOutlined, ReloadOutlined 
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';
import { useSettings } from '../hooks/useSettings'; // Import Hook

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// --- TAB 1: QUẢN LÝ THÔNG BÁO ---
const NotificationsTab = ({ data, onOpenModal }: any) => {
  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (t: string) => <b>{t}</b> },
    { title: 'Nội dung', dataIndex: 'content_md', key: 'content', ellipsis: true },
    { title: 'Thời gian đăng', dataIndex: 'created_at', key: 'date', render: (t: string) => dayjs(t).format('DD/MM/YYYY HH:mm') },
    { 
      title: 'Trạng thái', dataIndex: 'is_active', key: 'status',
      render: (s: boolean) => <Tag color={s ? 'green' : 'red'}>{s ? 'Hiển thị' : 'Ẩn'}</Tag> 
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3>Danh sách thông báo đã gửi</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenModal}>Tạo thông báo mới</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="ann_id" pagination={{ pageSize: 5 }} />
    </div>
  );
};

// --- TAB 2: NHẬT KÝ HỆ THỐNG ---
const AuditLogsTab = ({ data, dateRange, setDateRange, onFilter }: any) => {
  const columns = [
   {
      title: 'Người thực hiện',
      dataIndex: 'actor',
      key: 'actor',
      render: (actor: any) => {
        if (!actor) return <Tag>System</Tag>;
        return <b style={{ color: '#1890ff' }}>{actor.name}</b>;
      },
    }
    ,
    { title: 'Hành động', dataIndex: 'action', key: 'action', render: (t: string) => <Tag color="purple">{t}</Tag> },
    { title: 'Đối tượng', dataIndex: 'object_type', key: 'target' },
    { title: 'ID Đối tượng', dataIndex: 'object_id', key: 'obj_id' },
    { title: 'Thời gian', dataIndex: 'created_at', key: 'time', render: (t: string) => dayjs(t).format('HH:mm DD/MM/YYYY') },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <RangePicker 
           value={dateRange} 
           onChange={(dates: any) => setDateRange(dates)} 
           allowClear={false}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={onFilter}>Lọc dữ liệu</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="log_id" size="small" />
    </div>
  );
};

// --- TAB 3: LỊCH SỬ GIAO DỊCH ---
const TransactionLogsTab = ({ data }: any) => {
  const columns = [
    { title: 'Mã GD', dataIndex: 'payment_id', key: 'id' },
    { title: 'Mã Vé', dataIndex: 'ticket_id', key: 'ticket' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v: string) => <b>{parseInt(v).toLocaleString()} ₫</b> },
    { title: 'Cổng TT', dataIndex: 'method', key: 'method' },
    { 
      title: 'Trạng thái', dataIndex: 'status', key: 'status', 
      render: (s: string) => <Tag color={s === 'SUCCESS' ? 'green' : s === 'PENDING' ? 'orange' : 'red'}>{s}</Tag>
    },
    { title: 'Thời gian', dataIndex: 'created_at', key: 'time', render: (t: string) => dayjs(t).format('HH:mm DD/MM/YYYY') },
  ];

  return (
    <div>
       <div style={{ marginBottom: 16 }}>
        {/* Bộ lọc ngày dùng chung với Audit Log ở trên hoặc tách riêng nếu muốn */}
        <span style={{ color: '#888' }}>* Hiển thị giao dịch trong khoảng thời gian đã chọn</span>
      </div>
      <Table columns={columns} dataSource={data} rowKey="payment_id" />
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const Settings: React.FC = () => {
  // Sử dụng Hook
  const { 
    loading, announcements, auditLogs, payments, 
    dateRange, setDateRange, refresh,
    isModalOpen, openModal, closeModal, annForm, handleSaveAnnouncement
  } = useSettings();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (<span><NotificationOutlined /> Thông báo App</span>),
      children: <NotificationsTab data={announcements} onOpenModal={openModal} />,
    },
    {
      key: '2',
      label: (<span><FileSearchOutlined /> Nhật ký Audit</span>),
      children: <AuditLogsTab data={auditLogs} dateRange={dateRange} setDateRange={setDateRange} onFilter={refresh} />,
    },
    {
      key: '3',
      label: (<span><DollarCircleOutlined /> Lịch sử Giao dịch</span>),
      children: <TransactionLogsTab data={payments} />,
    },
  ];

  return (
    <div className="animate-fade-in" style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
         <h2 style={{ margin: 0 }}>Cấu hình & Nhật ký</h2>
         <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>Làm mới dữ liệu</Button>
      </div>
      
      <Tabs defaultActiveKey="1" items={items} />

      {/* Modal Tạo thông báo */}
      <Modal 
        title="Tạo thông báo mới" 
        open={isModalOpen} 
        onOk={handleSaveAnnouncement} 
        onCancel={closeModal}
        confirmLoading={loading}
      >
        <Form form={annForm} layout="vertical">
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Bảo trì hệ thống..." />
          </Form.Item>
          <Form.Item label="Loại thông báo" name="type" initialValue="news">
             <Select>
                <Option value="news">Tin tức</Option>
                <Option value="promo">Khuyến mãi</Option>
                <Option value="system">Hệ thống</Option>
             </Select>
          </Form.Item>
          <Form.Item label="Nội dung" name="content" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Nội dung thông báo gửi đến người dùng..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;