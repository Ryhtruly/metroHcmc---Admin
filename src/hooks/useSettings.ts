import { useState, useEffect, useCallback } from 'react';
import { message, Form } from 'antd';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

export const useSettings = () => {
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu cho 3 tab
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Bộ lọc ngày tháng (Mặc định: 30 ngày gần nhất)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'), 
    dayjs()
  ]);

  // Form tạo thông báo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [annForm] = Form.useForm();

  // 1. Hàm lấy dữ liệu (Chạy song song)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const fromStr = dateRange[0].toISOString();
      const toStr = dateRange[1].toISOString();

      const [resAnn, resAudit, resPay] = await Promise.all([
        axiosClient.get('/admin/announcements'),
        axiosClient.get(`/admin/audit?from_ts=${fromStr}&to_ts=${toStr}`),
        axiosClient.get(`/admin/payments?from_ts=${fromStr}&to_ts=${toStr}`)
      ]);

      if ((resAnn as any).ok) setAnnouncements((resAnn as any).data);
      if ((resAudit as any).ok) setAuditLogs((resAudit as any).data?.logs || []);
      if ((resPay as any).ok) setPayments((resPay as any).data?.payments || []);

    } catch (error) {
      console.error(error);
      message.error('Lỗi tải dữ liệu hệ thống');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Hàm lưu thông báo mới
  const handleSaveAnnouncement = async () => {
    try {
      const values = await annForm.validateFields();
      setLoading(true);

      const payload = {
        title: values.title,
        content_md: values.content,
        // Nếu type là 'system' thì có thể format tiêu đề khác, ở đây giữ nguyên
        visible_from: dayjs().toISOString(),
        is_active: true
      };

      const res: any = await axiosClient.post('/admin/announcements', payload);
      
      if (res.ok) {
        message.success('Đăng thông báo thành công!');
        setIsModalOpen(false);
        annForm.resetFields();
        fetchData(); // Reload lại danh sách
      } else {
        message.error('Lỗi: ' + res.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    announcements,
    auditLogs,
    payments,
    dateRange,
    setDateRange,
    refresh: fetchData,
    // Modal Logic
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    annForm,
    handleSaveAnnouncement
  };
};