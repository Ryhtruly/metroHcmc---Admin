import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Descriptions, Timeline, Switch, message, Spin, Row, Col } from 'antd';
import { EditOutlined, SettingOutlined, CheckCircleOutlined, StopOutlined, CompassOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import StationMap from '../components/StationMap'; 

const LineManager: React.FC = () => {
  const [line, setLine] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resLines, resStations]: any = await Promise.all([
        axiosClient.get('/tickets/lines'), // API lấy danh sách tuyến (Public)
        axiosClient.get('/tickets/lines/L1/stations') // API lấy ga (Public)
      ]);

      // Lấy tuyến L1 đầu tiên
      if (resLines.data && resLines.data.lines) {
        setLine(resLines.data.lines[0]);
      }
      if (resStations.data && resStations.data.stations) {
        // Gán thêm line_name vào station để map hiển thị đẹp hơn
        const lineName = resLines.data.lines[0]?.name;
        const stationsWithLine = resStations.data.stations.map((s: any) => ({
            ...s, 
            line_name: lineName
        }));
        setStations(stationsWithLine);
      }

    } catch (error) {
      message.error('Lỗi tải thông tin tuyến');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (checked: boolean) => {
    if (!line) return;
    try {
      message.success(`Đã ${checked ? 'kích hoạt' : 'tạm dừng'} tuyến ${line.code}`);
      setLine({ ...line, status: checked ? 'active' : 'inactive' });
    } catch (error) {
      message.error('Lỗi cập nhật trạng thái');
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large" /></div>;
  if (!line) return <div>Không tìm thấy dữ liệu tuyến.</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Quản lý Tuyến Metro</h2>
      </div>

      {/* THẺ THÔNG TIN CHÍNH */}
      <Card 
        title={<span style={{fontSize: 18, fontWeight: 'bold', color: line.color_hex}}>{line.code}: {line.name}</span>}
        extra={
          <Switch 
            checkedChildren="Đang chạy" 
            unCheckedChildren="Bảo trì" 
            checked={line.status === 'active'}
            onChange={toggleStatus}
          />
        }
        style={{ marginBottom: 24, borderRadius: 12, borderTop: `4px solid ${line.color_hex}` }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã Tuyến"><b>{line.code}</b></Descriptions.Item>
          <Descriptions.Item label="Màu sắc">
            <div style={{display:'flex', alignItems:'center'}}>
              <div style={{width: 20, height: 20, background: line.color_hex, borderRadius: 4, marginRight: 8}}/>
              {line.color_hex}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {line.status === 'active' 
              ? <Tag icon={<CheckCircleOutlined />} color="success">Hoạt động bình thường</Tag>
              : <Tag icon={<StopOutlined />} color="error">Đang bảo trì</Tag>
            }
          </Descriptions.Item>
          <Descriptions.Item label="Tổng số ga">{stations.length} Nhà ga</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* SƠ ĐỒ TUYẾN & BẢN ĐỒ */}
      <Row gutter={24}>
        {/* CỘT TRÁI: Timeline (Thu nhỏ) */}
        <Col xs={24} lg={7}>
            <Card 
                title={<span><SettingOutlined /> Danh sách Ga</span>} 
                style={{ height: '100%', borderRadius: 12 }}
                bodyStyle={{ padding: '20px 12px 0 12px' }}
            >
                <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: 8, paddingTop: 10 }}>
                    <Timeline mode="left">
                        {stations.map((st, index) => (
                        <Timeline.Item 
                            key={st.code} 
                            label={<span style={{color: '#888', fontSize: 12}}>#{index + 1}</span>}
                            color={line.color_hex}
                        >
                            <b style={{fontSize: 14}}>{st.name}</b> 
                            <br/>
                            <span style={{fontSize: 11, color: '#999'}}>{st.code}</span>
                        </Timeline.Item>
                        ))}
                    </Timeline>
                </div>
            </Card>
        </Col>

        {/* CỘT PHẢI: Bản đồ (StationMap) */}
        <Col xs={24} lg={17}>
            <Card 
                title={<span><CompassOutlined /> Bản đồ trực quan</span>} 
                style={{ height: '100%', borderRadius: 12 }}
                bodyStyle={{ padding: 0 }} // Bỏ padding để map tràn viền đẹp hơn
            >
                {/* Gọi Component Map */}
                <StationMap stations={stations} />
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LineManager;