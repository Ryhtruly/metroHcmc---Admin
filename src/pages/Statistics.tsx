import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, DatePicker, Statistic, Typography, Button,
  Table, Avatar, Tag, Space
} from 'antd';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarOutlined, UsergroupAddOutlined, QrcodeOutlined, RiseOutlined, ReloadOutlined,
  CrownFilled, UserOutlined, PhoneOutlined, MailOutlined, TrophyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';
import { useStatistics } from '../hooks/useStatistics';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Statistics: React.FC = () => {
  // 1. Lấy dữ liệu từ Hook
  const {
    loading, salesData, trafficData, pieData, kpi,
    setDateRange: setHookDateRange,
    refetch
  } = useStatistics();

  // 2. State riêng cho Top Khách Hàng (Đã thêm state phân trang)
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0); // Tổng user
  const [currentPage, setCurrentPage] = useState(1);       // Trang hiện tại
  const [pageSize] = useState(5);                          // 5 người / trang

  const [currentDateRange, setCurrentDateRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD')
  ]);

  // 3. Hàm gọi API Top Khách Hàng (Nhận tham số page)
  const fetchTopCustomers = useCallback(async (page: number) => {
    setLoadingTop(true);
    try {
      const [from, to] = currentDateRange;

      const res: any = await axiosClient.get('/admin/report/top-spenders', {
        params: {
          from_date: from,
          to_date: to,
          page: page,      // Truyền trang hiện tại xuống backend
          limit: pageSize  // Số lượng 5
        }
      });

      // Backend trả về: { ok: true, total: 100, data: [...] }
      setTopCustomers(res.data || []);
      setTotalCustomers(res.total || 0); // Cập nhật tổng số user để hiện thanh phân trang

    } catch (error) {
      console.error("Lỗi lấy top khách hàng:", error);
    } finally {
      setLoadingTop(false);
    }
  }, [currentDateRange, pageSize]);

  // Gọi API mỗi khi trang hoặc ngày thay đổi
  useEffect(() => {
    fetchTopCustomers(currentPage);
  }, [fetchTopCustomers, currentPage]);

  // 4. Xử lý khi người dùng chọn ngày mới
  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) {
      setHookDateRange(dateStrings);
      setCurrentDateRange(dateStrings);
      setCurrentPage(1); // Reset về trang 1
    }
  };

  const handleRefresh = () => {
    refetch();
    fetchTopCustomers(currentPage);
  };

  // --- CẤU HÌNH CỘT BẢNG (GIỮ NGUYÊN DESIGN CỦA BẠN) ---
  const topCustomerColumns = [
    {
      title: 'Hạng',
      key: 'rank',
      align: 'center' as const,
      width: 70,
      render: (_: any, __: any, index: number) => {
        // Tính hạng chính xác khi qua trang khác: (Trang - 1) * 5 + index + 1
        const realIndex = (currentPage - 1) * pageSize + index;

        if (realIndex === 0) return <CrownFilled style={{ color: '#FFD700', fontSize: 24 }} />;
        if (realIndex === 1) return <CrownFilled style={{ color: '#C0C0C0', fontSize: 22 }} />;
        if (realIndex === 2) return <CrownFilled style={{ color: '#CD7F32', fontSize: 20 }} />;
        return <Tag>#{realIndex + 1}</Tag>;
      }
    },
    {
      title: 'Khách hàng',
      key: 'user',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatar_url} icon={<UserOutlined />} size="large" style={{ backgroundColor: '#87d068' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.display_name || 'Khách ẩn danh'}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>ID: {record.user_id?.substring(0, 8)}...</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: any, record: any) => (
        <div style={{ fontSize: 12 }}>
          {record.phone_number ? <div><PhoneOutlined /> {record.phone_number}</div> : null}
          {record.primary_email ? <div><MailOutlined /> {record.primary_email}</div> : null}
        </div>
      )
    },
    {
      title: 'Vé hay mua',
      dataIndex: 'ticket_types',
      render: (types: string) => (
        <Space wrap>
          {types ? types.split(', ').map((t, i) => <Tag color="cyan" key={i}>{t}</Tag>) : <Text type="secondary">-</Text>}
        </Space>
      )
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      align: 'right' as const,
      sorter: (a: any, b: any) => a.total_spent - b.total_spent,
      render: (val: number) => (
        <Tag color="red" style={{ fontWeight: 'bold', fontSize: 13 }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </Tag>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>Trung tâm Dữ liệu</Title>
          <Text type="secondary">Báo cáo hoạt động hệ thống Metro</Text>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <RangePicker
            defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading || loadingTop} type="primary" ghost>
            Làm mới
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #6C63FF' }}>
            <Statistic title="Tổng Doanh Thu" value={kpi.totalRevenue} precision={0} prefix={<DollarOutlined style={{ color: '#6C63FF' }} />} suffix="₫" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
            <Statistic title="Lượt Khách" value={kpi.totalPassengers} prefix={<UsergroupAddOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}>
            <Statistic title="Vé Bán Ra" value={kpi.totalTickets} prefix={<QrcodeOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #faad14' }}>
            <Statistic title="TB Doanh thu/Vé" value={kpi.avgRevenue} prefix={<RiseOutlined style={{ color: '#faad14' }} />} suffix="₫" />
          </Card>
        </Col>
      </Row>

      {/* CHARTS */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Xu hướng Doanh thu" bordered={false} style={{ borderRadius: 16 }}>
            <div style={{ height: 320, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value)} />
                  <Area type="monotone" dataKey="revenue" stroke="#6C63FF" fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Tỷ lệ loại vé" bordered={false} style={{ borderRadius: 16, height: '100%' }}>
            <div style={{ height: 320, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Lưu lượng khách theo Nhà Ga" bordered={false} style={{ borderRadius: 16 }}>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="station" tickLine={false} />
                  <YAxis tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="passengers" fill="#00C49F" name="Số lượt khách" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* BẢNG TOP KHÁCH HÀNG (ĐÃ KÍCH HOẠT PHÂN TRANG) */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={<Space><TrophyOutlined style={{ color: '#FFD700' }} /> Top Khách Hàng Thân Thiết</Space>}
            bordered={false}
            style={{ borderRadius: 16 }}
          >
            <Table
              columns={topCustomerColumns}
              dataSource={topCustomers}
              rowKey="user_id"
              loading={loadingTop}
              // 👇 CẤU HÌNH PHÂN TRANG TẠI ĐÂY
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalCustomers, // Tổng số user để Antd biết chia bao nhiêu trang
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;