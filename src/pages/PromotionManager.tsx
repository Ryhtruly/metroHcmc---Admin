import React from 'react';
import { 
  Table, Tag, Button, Card, Modal, Form, Input, 
  Select, InputNumber, DatePicker, Switch, Row, Col 
} from 'antd';
import { GiftOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Import Hook logic
import { usePromotionManager } from '../hooks/usePromotionManager';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const PromotionManager: React.FC = () => {
  // Lấy mọi thứ từ Hook
  const { 
    loading, promotions, isModalOpen, promoType, setPromoType, 
    form, openModal, closeModal, handleSave 
  } = usePromotionManager();

  const columns = [
    { 
      title: 'Mã Code', dataIndex: 'code', key: 'code', 
      render: (t: string) => <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>{t}</Tag> 
    },
    { title: 'Tên chương trình', dataIndex: 'name', key: 'name' },
    { 
      title: 'Loại KM', dataIndex: 'promo_type', key: 'type',
      render: (t: string) => t === 'percent' ? <Tag color="cyan">Giảm %</Tag> : <Tag color="purple">Giảm tiền</Tag>
    },
    { 
      title: 'Giá trị', key: 'value',
      render: (_: any, r: any) => (
        <b style={{ color: r.promo_type === 'percent' ? '#13c2c2' : '#722ed1' }}>
          {r.promo_type === 'percent' ? `${r.discount_percent}%` : `${parseInt(r.discount_amount).toLocaleString()} ₫`}
        </b>
      )
    },
    { 
      title: 'Đơn tối thiểu', dataIndex: 'min_order_amount', key: 'min', 
      render: (v: string) => `${parseInt(v).toLocaleString()} ₫` 
    },
    { 
      title: 'Thời gian', key: 'time', 
      render: (_: any, r: any) => (
        <div style={{ fontSize: 12, color: '#666' }}>
          {r.starts_at ? dayjs(r.starts_at).format('DD/MM/YY') : '...'} - {r.ends_at ? dayjs(r.ends_at).format('DD/MM/YY') : '...'}
        </div>
      )
    },
    { 
      title: 'Trạng thái', dataIndex: 'state', key: 'state', 
      render: (s: boolean) => <Tag color={s ? 'success' : 'default'}>{s ? 'Đang chạy' : 'Tạm dừng'}</Tag> 
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>Sửa</Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2><GiftOutlined /> Quản lý Khuyến mãi</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Tạo mã mới
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table 
          columns={columns} 
          dataSource={promotions} 
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* MODAL FORM */}
      <Modal 
        title={form.getFieldValue('code') ? "Chỉnh sửa Khuyến mãi" : "Tạo Khuyến mãi Mới"} 
        open={isModalOpen} 
        onOk={handleSave} 
        onCancel={closeModal}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mã Code (Duy nhất)" name="code" rules={[{ required: true }]}>
                <Input placeholder="VD: SUMMER2025" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tên chương trình" name="name" rules={[{ required: true }]}>
                <Input placeholder="VD: Khuyến mãi Hè" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Loại giảm giá" name="promo_type">
                <Select onChange={(val) => setPromoType(val)}>
                  <Option value="percent">Theo %</Option>
                  <Option value="amount">Số tiền</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label={promoType === 'percent' ? "Phần trăm giảm" : "Số tiền giảm"} 
                name="value" 
                rules={[{ required: true }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter={promoType === 'percent' ? '%' : '₫'}
                  max={promoType === 'percent' ? 100 : undefined}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Đơn hàng tối thiểu" name="min_order_amount">
                <InputNumber 
                  style={{ width: '100%' }} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="Thời gian hiệu lực" name="time_range" rules={[{ required: true }]}>
                <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái" name="state" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManager;