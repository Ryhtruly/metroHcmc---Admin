import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, InputNumber,
  Select, DatePicker, App, Switch, Tooltip, Row, Col, Space
} from 'antd';
import { PlusOutlined, GiftOutlined, QuestionCircleOutlined, EditOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Option } = Select;

// --- 1. INTERFACE CHO DỮ LIỆU GIFTCODE TỪ API/DB ---
interface Giftcode {
  promo_id: string;
  code: string;
  reward_type: string;
  ticket_product_id: number | null;
  discount_amount: number | null;
  discount_percent: number | null;
  max_usage: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  starts_at: string | null;

  // Client-side transformed properties
  reward_value: string;
  status: string;
  ticket_name_vi?: string;
}

interface TicketProduct {
  id: number;
  code: string;
  name_vi: string;
  type: string;
}

const GiftcodeManager: React.FC = () => {
  const { message, modal } = App.useApp();
  const [codes, setCodes] = useState<Giftcode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [ticketProducts, setTicketProducts] = useState<TicketProduct[]>([]);

  // =========================
  // FETCH DATA & LOGIC
  // =========================

  const fetchTicketProducts = async () => {
    try {
      const res = await axiosClient.get('/admin/ticket-products');
      const products = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTicketProducts(products);
    } catch (err) {
      console.error("Lỗi tải sản phẩm vé:", err);
      message.error("Không thể tải danh sách sản phẩm vé!");
    }
  };

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/giftcodes');
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const transformed: Giftcode[] = raw.map((item: any) => {
        let status = "Đã tắt";
        const now = dayjs();

        if (item.is_active) {
            if (item.starts_at && now.isBefore(dayjs(item.starts_at))) {
                status = "Chưa tới ngày";
            } else if (item.expires_at && now.isAfter(dayjs(item.expires_at))) {
                status = "Hết hạn";
            } else if (item.used_count >= item.max_usage) {
                status = "Hết lượt";
            } else {
                status = "Đang chạy";
            }
        }
        
        const reward_value = item.reward_value || '';

        return { ...item, reward_value, status };
      });

      setCodes(transformed);

    } catch (err) {
      console.error("Lỗi tải Giftcode:", err);
      message.error("Không thể tải danh sách giftcode!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
    fetchTicketProducts();
  }, []);

  const openModal = (record?: Giftcode) => {
    if (record) {
      setIsEditMode(true);
      form.setFieldsValue({
        ...record,
        starts_at: record.starts_at ? dayjs(record.starts_at) : null,
        ticket_product_code: record.reward_value,
      });
    } else {
      setIsEditMode(false);
      form.resetFields();
      form.setFieldsValue({ quantity: 1, max_usage: 1, is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    form.resetFields();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      console.log('Form Values:', values); // Kiểm tra giá trị đã nhập

      let res;

      if (isEditMode) {
        const payload = {
          max_usage: values.max_usage,
          ticket_product_code: values.ticket_product_code,
          starts_at: values.starts_at ? values.starts_at.toISOString() : null,
          is_active: values.is_active,
        };
        console.log('Payload for Edit:', payload);  // Debug payload khi chỉnh sửa
        res = await axiosClient.put(`/admin/giftcodes/${values.promo_id}`, payload);
      } else {
        const payload = {
          prefix: values.code,
          quantity: values.quantity,
          max_usage: values.max_usage,
          ticket_product_code: values.ticket_product_code,
          starts_at: values.starts_at ? values.starts_at.toISOString() : new Date().toISOString(), // Nếu không có ngày, dùng ngày hiện tại
          is_active: true,
        };
        console.log('Payload for New Giftcode:', payload);  // Debug payload khi tạo mới
        res = await axiosClient.post('/admin/giftcodes/batch', payload);
      }

      if (res && res.data && res.data.ok) {
        const count = res.data.data?.count || 1;
        const successMsg = isEditMode
          ? `Đã cập nhật mã ${values.code} thành công`
          : `Đã tạo ${count} mã giftcode thành công`;
        message.success(successMsg);
        closeModal();
        fetchCodes(); // Refresh data
      } else {
        message.error(res?.data?.message || (isEditMode ? "Cập nhật thất bại!" : "Tạo mới thất bại!"));
      }
    } catch (err: any) {
      if (err.errorFields) return; // Antd validation error
      console.error("Error during saving:", err); // Debug lỗi xảy ra khi lưu
      message.error(err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã Code',
      dataIndex: 'code',
      render: (t: string) => <Tag color="blue">{t}</Tag>,
      width: 150,
      sorter: (a: Giftcode, b: Giftcode) => a.code.localeCompare(b.code),
    },
    {
      title: 'Loại quà',
      dataIndex: 'reward_type',
      render: (t: string, record: Giftcode) => {
        const type = (t || '').toUpperCase();
        const displayName = record.ticket_name_vi || t || 'Không xác định';
        if (type.includes('DAY_PASS')) return <Tag color="green">{displayName}</Tag>;
        if (type.includes('MONTHLY_PASS')) return <Tag color="purple">{displayName}</Tag>;
        return <Tag>{displayName}</Tag>;
      },
      width: 150,
    },
    {
      title: 'Giá trị (Mã Vé)',
      dataIndex: 'reward_value',
      render: (t: string) => t ? <Tag color="cyan">{t}</Tag> : 'N/A',
      width: 140,
    },
    {
      title: 'Đã dùng / Tối đa',
      dataIndex: 'used_count',
      render: (used_count: number, record: Giftcode) => (
        `${used_count} / ${record.max_usage}`
      ),
      width: 150,
      align: 'center' as const,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'starts_at',
      render: (t: string) =>
        t ? dayjs(t).format('DD/MM/YY HH:mm') : 'Áp dụng ngay',
      width: 160,
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expires_at',
      render: (t: string) =>
        t ? dayjs(t).format('DD/MM/YY HH:mm') : 'Không có',
      width: 160,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const color =
          status === "Đang chạy" ? "green" :
          status === "Chưa tới ngày" ? "blue" :
          status === "Hết hạn" ? "red" :
          status === "Hết lượt" ? "orange" :
          "default";
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: Giftcode) => (
        <Space size="small">
            <Tooltip title="Sửa">
                <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
            </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <App>
        <div className="animate-fade-in p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700 flex items-center">
                <GiftOutlined className="mr-2 text-blue-500" /> Quản lý Giftcode
            </h2>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
            >
                Tạo mã hàng loạt
            </Button>
        </div>

        <Card className="shadow-lg rounded-lg">
            <Table
                columns={columns}
                dataSource={codes}
                rowKey="promo_id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 1300 }}
            />
        </Card>

        <Modal
            title={isEditMode ? "Chỉnh sửa Giftcode" : "Tạo Giftcode hàng loạt"}
            open={isModalOpen}
            onCancel={closeModal}
            onOk={handleSave}
            okText={isEditMode ? "Cập nhật" : "Tạo mã"}
            confirmLoading={loading}
            width={600}
            destroyOnClose
        >
            <Form key={isModalOpen ? "open" : "closed"} form={form} layout="vertical" name="giftcode_form">
                {isEditMode && (
                    <Form.Item name="promo_id" hidden><Input /></Form.Item>
                )}

                <Row gutter={16}>
                    <Col span={isEditMode ? 24 : 12}>
                        <Form.Item
                            label={isEditMode ? "Mã Code" : "Prefix (vd: TET2025)"}
                            name="code"
                            rules={[{ required: true, message: 'Vui lòng nhập prefix' }]}
                        >
                            {isEditMode ? (
                                <Input disabled />
                            ) : (
                                <Input placeholder="TET2025, HE2025,..." />
                            )}
                        </Form.Item>
                    </Col>

                    {!isEditMode && (
                        <Col span={12}>
                            <Form.Item label="Số lượng tạo" name="quantity" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                                <InputNumber min={1} max={5000} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Form.Item label="Số lần dùng tối đa / mã" name="max_usage" rules={[{ required: true, message: 'Vui lòng nhập số lần dùng' }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Loại quà tặng (Vé)" name="ticket_product_code" rules={[{ required: true, message: 'Vui lòng chọn loại vé' }]}>
                    <Select placeholder="Chọn loại vé (Day Pass, Monthly Pass...)">
                        {ticketProducts
                            .filter(p => p.type !== 'single_ride') 
                            .map(product => (
                                <Option key={product.id} value={product.code}>
                                    {product.name_vi} ({product.code})
                                </Option>
                            ))}
                    </Select>
                </Form.Item>

                <Row gutter={16} align="bottom">
                    <Col span={isEditMode ? 12 : 24}>
                        <Form.Item
                            label={
                                <span>
                                    Ngày bắt đầu hiệu lực &nbsp;
                                    <Tooltip title="Ngày hết hạn sẽ được tính tự động dựa trên loại vé. Để trống nếu muốn mã có hiệu lực ngay.">
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                                </span>
                            }
                            name="starts_at"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm:ss" />
                        </Form.Item>
                    </Col>

                    {isEditMode && (
                        <Col span={12}>
                            <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
                                <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
                            </Form.Item>
                        </Col>
                    )}
                </Row>
            </Form>
        </Modal>
        </div>
    </App>
  );
};

export default GiftcodeManager;
