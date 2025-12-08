import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, InputNumber,
  Select, DatePicker, App, Switch, Tooltip, Row, Col, Space
} from 'antd';
import { 
  PlusOutlined, GiftOutlined, EditOutlined, 
  QuestionCircleOutlined, ReloadOutlined, SoundOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const GiftcodeManager: React.FC = () => {
  const { message, modal } = App.useApp(); 
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State cho Modal Giftcode
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [ticketProducts, setTicketProducts] = useState<any[]>([]);

  // State cho Modal Thông báo (Tính năng mới)
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announceForm] = Form.useForm();

  // =================================================================
  // 1. Tải danh sách Loại vé (Dropdown)
  // =================================================================
  const fetchTicketProducts = async () => {
    try {
      const res = await axiosClient.get('/admin/ticket-products'); 
      let products = [];
      // Xử lý linh hoạt các trường hợp trả về của API
      if (Array.isArray(res.data)) products = res.data;
      else if (Array.isArray(res.data?.data)) products = res.data.data;
      else if (Array.isArray(res.data?.result?.data)) products = res.data.result.data;
      
      setTicketProducts(products);
    } catch (err) {
      console.error("Lỗi tải danh sách vé:", err);
    }
  };

  // =================================================================
  // 2. Tải danh sách Giftcode (FIX LỖI BẢNG TRỐNG)
  // =================================================================
  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/giftcodes');
      console.log("API Response Giftcodes:", res.data); 

      // Logic tìm mảng dữ liệu dù Backend trả về kiểu nào
      let rawData = [];
      if (Array.isArray(res.data)) {
          rawData = res.data;
      } else if (Array.isArray(res.data?.data)) {
          rawData = res.data.data;
      } else if (res.data?.result && Array.isArray(res.data.result.data)) {
          rawData = res.data.result.data;
      } else if (res.data?.success && res.data?.data) {
          rawData = res.data.data;
      }

      const transformed = rawData.map((item: any) => {
        let status = "Đã tắt";
        const now = dayjs();
        const start = item.starts_at ? dayjs(item.starts_at) : null;
        const end = item.expires_at ? dayjs(item.expires_at) : null;

        if (item.is_active) {
            if (start && now.isBefore(start)) status = "Chưa tới ngày";
            else if (end && now.isAfter(end)) status = "Hết hạn";
            else if (item.used_count >= item.max_usage) status = "Hết lượt";
            else status = "Đang chạy";
        }
        return { ...item, status };
      });
      setCodes(transformed);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách giftcode!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
    fetchTicketProducts();
  }, []);

  // =================================================================
  // 3. Xử lý Modal Giftcode
  // =================================================================
  const openModal = (record?: any) => {
    if (record) {
      setIsEditMode(true);
      form.setFieldsValue({
        ...record,
        promo_id: record.promo_id,
        starts_at: record.starts_at ? dayjs(record.starts_at) : null,
        expires_at: record.expires_at ? dayjs(record.expires_at) : null,
        ticket_product_code: record.reward_value, // Mapping đúng trường
      });
    } else {
      setIsEditMode(false);
      form.resetFields();
      form.setFieldsValue({ 
          quantity: 1, 
          max_usage: 1, 
          is_active: true, 
          starts_at: dayjs() 
      });
    }
    setIsModalOpen(true);
  };

  // =================================================================
  // 4. Lưu Giftcode (Tạo hoặc Sửa)
  // =================================================================
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // FIX LỖI TIMEZONE (Gửi string y hệt giờ chọn)
      const fmt = 'YYYY-MM-DD HH:mm:ss';
      
      const payload = {
        promo_id: isEditMode ? form.getFieldValue('promo_id') : undefined,
        p_prefix: values.code,
        p_quantity: values.quantity,
        p_max_usage: values.max_usage,
        p_ticket_product_code: values.ticket_product_code,
        p_starts_at: values.starts_at ? values.starts_at.format(fmt) : null,
        p_expires_at: values.expires_at ? values.expires_at.format(fmt) : null,
        p_is_active: isEditMode ? values.is_active : true,
      };

      let res;
      if (isEditMode) {
         res = await axiosClient.put(`/admin/giftcodes/${payload.promo_id}`, payload);
      } else {
         res = await axiosClient.post('/admin/giftcodes', payload);
      }

      if (res.data?.ok || res.data?.success) {
        message.success("Thành công!");
        setIsModalOpen(false);
        fetchCodes();

        // === LOGIC MỚI: HỎI TẠO THÔNG BÁO ===
        // Nếu tạo mới (Quantity = 1) -> Hỏi tạo thông báo
        if (!isEditMode && values.quantity === 1) {
            modal.confirm({
                title: '📢 Tạo thông báo sự kiện/đền bù?',
                icon: <SoundOutlined style={{ color: '#1890ff' }} />,
                content: `Bạn vừa tạo mã chung [${values.code}]. Bạn có muốn đăng thông báo công khai cho mã này không?`,
                okText: 'Soạn thông báo ngay',
                cancelText: 'Không, để sau',
                onOk: () => openAnnounceModal(values.code),
            });
        }

      } else {
        message.error(res.data?.message || "Thao tác thất bại");
      }
    } catch (err: any) {
      console.error(err);
      message.error("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // =================================================================
  // 5. Logic Thông Báo Tự Động
  // =================================================================
  const openAnnounceModal = (code: string) => {
      // Mẫu nội dung soạn sẵn
      const templateTitle = `🎁 Quà tặng/Đền bù: Nhập mã ${code}`;
      const templateContent = `Thân gửi quý hành khách,\n\n[NHẬP LÝ DO: Ví dụ: Chúng tôi xin lỗi vì sự cố gián đoạn dịch vụ...]\n\nĐể tri ân, BQL Đường sắt Đô thị xin gửi tặng bạn mã đổi vé miễn phí:\n\n👉 **MÃ CODE: ${code}**\n\n⏳ Hạn sử dụng: Vui lòng xem chi tiết khi đổi.\n\nTrân trọng,\nHCMC Metro.`;

      announceForm.setFieldsValue({
          title: templateTitle,
          content_md: templateContent,
          is_active: true
      });
      setIsAnnounceModalOpen(true);
  };

  const handleSaveAnnouncement = async () => {
      try {
          const values = await announceForm.validateFields();
          // Gọi API tạo thông báo
          const res = await axiosClient.post('/admin/announcements', {
              title: values.title,
              content_md: values.content_md,
              is_active: values.is_active,
              // visible_from: new Date(), 
          });

          if (res.data) {
              message.success("Đã đăng thông báo thành công!");
              setIsAnnounceModalOpen(false);
          }
      } catch (err: any) {
          message.error("Lỗi đăng thông báo: " + err.message);
      }
  };

  // =================================================================
  // Cấu hình cột bảng
  // =================================================================
  const columns = [
    { title: 'Prefix/Mã', dataIndex: 'code', width: 180, render: (t:string) => <Tag color="blue" style={{ fontSize: 14 }}>{t}</Tag> },
    { title: 'Loại quà', dataIndex: 'product_name', width: 150 },
    { title: 'Mã vé', dataIndex: 'reward_value', width: 120, render: (t:string) => <Tag>{t}</Tag> },
    { title: 'Đã dùng', dataIndex: 'used_count', width: 100, align: 'center' as const, render: (v:number, r:any) => <b>{v} / {r.max_usage}</b> },
    { title: 'Ngày bắt đầu', dataIndex: 'starts_at', width: 140, render: (t:string) => t ? dayjs(t).format('DD/MM/YY HH:mm') : '-' },
    { title: 'Ngày hết hạn', dataIndex: 'expires_at', width: 140, render: (t:string) => t ? dayjs(t).format('DD/MM/YY HH:mm') : <Tag color="green">Vĩnh viễn</Tag> },
    { 
        title: 'Trạng thái', dataIndex: 'status', width: 120,
        render: (s:string) => {
            let color = 'default';
            if (s === 'Đang chạy') color = 'success';
            if (s === 'Hết hạn' || s === 'Hết lượt') color = 'error';
            if (s === 'Chưa tới ngày') color = 'warning';
            return <Tag color={color}>{s}</Tag>;
        }
    },
    {
      title: 'Hành động', key: 'action', width: 80, fixed: 'right' as const, align: 'center' as const,
      render: (_:any, record:any) => (
        <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} />
      )
    }
  ];

  return (
    <Card 
      title={<Space><GiftOutlined /> Quản lý Giftcode</Space>} 
      extra={
        <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCodes}>Làm mới</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Tạo mã hàng loạt</Button>
        </Space>
      }
    >
      <Table 
        dataSource={codes} 
        columns={columns} 
        rowKey="promo_id" 
        loading={loading} 
        scroll={{ x: 1200 }} 
        pagination={{ pageSize: 10 }} 
      />

      {/* MODAL 1: TẠO/SỬA GIFTCODE */}
      <Modal
        title={isEditMode ? "Chỉnh sửa Giftcode" : "Tạo Giftcode mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical">
            <Form.Item name="promo_id" hidden><Input /></Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        label={isEditMode ? "Mã Code" : "Prefix / Mã Code (VD: DENBU2025)"} 
                        name="code" 
                        rules={[{ required: true, message: 'Vui lòng nhập' }]}
                    >
                        <Input disabled={isEditMode} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    {!isEditMode && (
                        <Form.Item 
                            label="Số lượng tạo (Nhập 1 để tạo mã chung)" 
                            name="quantity" 
                            initialValue={1}
                        >
                            <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                        </Form.Item>
                    )}
                </Col>
            </Row>

            <Form.Item label="Loại vé tặng" name="ticket_product_code" rules={[{ required: true, message: 'Chọn loại vé' }]}>
                <Select placeholder="Chọn loại vé">
                    {ticketProducts.map(p => (
                        <Option key={p.code} value={p.code} disabled={!p.state}>
                            {p.name_vi} ({p.price > 0 ? p.price.toLocaleString() : 0}đ) - Mã: {p.code}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        label="Lượt dùng tối đa / mã (Nhập lớn nếu là mã chung)" 
                        name="max_usage" 
                        initialValue={1}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    {isEditMode && (
                        <Form.Item label="Trạng thái kích hoạt" name="is_active" valuePropName="checked">
                            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                        </Form.Item>
                    )}
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        label="Ngày bắt đầu" 
                        name="starts_at"
                        rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}
                    >
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item 
                        label={
                            <span>
                                Ngày hết hạn &nbsp;
                                <Tooltip title="Để trống = Vĩnh viễn.">
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </span>
                        } 
                        name="expires_at"
                    >
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} placeholder="Vĩnh viễn" />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
      </Modal>

      {/* MODAL 2: TẠO THÔNG BÁO TỰ ĐỘNG */}
      <Modal 
        title="📢 Đăng thông báo đền bù/sự kiện" 
        open={isAnnounceModalOpen} 
        onCancel={() => setIsAnnounceModalOpen(false)} 
        onOk={handleSaveAnnouncement}
        okText="Đăng thông báo ngay"
        width={600}
      >
          <Form form={announceForm} layout="vertical">
              <Form.Item label="Tiêu đề thông báo" name="title" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item 
                label="Nội dung (Đã điền sẵn mã, hãy sửa lý do)" 
                name="content_md" 
                rules={[{ required: true }]}
              >
                  <TextArea rows={8} showCount />
              </Form.Item>
              <Form.Item name="is_active" valuePropName="checked" label="Hiển thị ngay cho người dùng">
                  <Switch defaultChecked />
              </Form.Item>
          </Form>
      </Modal>
    </Card>
  );
};

export default GiftcodeManager;