import React from 'react';
import { Card, Row, Col, Radio, ColorPicker, Divider, Button, Alert } from 'antd';
import { 
  BgColorsOutlined, GlobalOutlined, LayoutOutlined, 
  HighlightOutlined 
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const Appearance: React.FC = () => {
  // Lấy các biến và hàm từ Context (Bỏ contentColor ra)
  const { 
    primaryColor, setPrimaryColor, 
    siderColor, setSiderColor, 
    locale, setLocale 
  } = useTheme();

  // Gợi ý màu cho Nút bấm (Tươi sáng)
  const primaryPresets = ['#6C63FF', '#1890ff', '#f5222d', '#52c41a', '#faad14', '#722ed1', '#eb2f96'];
  
  // Gợi ý màu cho Sidebar (Trầm tối)
  const siderPresets = ['#111827', '#001529', '#1f2937', '#000000', '#220f46', '#4a1010', '#0f3a28'];

  return (
    <div>
      <h2>Tùy chỉnh Giao diện</h2>
      <p style={{ color: '#888', marginBottom: 24 }}>Cá nhân hóa trải nghiệm làm việc của bạn.</p>

      <Row gutter={[24, 24]}>
        {/* Cột 1: Màu sắc */}
        <Col xs={24} lg={14}>
          <Card title={<span><BgColorsOutlined /> Chủ đề Màu sắc</span>}>
            
            {/* MỤC 1: MÀU CHÍNH (PRIMARY) */}
            <div style={{ marginBottom: 8, fontWeight: 600 }}><HighlightOutlined /> Màu Chính (Nút bấm, Highlight):</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <ColorPicker showText value={primaryColor} onChange={(c) => setPrimaryColor(c.toHexString())} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {primaryPresets.map(color => (
                  <div key={color} onClick={() => setPrimaryColor(color)}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer', border: primaryColor === color ? '2px solid #000' : '1px solid #ddd' }}
                  />
                ))}
              </div>
            </div>

            <Divider />

            {/* MỤC 2: MÀU SIDEBAR */}
            <div style={{ marginBottom: 8, fontWeight: 600 }}><LayoutOutlined /> Màu Menu Trái (Sidebar):</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <ColorPicker showText value={siderColor} onChange={(c) => setSiderColor(c.toHexString())} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {siderPresets.map(color => (
                  <div key={color} onClick={() => setSiderColor(color)}
                    style={{ width: 24, height: 24, borderRadius: 4, background: color, cursor: 'pointer', border: siderColor === color ? '2px solid #1890ff' : '1px solid #ddd' }}
                  />
                ))}
              </div>
            </div>

            {/* Đã xóa mục Màu Nền Nội dung */}

            <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8, display: 'flex', gap: 12 }}>
               <Button type="primary">Button Chính</Button>
               <Button>Button Thường</Button>
               <Button type="dashed">Button Dashed</Button>
            </div>
          </Card>
        </Col>

        {/* Cột 2: Ngôn ngữ */}
        <Col xs={24} lg={10}>
          <Card title={<span><GlobalOutlined /> Ngôn ngữ & Khu vực</span>}>
            <div style={{ marginBottom: 16 }}>Ngôn ngữ hệ thống:</div>
            <Radio.Group value={locale} onChange={(e) => setLocale(e.target.value)} buttonStyle="solid">
              <Radio.Button value="vi">Tiếng Việt 🇻🇳</Radio.Button>
              <Radio.Button value="en">English 🇺🇸</Radio.Button>
            </Radio.Group>
            <div style={{ marginTop: 24 }}>
              <Alert message="Ngôn ngữ sẽ áp dụng cho Menu, Tiêu đề và các thành phần Lịch." type="success" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Appearance;