import React from 'react';
import { 
  Tabs, Card, Form, InputNumber, Button, Table, Tag, Space, Input, Typography, Modal, Select, Switch, Row, Col 
} from 'antd';
import { 
  EditOutlined, SaveOutlined, SettingOutlined, QrcodeOutlined, ReloadOutlined, PlusOutlined 
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { useTicketManager } from '../hooks/useTicketManager';

const { Title } = Typography;
const { Option } = Select;

// --- TAB 1: CẤU HÌNH GIÁ VÉ LƯỢT (Giữ nguyên logic cũ của anh) ---
const FareRulesTab = ({ form, onSave, loading }: any) => {
  return (
    <Card title="Công thức tính giá vé lượt (Single Ride)" bordered={false} style={{ borderRadius: 12 }}>
       <Form form={form} layout="vertical" initialValues={{ line_code: 'L1' }}>
        <Form.Item name="line_code" hidden><Input /></Form.Item>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Giá mở cửa (Base Price)" name="base_price" rules={[{ required: true, message: 'Nhập giá mở cửa' }]}>
              <InputNumber 
                addonAfter="₫" 
                style={{ width: '100%' }} 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Áp dụng cho (số ga đầu)" name="base_stops" rules={[{ required: true, message: 'Nhập số ga' }]}>
              <InputNumber addonAfter="ga" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Giá tăng thêm mỗi chặng" name="step_price" rules={[{ required: true, message: 'Nhập giá tăng thêm' }]}>
              <InputNumber 
                addonAfter="₫" 
                style={{ width: '100%' }} 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Mỗi chặng gồm (số ga)" name="step_stops" rules={[{ required: true, message: 'Nhập số ga' }]}>
              <InputNumber addonAfter="ga" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ marginTop: 20 }}>
          <Button type="primary" icon={<SaveOutlined />} onClick={onSave} loading={loading} size="large" style={{ borderRadius: 8 }}>
            Lưu & Áp dụng cấu hình mới
          </Button>
        </div>
      </Form>
    </Card>
  );
};

// --- TAB 2: QUẢN LÝ CÁC GÓI VÉ ---
const TicketProductsTab = ({ data, loading, onEdit, onAdd }: any) => {
  const columns = [
    { title: 'Mã vé', dataIndex: 'code', key: 'code', render: (t: string) => <Tag color="blue"><b>{t}</b></Tag> },
    { title: 'Tên hiển thị', dataIndex: 'name_vi', key: 'name' },
    { 
    title: 'Loại', 
    dataIndex: 'type', 
    key: 'type', 
    // 🔥 SỬA TẠI ĐÂY: Hiển thị nhãn Tiếng Việt cho 2 loại vé
    render: (t: string) => <Tag color="cyan">{t === 'day_pass' ? 'Vé Ngày' : 'Vé Tháng'}</Tag>
  },
    { 
      title: 'Giá bán', dataIndex: 'price', key: 'price',
      render: (price: any) => price ? <b style={{ color: '#3f8600' }}>{Number(price).toLocaleString()} ₫</b> : '--'
    },
    // 🔥 Hiển thị ở bảng cũng bằng đơn vị Ngày cho đồng bộ
    { title: 'Thời hạn', dataIndex: 'duration_hours', key: 'duration', render: (h: any) => h ? `${h / 24} ngày` : '-' },
    { title: 'Trạng thái', dataIndex: 'state', render: (s: boolean) => <Tag color={s ? 'success' : 'error'}>{s ? 'Đang bán' : 'Ngưng'}</Tag> },
    { title: 'Hành động', key: 'action', render: (_: any, record: any) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
    )},
  ];

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Danh mục vé gói & Vé lượt</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Thêm vé gói mới</Button>
        </div>
      } 
      bordered={false}
    >
      <Table columns={columns} dataSource={data} rowKey="code" loading={loading} />
    </Card>
  );
};

const TicketManager: React.FC = () => {
  const { 
    loading, ticketProducts, fareForm, handleSaveFareRule, refresh,
    productForm, isProductModalOpen, openProductModal, closeProductModal, handleSaveProduct 
  } = useTicketManager();

  const items: TabsProps['items'] = [
    { key: '1', label: (<span><SettingOutlined /> Giá vé Lượt</span>), children: <FareRulesTab form={fareForm} onSave={handleSaveFareRule} loading={loading} /> },
    { key: '2', label: (<span><QrcodeOutlined /> Các gói Vé (Pass)</span>), children: <TicketProductsTab data={ticketProducts} loading={loading} onEdit={openProductModal} onAdd={() => openProductModal(null)} /> },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
         <Title level={3} style={{ margin: 0 }}>Quản lý Vé & Giá cước</Title>
         <Button icon={<ReloadOutlined />} onClick={refresh}>Làm mới</Button>
      </div>
      <Tabs defaultActiveKey="2" items={items} type="card" />

      <Modal
        title={productForm.getFieldValue('id_check') ? "Cập nhật gói vé" : "Tạo gói vé mới"}
        open={isProductModalOpen}
        onOk={handleSaveProduct}
        onCancel={closeProductModal}
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form form={productForm} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mã vé" name="code" rules={[{ required: true }]}>
                <Input placeholder="VD: MONTH_30" disabled={productForm.getFieldValue('id_check')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tên hiển thị" name="name_vi" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: Vé 1 Tháng" />
              </Form.Item>
            </Col>
          </Row>

          {/* 🔥 Ô LOẠI VÉ ĐÃ XUẤT HIỆN TRỞ LẠI */}
          <Form.Item label="Loại gói vé" name="type" rules={[{ required: true }]}>
          <Select placeholder="Chọn loại vé">
            <Option value="day_pass">Vé ngày (Day Pass)</Option>
            <Option value="monthly_pass">Vé tháng (Monthly Pass)</Option>
          </Select>
        </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giá tiền" name="price" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} addonAfter="₫" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* 🔥 ĐÃ SỬA: Chuyển sang đơn vị NGÀY */}
              <Form.Item label="Thời hạn sử dụng (Ngày)" name="duration_days" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} addonAfter="ngày" min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tự kích hoạt sau (Ngày)" name="auto_activate_after_days" initialValue={30}>
                <InputNumber style={{ width: '100%' }} addonAfter="ngày" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái" name="state" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="id_check" hidden><Input /></Form.Item>
          <Form.Item name="type" hidden initialValue="daily_pass"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TicketManager;