import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

export const useAdminFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách ID đã đọc từ LocalStorage
  const getReadIds = (): number[] => {
    try {
        const stored = localStorage.getItem('read_feedbacks');
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi API Backend vừa tạo ở Bước 1
      const res: any = await axiosClient.get('/admin/feedbacks');
      
      // Xử lý dữ liệu trả về (Mảng hoặc Object)
      let data = [];
      if (Array.isArray(res)) data = res;
      else if (Array.isArray(res?.data)) data = res.data;

      const readIds = getReadIds();

      // Map trạng thái đã đọc
      const processed = data.map((item: any) => ({
        ...item,
        isRead: readIds.includes(item.id)
      }));

      setFeedbacks(processed);
      setUnreadCount(processed.filter((i: any) => !i.isRead).length);
      
    } catch (error) {
      console.error("Lỗi tải feedback:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = (id: number) => {
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
      const newIds = [...readIds, id];
      localStorage.setItem('read_feedbacks', JSON.stringify(newIds));
      setFeedbacks(prev => prev.map(item => item.id === id ? {...item, isRead: true} : item));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = () => {
    const allIds = feedbacks.map(f => f.id);
    const uniqueIds = Array.from(new Set([...getReadIds(), ...allIds]));
    localStorage.setItem('read_feedbacks', JSON.stringify(uniqueIds));
    setFeedbacks(prev => prev.map(item => ({...item, isRead: true})));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchFeedbacks();
    const interval = setInterval(fetchFeedbacks, 30000); // Tự động refresh mỗi 30s
    return () => clearInterval(interval);
  }, [fetchFeedbacks]);

  return { feedbacks, unreadCount, loading, refetch: fetchFeedbacks, markAsRead, markAllAsRead };
};