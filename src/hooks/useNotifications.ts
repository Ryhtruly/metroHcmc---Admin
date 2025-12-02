import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]); // 5 cái hiển thị
  const [allActiveIds, setAllActiveIds] = useState<number[]>([]); // Lưu ID tất cả thông báo
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper lấy list đã đọc từ LocalStorage
  const getReadIds = (): number[] => {
    const stored = localStorage.getItem('read_announcements');
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      // Không set loading true để tránh nhấp nháy icon chuông khi reload ngầm
      // setLoading(true); 
      
      const res: any = await axiosClient.get('/admin/announcements');
      
      if (res.ok && Array.isArray(res.data)) {
        const readIds = getReadIds();

        // Lọc & Sắp xếp
        const activeNews = res.data
          .filter((item: any) => item.is_active)
          .sort((a: any, b: any) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());

        // Lưu lại toàn bộ ID để dùng cho nút "Đọc hết"
        const allIds = activeNews.map((n: any) => n.ann_id);
        setAllActiveIds(allIds);

        // Xử lý isRead
        const processedNews = activeNews.map((item: any) => ({
          ...item,
          isRead: readIds.includes(item.ann_id)
        }));

        // Tính số chưa đọc dựa trên TOÀN BỘ danh sách
        const count = processedNews.filter((item: any) => !item.isRead).length;
        setUnreadCount(count);

        // Cắt lấy 5 tin để hiển thị UI
        setNotifications(processedNews.slice(0, 5));
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- HÀM: Đánh dấu 1 tin ---
  const markAsRead = (id: number) => {
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      localStorage.setItem('read_announcements', JSON.stringify(newReadIds));
      fetchNotifications();
    }
  };

  // --- HÀM: Đọc hết ---
  const markAllAsRead = () => {
    const readIds = getReadIds();
    const uniqueIds = Array.from(new Set([...readIds, ...allActiveIds]));
    
    localStorage.setItem('read_announcements', JSON.stringify(uniqueIds));
    fetchNotifications();
  };

  // --- SỬA ĐOẠN USE EFFECT ĐỂ LẮNG NGHE SỰ KIỆN ---
  useEffect(() => {
    // 1. Gọi lần đầu khi mount
    fetchNotifications();

    // 2. Hàm xử lý sự kiện: Gọi lại API khi nghe thấy tín hiệu
    const handleUpdate = () => {
      console.log("🔔 Nhận tín hiệu có thông báo mới, đang cập nhật...");
      fetchNotifications();
    };

    // 3. Đăng ký lắng nghe sự kiện 'NEW_ANNOUNCEMENT_ADDED'
    window.addEventListener('NEW_ANNOUNCEMENT_ADDED', handleUpdate);

    // 4. Cleanup khi unmount
    return () => {
      window.removeEventListener('NEW_ANNOUNCEMENT_ADDED', handleUpdate);
    };
  }, [fetchNotifications]);

  return { 
    notifications, 
    unreadCount, 
    loading, 
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};