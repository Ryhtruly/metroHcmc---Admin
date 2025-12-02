import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

export interface DashboardStats {
  revenue: number;
  passengers: number;
  scans: number;
  recentLogs: any[];
}

// Dữ liệu giả lập (Chỉ dùng khi DB không có log hoạt động)
const MOCK_STATS: DashboardStats = {
  revenue: 0,
  passengers: 0,
  scans: 0,
  recentLogs: [
  ]
};

export const useDashboardStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
      const today = dayjs().format('YYYY-MM-DD');

      // Gọi song song các API cần thiết
      const [resSales, resTrafficToday, resStats, resAudit] = await Promise.all([
        // 1. Doanh thu: Lấy cả tháng (để bắt được dữ liệu mẫu)
        axiosClient.get(`/admin/report/sales?from_date=${today}&to_date=${today}`),
        
        // 2. Lượt khách: Chỉ lấy HÔM NAY (Realtime)
        axiosClient.get(`/admin/report/traffic?from_date=${today}&to_date=${today}`),
        
        // 3. Tổng vé đã quét: Lấy từ API tổng hợp (số 8 trong DB)
        axiosClient.get(`/admin/dashboard-stats`),

        // 4. Log hoạt động: Lấy 7 ngày gần nhất
        axiosClient.get(`/admin/audit?from_ts=${dayjs().subtract(7, 'day').toISOString()}&to_ts=${dayjs().toISOString()}`)
      ]);

      // --- XỬ LÝ DỮ LIỆU ---

      // A. Doanh thu thật (Tháng này)
      const realRevenue = (resSales as any).data?.rows?.reduce(
        (acc: number, curr: any) => acc + Number(curr.amount), 0
      ) || 0;

      // B. Khách thật (Hôm nay)
      const realPassengersToday = (resTrafficToday as any).data?.rows?.reduce(
        (acc: number, curr: any) => acc + Number(curr.validations_count), 0
      ) || 0;

      // C. Tổng số vé đã quét (Tích lũy toàn thời gian)
      // Lấy từ API dashboard-stats mà mình đã soi curl thấy số 8
      const realTotalScans = (resStats as any).data?.scans || 0;
      // D. Log hoạt động
      const realLogs = (resAudit as any).data?.logs || [];

      // --- CẬP NHẬT STATE ---
      setStats({
        revenue: realRevenue,          // Số thật từ DB
        passengers: realPassengersToday, // Số thật hôm nay (khả năng là 0 nếu chưa đi)
        scans: realTotalScans,         // Số thật tích lũy (số 8)
        
        // Logic HYBRID cho Log: Nếu có log thật thì hiện, không thì hiện MOCK
        recentLogs: realLogs.length > 0 ? realLogs : MOCK_STATS.recentLogs
      });

    } catch (error) {
      console.error("Lỗi tải Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, refetch: fetchData };
};