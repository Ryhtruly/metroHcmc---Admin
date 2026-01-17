import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { message } from 'antd';

export const useCustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- TRẠNG THÁI CHO LỊCH SỬ MUA VÉ ---
  const [customerTickets, setCustomerTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);

  // 1. Hàm lấy danh sách khách hàng
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

  const sendBulkGifts = async (userIds: string[], promoCode: string, title: string, content: string) => {
    let successCount = 0;
    let failCount = 0;

    // Duyệt qua từng ID và gọi hàm sendGiftToUser có sẵn
    for (const uid of userIds) {
      const res: any = await sendGiftToUser(uid, promoCode, title, content);
      if (res && (res.success || res.ok)) {
        successCount++;
      } else {
        failCount++;
      }
    }

    return { successCount, failCount };
  };

  // 2. Cập nhật trạng thái User
  const updateUserStatus = async (userId: string, status: boolean) => {
    try {
      await axiosClient.patch(`/admin/customers/${userId}/status`, { status });
      message.success('Cập nhật trạng thái thành công');
      fetchCustomers();
    } catch (e) {
      message.error('Thao tác thất bại');
    }
  };

  // 3. Lấy mã quà tặng khả dụng (GIỮ NGUYÊN)
  const fetchAvailableCodes = async () => {
    try {
      const res: any = await axiosClient.get('/admin/giftcodes/available');
      return res.data || res || [];
    } catch (e) {
      return [];
    }
  };

  // 4. Gửi quà tặng (GIỮ NGUYÊN)
  const sendGiftToUser = async (userId: string, promoCode: string, title: string, content: string) => {
    try {
      const res: any = await axiosClient.post('/admin/customers/send-gift', {
        userId, promoCode, title, content
      });
      return res;
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối' };
    }
  };

  // 5. Lấy lịch sử mua vé
  const fetchCustomerTickets = async (userId: string) => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get(`/tickets/admin/customer/${userId}`);

      // 🔥 SỬA LẠI ĐOẠN NÀY ĐỂ TRÁNH TRỐNG DATA
      // axiosClient của anh đôi khi trả về res.data, đôi khi là res
      const rawData = res.data || res;

      if (rawData && rawData.tickets) {
        setCustomerTickets(rawData.tickets);
        console.log("Đã nhận vé:", rawData.tickets); // Log ra để kiểm tra
      } else {
        setCustomerTickets([]);
        console.log("Không có vé nào cho user này");
      }
    } catch (error) {
      console.error("Lỗi API lấy vé:", error);
      setCustomerTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // 6. Lấy chi tiết vé (Có QR Code)
  const fetchTicketDetail = async (ticketId: string) => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get(`/tickets/${ticketId}`);
      if (res) {
        setSelectedTicket(res);
        setIsTicketDetailOpen(true);
      }
    } catch (error) {
      message.error("Không thể lấy chi tiết vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    customerTickets,
    selectedTicket,
    isTicketDetailOpen,
    refresh: fetchCustomers, // Map để khớp với file UI
    updateUserStatus,
    fetchAvailableCodes,
    sendGiftToUser,
    fetchCustomerTickets,
    fetchTicketDetail,
    setIsTicketDetailOpen,
    sendBulkGifts
  };
};