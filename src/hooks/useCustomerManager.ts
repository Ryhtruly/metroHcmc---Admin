import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { message } from 'antd';

export const useCustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get('/admin/customers');
      setCustomers(res.data || res); 
    } catch (error) {
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 Hàm cập nhật trạng thái
  const updateUserStatus = async (userId: string, status: boolean) => {
    try {
      await axiosClient.patch(`/admin/customers/${userId}/status`, { status });
      message.success('Cập nhật trạng thái thành công');
      fetchCustomers();
    } catch (e) {
      message.error('Thao tác thất bại');
    }
  };

const fetchRideHistory = async (userId: string) => {
  try {
    const res: any = await axiosClient.get(`/admin/customers/${userId}/history`);
    return res.data || res || [];
  } catch (e) {
    message.error('Không thể lấy lịch sử đi tàu');
    return [];
  }
};

const fetchAvailableCodes = async () => {
  try {
    const res: any = await axiosClient.get('/admin/giftcodes/available');
    return res.data || res || []; 
  } catch (e) {
    message.error('Không thể lấy danh sách mã');
    return [];
  }
};

const sendGiftToUser = async (userId: string, promoCode: string, title: string, content: string) => {
  try {
    const res: any = await axiosClient.post('/admin/customers/send-gift', { 
      userId, promoCode, title, content 
    });
    return res.success || res.data?.success;
  } catch (e) { return false; }
};
  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return { 
    customers, 
    loading, 
    refresh: fetchCustomers,
    updateUserStatus,
    fetchRideHistory,
    fetchAvailableCodes,
    sendGiftToUser
  };
};