import { useState, useEffect, useCallback } from 'react';
import { Form, message } from 'antd';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

export const usePromotionManager = () => {
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoType, setPromoType] = useState<'percent' | 'amount'>('percent');
  
  // Ant Design Form Instance
  const [form] = Form.useForm();

  // 1. Lấy danh sách
  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get('/admin/promotions');
      if (res.ok) {
        setPromotions(res.data);
      }
    } catch (error) {
      message.error('Lỗi tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // 2. Mở Modal (Tạo mới hoặc Sửa)
  const openModal = (record?: any) => {
    if (record) {
      // Mode: Sửa
      setPromoType(record.promo_type);
      form.setFieldsValue({
        ...record,
        // Mapping lại giá trị cho khớp với form
        value: record.promo_type === 'percent' ? record.discount_percent : record.discount_amount,
        time_range: [
          record.starts_at ? dayjs(record.starts_at) : null, 
          record.ends_at ? dayjs(record.ends_at) : null
        ],
        state: record.state
      });
    } else {
      // Mode: Tạo mới
      setPromoType('percent');
      form.resetFields();
      form.setFieldsValue({ state: true, promo_type: 'percent' });
    }
    setIsModalOpen(true);
  };

  // 3. Đóng Modal
  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // 4. Lưu dữ liệu
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        code: values.code,
        name: values.name,
        description: values.description,
        promo_type: values.promo_type,
        discount_percent: values.promo_type === 'percent' ? values.value : null,
        discount_amount: values.promo_type === 'amount' ? values.value : null,
        min_order_amount: values.min_order_amount,
        starts_at: values.time_range ? values.time_range[0].toISOString() : null,
        ends_at: values.time_range ? values.time_range[1].toISOString() : null,
        state: values.state
      };

      const res: any = await axiosClient.post('/admin/promotions', payload);
      
      if (res.ok) {
        message.success('Lưu khuyến mãi thành công!');
        closeModal();
        fetchPromotions(); // Refresh lại bảng
      } else {
        message.error('Lỗi: ' + (res.message || 'Không thể lưu'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    promotions,
    isModalOpen,
    promoType,
    setPromoType,
    form,
    openModal,
    closeModal,
    handleSave,
    refresh: fetchPromotions
  };
};