import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

export const useStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  // 👇 THÊM STATE NÀY
  const [pieData, setPieData] = useState<any[]>([]);
  
  const [kpi, setKpi] = useState({
    totalRevenue: 0,
    totalPassengers: 0,
    totalTickets: 0,
    avgRevenue: 0,
  });

  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD')
  ]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [from, to] = dateRange;

      // Gọi 3 API cùng lúc (Doanh thu, Traffic, và Loại vé)
      const [resSales, resTraffic, resTypes]: any = await Promise.all([
        axiosClient.get(`/admin/report/sales?from_date=${from}&to_date=${to}`),
        axiosClient.get(`/admin/report/traffic?from_date=${from}&to_date=${to}`),
        axiosClient.get(`/admin/report/ticket-types?from_date=${from}&to_date=${to}`) // <-- API MỚI
      ]);

      // ... (Xử lý chartSales, chartTraffic giữ nguyên) ...
      const chartSales = (resSales.data?.rows || []).map((item: any) => ({
        date: dayjs(item.date).format('DD/MM'),
        revenue: Number(item.amount),
        tickets: Number(item.count)
      }));

      const chartTraffic = (resTraffic.data?.rows || []).map((item: any) => ({
        station: item.station_code,
        passengers: Number(item.validations_count)
      }));

      // 👇 XỬ LÝ DỮ LIỆU PIE CHART
      const rawPieData = resTypes.data || [];
      // Chuyển value thành số
      const chartPie = rawPieData.map((item: any) => ({
        name: item.name,
        value: Number(item.value)
      }));
      setPieData(chartPie);

      // ... (Tính toán KPI giữ nguyên) ...
      const totalRev = chartSales.reduce((a: number, b: any) => a + b.revenue, 0);
      const totalTix = chartSales.reduce((a: number, b: any) => a + b.tickets, 0);
      const totalPass = chartTraffic.reduce((a: number, b: any) => a + b.passengers, 0);

      setSalesData(chartSales);
      setTrafficData(chartTraffic);
      setKpi({
        totalRevenue: totalRev,
        totalTickets: totalTix,
        totalPassengers: totalPass,
        avgRevenue: totalTix > 0 ? Math.round(totalRev / totalTix) : 0
      });

    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 👇 NHỚ RETURN pieData
  return { 
    loading, 
    salesData, 
    trafficData, 
    pieData, 
    kpi, 
    setDateRange, 
    refetch: fetchData 
  };
};