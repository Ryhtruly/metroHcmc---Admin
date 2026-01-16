import React from 'react';
import { Card, Row, Col, DatePicker, Statistic, Typography, Button } from 'antd';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  DollarOutlined, UsergroupAddOutlined, QrcodeOutlined, RiseOutlined, ReloadOutlined 
} from '@ant-design/icons';
import { useStatistics } from '../hooks/useStatistics';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// Dữ liệu giả lập cho loại vé (Vì chưa có API report theo loại vé)


const Statistics: React.FC = () => {
  const { loading, salesData, trafficData, pieData, kpi, setDateRange, refetch } = useStatistics();

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) setDateRange(dateStrings);
  };

  return (
    <div className="animate-fade-in">
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
           <Title level={2} style={{ marginBottom: 0 }}>Trung tâm Dữ liệu</Title>
           <span style={{ color: '#888' }}>Báo cáo chi tiết hoạt động hệ thống Metro</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <RangePicker 
            defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]} 
            onChange={handleDateChange}
            style={{ width: 260 }}
          />
          <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>Làm mới</Button>
        </div>
      </div>

      {/* --- 1. KPI CARDS --- */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '5px solid #6C63FF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Tổng Doanh Thu" 
              value={kpi.totalRevenue} 
              precision={0} 
              prefix={<DollarOutlined style={{ color: '#6C63FF' }} />} 
              suffix="₫" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '5px solid #52c41a', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Lượt Khách" 
              value={kpi.totalPassengers} 
              prefix={<UsergroupAddOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '5px solid #1890ff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Vé Bán Ra" 
              value={kpi.totalTickets} 
              prefix={<QrcodeOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '5px solid #faad14', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="TB Doanh thu/Vé" 
              value={kpi.avgRevenue} 
              precision={0}
              prefix={<RiseOutlined style={{ color: '#faad14' }} />} 
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      {/* --- 2. MAIN CHARTS ROW --- */}
      <Row gutter={[24, 24]}>
        {/* Biểu đồ Doanh thu (Area Chart) */}
        <Col xs={24} lg={16}>
          <Card title="Xu hướng Doanh thu (Thực tế)" bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#666'}} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6C63FF" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Doanh thu"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Biểu đồ Tròn (Pie Chart) - Tỷ lệ vé */}
        <Col xs={24} lg={8}>
          <Card title="Tỷ lệ loại vé (Giả lập)" bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <div style={{ height: 350, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* --- 3. TRAFFIC CHART --- */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Lưu lượng khách theo Nhà Ga" bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
             <div style={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={trafficData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="station" tickLine={false} />
                    <YAxis tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="passengers" fill="#00C49F" name="Số lượt khách" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;