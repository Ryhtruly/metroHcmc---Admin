import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi API lấy toàn bộ thông báo
      const res: any = await axiosClient.get('/admin/announcements');
      
      if (res.ok && Array.isArray(res.data)) {
        // Lọc lấy thông báo đang active và sắp xếp mới nhất
        const activeNews = res.data
          .filter((item: any) => item.is_active)
          // Sắp xếp theo ngày tạo giảm dần (nếu API chưa sort)
          .sort((a: any, b: any) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
          // Chỉ lấy 5 tin mới nhất để hiện trên popup
          .slice(0, 5);
          
        setNotifications(activeNews);
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động gọi khi mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Trả về dữ liệu và hàm reload
  return { 
    notifications, 
    loading, 
    refetch: fetchNotifications 
  };
};