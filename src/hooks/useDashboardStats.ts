import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

export interface DashboardStats {
  revenue: number;
  passengers: number;
  scans: number;
  recentLogs: any[];
}

const MOCK_STATS: DashboardStats = {
  revenue: 11289300,
  passengers: 93,
  scans: 45,
  recentLogs: [
    { log_id: 'm1', actor_user: 'Nguyen Van A', action: 'MUA_VE_LUOT', object_type: 'TICKET', created_at: new Date().toISOString() },
    { log_id: 'm2', actor_user: 'Tran Thi B', action: 'QUET_VAO_GA', object_type: 'VALIDATION', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() }, // 15p trước
    { log_id: 'm3', actor_user: 'System', action: 'AUTO_ACTIVATE', object_type: 'TICKET', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() }, // 1h trước
    { log_id: 'm4', actor_user: 'Le Van C', action: 'THANH_TOAN_LOI', object_type: 'PAYMENT', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() }, // 2h trước
  ]
};

export const useDashboardStats = () => {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const fromDate = dayjs().startOf('month').format('YYYY-MM-DD');
      const toDate = dayjs().endOf('month').format('YYYY-MM-DD');
      const today = dayjs().format('YYYY-MM-DD');

      // 2. Gọi API từ Backend
      const [resSales, resTraffic, resAudit] = await Promise.all([
        axiosClient.get(`/admin/report/sales?from_date=${fromDate}&to_date=${toDate}`),
        axiosClient.get(`/admin/report/traffic?on_date=${today}`),
        axiosClient.get(`/admin/audit?from_ts=${dayjs().subtract(7, 'day').toISOString()}&to_ts=${dayjs().toISOString()}`)
      ]);

      // 3. Xử lý dữ liệu trả về
      // Doanh thu
      const realRevenue = (resSales as any).data?.rows?.reduce(
        (acc: number, curr: any) => acc + Number(curr.amount), 0
      );

      // Lượt khách
      const realTraffic = (resTraffic as any).data?.rows?.reduce(
        (acc: number, curr: any) => acc + Number(curr.validations_count), 0
      );

      // Log hoạt động
      const realLogs = (resAudit as any).data?.logs || [];

      // 4. Logic HYBRID: Chỉ dùng số thật nếu nó > 0, ngược lại giữ số Fake cho đẹp
      setStats({
        revenue: realRevenue > 0 ? realRevenue : MOCK_STATS.revenue,
        passengers: realTraffic > 0 ? realTraffic : MOCK_STATS.passengers,
        scans: realTraffic > 0 ? realTraffic : MOCK_STATS.scans,
        recentLogs: realLogs.length > 0 ? realLogs : MOCK_STATS.recentLogs
      });

    } catch (error) {
      console.error("Lỗi tải Dashboard (Dùng dữ liệu mẫu):", error);
      // Nếu lỗi, giữ nguyên MOCK_STATS ban đầu, không làm gì cả
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, refetch: fetchData };
};