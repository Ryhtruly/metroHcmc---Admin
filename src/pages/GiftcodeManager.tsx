import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, InputNumber,
  Select, DatePicker, App
} from 'antd';
import { PlusOutlined, GiftOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient'; // Đảm bảo đường dẫn này đúng
import dayjs from 'dayjs';

const { Option } = Select;

// --- 1. INTERFACE CHO DỮ LIỆU GIFTCODE TỪ API/DB ---
interface Giftcode {
  promo_id: string; 
  code: string;
  reward_type: 'TICKET' | 'DISCOUNT_AMOUNT' | 'DISCOUNT_PERCENT' | string;
  ticket_type_id: number | null;
  discount_amount: number | null;
  discount_percent: number | null;
  max_usage: number; 
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  // SỬA: Đồng bộ với Backend, sử dụng 'starts_at'
  starts_at: string | null; 
  
  // Các thuộc tính bổ sung được tính toán trong code hoặc lấy từ Backend
  reward_value: string;
  status: string;
}

const GiftcodeManager: React.FC = () => {
  const { message } = App.useApp();
  const [codes, setCodes] = useState<Giftcode[]>([]); 
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // =========================
  // GET LIST GIFTCODE
  // =========================
  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/giftcodes');

      // Backend trả về { ok: true, data: [...] } hoặc trực tiếp array (tùy cấu hình)
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      // Add reward_value + status. Khai báo kiểu cho item: Giftcode
      const transformed: Giftcode[] = raw.map((item: Giftcode) => { 
        
        // 1. Tính giá trị (reward_value)
        // LƯU Ý: Nếu Backend đã tính toán trường 'reward_value' (như trong hàm SQL),
        // bạn có thể BỎ QUA logic này và dùng trực tiếp item.reward_value
        const reward_value =
          item.reward_type === "TICKET"
            ? `Vé ID ${item.ticket_type_id}`
            : item.reward_type === "DISCOUNT_AMOUNT"
            ? `${item.discount_amount?.toLocaleString()} ₫`
            : item.reward_type === "DISCOUNT_PERCENT"
            ? `${item.discount_percent}%`
            : "N/A";

        // 2. Tính trạng thái real–time (status)
        // LƯU Ý: Nếu Backend đã tính toán trường 'computed_status' (như trong hàm SQL),
        // bạn có thể BỎ QUA logic này và mapping từ computed_status sang tiếng Việt.
        let status = "Đang chạy"; // Giả định mặc định là đang chạy
        const now = dayjs();

        if (!item.is_active) {
            status = "Đã tắt";
        } 
        // SỬA: Thay item.start_at bằng item.starts_at
        else if (item.starts_at && now.isBefore(dayjs(item.starts_at))) {
          status = "Chưa tới ngày";
        } else if (item.expires_at && now.isAfter(dayjs(item.expires_at))) {
          status = "Hết hạn";
        } else if (item.used_count >= item.max_usage) {
          status = "Hết lượt";
        } 
        
        // Trả về đối tượng Giftcode đã được thêm 2 trường mới
        return { ...item, reward_value, status };
      });

      setCodes(transformed);

    } catch (err) {
      message.error("Không thể tải danh sách giftcode!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: 'Mã Code',
      dataIndex: 'code',
      render: (t: string) => <Tag color="blue">{t}</Tag>
    },
    {
      title: 'Loại quà',
      dataIndex: 'reward_type',
      render: (t: string) => {
        const type = t.toUpperCase();
        if (type === 'TICKET') return <Tag color="green">Tặng vé</Tag>;
        if (type === 'DISCOUNT_AMOUNT') return <Tag color="purple">Giảm tiền</Tag>;
        if (type === 'DISCOUNT_PERCENT') return <Tag color="cyan">Giảm %</Tag>;
        return <Tag>{type}</Tag>;
      }
    },
    {
      title: 'Giá trị',
      dataIndex: 'reward_value'
    },
    {
      title: 'Đã dùng / SL Tối đa', 
      dataIndex: 'used_count',
      render: (used_count: number, record: Giftcode) => (
        `${used_count} / ${record.max_usage}`
      ),
      width: 150
    },
    {
      title: 'Ngày bắt đầu',
      // SỬA: dataIndex là 'starts_at'
      dataIndex: 'starts_at', 
      render: (t: string) =>
        t ? dayjs(t).format('DD/MM/YY HH:mm') : 'Không'
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expires_at',
      render: (t: string) =>
        t ? dayjs(t).format('DD/MM/YY HH:mm') : 'Không'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (t: string) => {
        const color =
          t === "Đang chạy" ? "green" :
          t === "Chưa tới ngày" ? "blue" :
          t === "Hết hạn" ? "red" :
          t === "Hết lượt" ? "orange" :
          "default";
        return <Tag color={color}>{t}</Tag>;
      }
    },
  ];

  // =========================
  // CREATE GIFTCODE BATCH
  // =========================
  const handleCreate = async () => {
    try {
      // Validate trước khi lấy giá trị
      const values = await form.validateFields();

      const payload = {
        prefix: values.prefix,
        quantity: values.quantity,
        reward_type: values.reward_type,
        ticket_type_id: values.ticket_type_id ?? null,
        discount_amount: values.discount_amount ?? null,
        discount_percent: values.discount_percent ?? null,
        // SỬA: Thay values.start_at bằng values.starts_at
        starts_at: values.starts_at ? values.starts_at.toISOString() : null,
        expires_at: values.expires_at ? values.expires_at.toISOString() : null,
        max_usage: values.max_usage
      };

      const res = await axiosClient.post('/admin/giftcodes/batch', payload);

      // Giả định API trả về { ok: boolean, count: number }
      if (res.data.ok) { 
        message.success(`Đã tạo ${res.data.count} giftcode thành công`);
        setIsModalOpen(false);
        form.resetFields();
        fetchCodes(); // Tải lại danh sách
      } else {
        message.error("Tạo giftcode thất bại!");
      }

    } catch (err: any) {
      if (err.errorFields) return; // Bỏ qua nếu là lỗi validate của Antd
      message.error(err.response?.data?.message || "Lỗi hệ thống khi tạo mã");
    }
  };

  // =========================
  // RENDER COMPONENT
  // =========================
  return (
    <div className="animate-fade-in">

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2><GiftOutlined /> Quản lý Giftcode</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Tạo mã hàng loạt
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <Table
          columns={columns}
          dataSource={codes}
          rowKey="promo_id"
          loading={loading}
          pagination={{ pageSize: 15 }}
        />
      </Card>

      {/* MODAL */}
      <Modal
        title="Tạo Giftcode hàng loạt"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreate}
        okText="Tạo mã"
        confirmLoading={loading}
      >
        <Form layout="vertical" form={form} initialValues={{ quantity: 1, max_usage: 1 }}>

          <Form.Item label="Prefix (vd: TET2025)" name="prefix" rules={[{ required: true, message: 'Vui lòng nhập prefix' }]}>
            <Input placeholder="TET2025" />
          </Form.Item>

          <Form.Item label="Số lượng tạo" name="quantity" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
            <InputNumber min={1} max={5000} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="Số lần dùng tối đa/mã" name="max_usage" rules={[{ required: true, message: 'Vui lòng nhập số lần dùng' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Loại quà tặng" name="reward_type" rules={[{ required: true, message: 'Vui lòng chọn loại quà tặng' }]}>
            <Select>
              <Option value="TICKET">Tặng vé</Option>
              <Option value="DISCOUNT_AMOUNT">Giảm tiền</Option>
              <Option value="DISCOUNT_PERCENT">Giảm phần trăm</Option>
            </Select>
          </Form.Item>

          {/* CONDITIONAL FIELDS */}
          <Form.Item noStyle shouldUpdate>
            {() => {
              const type = form.getFieldValue('reward_type');

              if (type === 'TICKET')
                return (
                  <Form.Item
                    label="Ticket Type ID"
                    name="ticket_type_id"
                    rules={[{ required: true, message: 'Vui lòng nhập Ticket ID' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                );

              if (type === 'DISCOUNT_AMOUNT')
                return (
                  <Form.Item
                    label="Số tiền giảm (VND)"
                    name="discount_amount"
                    rules={[{ required: true, message: 'Vui lòng nhập số tiền giảm' }]}
                  >
                    <InputNumber min={1000} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                  </Form.Item>
                );

              if (type === 'DISCOUNT_PERCENT')
                return (
                  <Form.Item
                    label="Phần trăm giảm"
                    name="discount_percent"
                    rules={[{ required: true, message: 'Vui lòng nhập phần trăm giảm' }]}
                  >
                    <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="%" />
                  </Form.Item>
                );

              return null;
            }}
          </Form.Item>

          {/* SỬA: name của Form.Item là 'starts_at' */}
          <Form.Item label="Ngày bắt đầu" name="starts_at">
            <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm:ss" />
          </Form.Item>

          <Form.Item label="Ngày hết hạn" name="expires_at">
            <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm:ss" />
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default GiftcodeManager;