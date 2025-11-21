import { useState, useEffect, useCallback } from 'react';
import { Form, message } from 'antd';
import axiosClient from '../api/axiosClient';

export const useTicketManager = () => {
  const [loading, setLoading] = useState(false);
  const [fareRules, setFareRules] = useState<any[]>([]);
  const [ticketProducts, setTicketProducts] = useState<any[]>([]);
  
  // Form 1: Cấu hình giá vé lượt
  const [fareForm] = Form.useForm();

  // Form 2: Sửa gói vé (MỚI)
  const [productForm] = Form.useForm();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [ setEditingProduct] = useState<any>(null);

  // 1. Hàm lấy dữ liệu
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRules, resProducts]: any = await Promise.all([
        axiosClient.get('/admin/fare-rules'),
        axiosClient.get('/admin/ticket-products')
      ]);

      if (resRules.ok) {
        setFareRules(resRules.data);
        // Điền dữ liệu vào form giá vé lượt
        const activeRule = resRules.data.find((r: any) => r.state) || resRules.data[0];
        if (activeRule) {
          fareForm.setFieldsValue({
            ...activeRule,
            base_price: Number(activeRule.base_price),
            step_price: Number(activeRule.step_price)
          });
        }
      }

      if (resProducts.ok) {
        setTicketProducts(resProducts.data);
      }

    } catch (error) {
      message.error('Lỗi tải dữ liệu vé');
    } finally {
      setLoading(false);
    }
  }, [fareForm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Lưu Fare Rule
  const handleSaveFareRule = async () => {
    try {
      const values = await fareForm.validateFields();
      setLoading(true);
      const res: any = await axiosClient.post('/admin/fare-rules', values);
      if (res.ok) {
        message.success('Cập nhật giá vé lượt thành công!');
        fetchData();
      } else {
        message.error('Lỗi: ' + res.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁC HÀM MỚI CHO MODAL SỬA VÉ ---

  // Mở Modal Sửa
  const openProductModal = (record: any) => {
    setEditingProduct(record);
    productForm.setFieldsValue({
      ...record,
      price: Number(record.price), // Chuyển string sang number để InputNumber hiểu
      // Nếu là vé lượt thì giá = 0 hoặc null
    });
    setIsProductModalOpen(true);
  };

  // Đóng Modal
  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    productForm.resetFields();
  };

  // Lưu Gói Vé
  const handleSaveProduct = async () => {
    try {
      const values = await productForm.validateFields();
      setLoading(true);

      // Chuẩn bị dữ liệu gửi đi
      const payload = {
        code: values.code, // Mã vé không đổi (hoặc tạo mới nếu làm tính năng thêm)
        name_vi: values.name_vi,
        type: values.type,
        price: values.type === 'single_ride' ? null : values.price, // Vé lượt không có giá cố định
        duration_hours: values.duration_hours,
        auto_activate_after_days: values.auto_activate_after_days,
        state: values.state
      };

      const res: any = await axiosClient.post('/admin/ticket-products', payload);

      if (res.ok) {
        message.success('Cập nhật gói vé thành công!');
        closeProductModal();
        fetchData(); // Reload lại bảng
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
    fareRules,
    ticketProducts,
    fareForm,
    handleSaveFareRule,
    refresh: fetchData,
    // Return thêm các biến mới
    productForm,
    isProductModalOpen,
    openProductModal,
    closeProductModal,
    handleSaveProduct
  };
};