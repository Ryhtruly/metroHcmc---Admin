import React from 'react';
import { 
  Tabs, Card, Form, InputNumber, Button, Table, Tag, Space, Input, Typography, Modal, Select, Switch 
} from 'antd';
import { 
  EditOutlined, SaveOutlined, SettingOutlined, QrcodeOutlined, ReloadOutlined 
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { useTicketManager } from '../hooks/useTicketManager';

const { Text } = Typography;
const { Option } = Select;

// --- TAB 1: CẤU HÌNH GIÁ VÉ LƯỢT (Giữ nguyên) ---
const FareRulesTab = ({ form, onSave, loading }: any) => {
  return (
    <Card title="Công thức tính giá vé lượt (Single Ride)" bordered={false}>
       {/* ... (Giữ nguyên nội dung cũ của tab này) ... */}
       <Form form={form} layout="vertical" initialValues={{ line_code: 'L1' }}>
        <Form.Item name="line_code" hidden><Input /></Form.Item>
        <div style={{ display: 'flex', gap: 24 }}>
          <Form.Item label="Giá mở cửa (Base Price)" name="base_price" style={{ flex: 1 }} rules={[{ required: true }]}>
            <InputNumber addonAfter="₫" style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="Áp dụng cho (số ga đầu)" name="base_stops" style={{ flex: 1 }} rules={[{ required: true }]}>
            <InputNumber addonAfter="ga" style={{ width: '100%' }} />
          </Form.Item>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Form.Item label="Giá tăng thêm mỗi chặng" name="step_price" style={{ flex: 1 }} rules={[{ required: true }]}>
            <InputNumber addonAfter="₫" style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="Mỗi chặng gồm (số ga)" name="step_stops" style={{ flex: 1 }} rules={[{ required: true }]}>
            <InputNumber addonAfter="ga" style={{ width: '100%' }} />
          </Form.Item>
        </div>
        <div style={{ marginTop: 10 }}>
          <Button type="primary" icon={<SaveOutlined />} onClick={onSave} loading={loading} size="large">Lưu & Áp dụng cấu hình mới</Button>
        </div>
      </Form>
    </Card>
  );
};

// --- TAB 2: QUẢN LÝ GÓI VÉ ---
const TicketProductsTab = ({ data, loading, onEdit }: any) => {
  const columns = [
    { title: 'Mã vé', dataIndex: 'code', key: 'code', render: (text: string) => <b>{text}</b> },
    { title: 'Tên hiển thị', dataIndex: 'name_vi', key: 'name' },
    { 
      title: 'Loại', dataIndex: 'type', key: 'type', 
      render: (t: string) => <Tag color={t === 'single_ride' ? 'orange' : 'blue'}>{t}</Tag>
    },
    { 
      title: 'Giá bán', dataIndex: 'price', key: 'price',
      render: (price: any) => {
        if (price === null || price === undefined || price == 0) return <span style={{color: '#999'}}>--</span>;
        return <span style={{ color: '#3f8600', fontWeight: 'bold' }}>{Number(price).toLocaleString()} ₫</span>;
      }
    },
    { title: 'Thời hạn', dataIndex: 'duration_hours', key: 'duration', render: (h: any) => h ? `${h} giờ` : '-' },
    { 
      title: 'Trạng thái', dataIndex: 'state', key: 'state',
      render: (status: boolean) => <Tag color={status ? 'success' : 'error'}>{status ? 'Đang bán' : 'Ngưng bán'}</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {/* 👇 Gắn sự kiện onEdit vào đây */}
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
        </Space>
      ),
    },
  ];

  return (
    <Table columns={columns} dataSource={data} rowKey="code" loading={loading} pagination={false} />
  );
};

// --- MAIN COMPONENT ---
const TicketManager: React.FC = () => {
  const { 
    loading, fareRules, ticketProducts, fareForm, handleSaveFareRule, refresh,
    // Các biến mới từ Hook
    productForm, isProductModalOpen, openProductModal, closeProductModal, handleSaveProduct 
  } = useTicketManager();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (<span><SettingOutlined /> Cấu hình Giá vé Lượt</span>),
      children: <FareRulesTab form={fareForm} onSave={handleSaveFareRule} loading={loading} />,
    },
    {
      key: '2',
      label: (<span><QrcodeOutlined /> Các gói Vé (Pass)</span>),
      children: <TicketProductsTab data={ticketProducts} loading={loading} onEdit={openProductModal} />,
    },
  ];

  return (
    <div className="animate-fade-in" style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
         <h2 style={{ margin: 0 }}>Quản lý Loại Vé & Giá cước</h2>
         <Button icon={<ReloadOutlined />} onClick={refresh}>Làm mới</Button>
      </div>
      <Tabs defaultActiveKey="1" items={items} type="card" />

      {/* 👇 MODAL SỬA GÓI VÉ */}
      <Modal
        title="Cập nhật thông tin gói vé"
        open={isProductModalOpen}
        onOk={handleSaveProduct}
        onCancel={closeProductModal}
        confirmLoading={loading}
      >
        <Form form={productForm} layout="vertical">
          {/* Mã vé không cho sửa (readOnly) */}
          <Form.Item label="Mã vé" name="code">
             <Input disabled />
          </Form.Item>

          <Form.Item label="Tên hiển thị (Tiếng Việt)" name="name_vi" rules={[{ required: true }]}>
             <Input />
          </Form.Item>
          
          {/* Loại vé (Ẩn đi, không nên sửa loại vì ảnh hưởng logic code) */}
          <Form.Item name="type" hidden><Input /></Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item label="Giá bán" name="price" style={{ flex: 1 }} rules={[{ required: true }]}>
               <InputNumber 
                 style={{ width: '100%' }} 
                 addonAfter="₫"
                 formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
               />
            </Form.Item>
            <Form.Item label="Thời hạn (Giờ)" name="duration_hours" style={{ flex: 1 }} rules={[{ required: true }]}>
               <InputNumber style={{ width: '100%' }} addonAfter="h" />
            </Form.Item>
          </div>

          <Form.Item 
             label="Tự kích hoạt sau (Ngày)" 
             name="auto_activate_after_days" 
             tooltip="Vé sẽ tự động chuyển sang trạng thái ACTIVE nếu khách không dùng sau số ngày này"
          >
             <InputNumber style={{ width: '100%' }} addonAfter="ngày" />
          </Form.Item>

          <Form.Item label="Trạng thái bán" name="state" valuePropName="checked">
             <Switch checkedChildren="Đang bán" unCheckedChildren="Ngưng bán" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TicketManager;