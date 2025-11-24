/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, InputNumber, Row, Col, Tag, Space } from 'antd';
import { EnvironmentOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, CompassOutlined } from '@ant-design/icons';
import { useStationManager } from '../hooks/useStationManager';
import StationMap from '../components/StationMap';

const { Option } = Select;

const StationManager: React.FC = () => {
  const { 
    loading, lines, 
    filteredStations, searchText, setSearchText, stations,
    isModalOpen, form, editingStation,
    openModal, closeModal, handleSave, handleDelete, refresh,
    isMapOpen, focusedStation, openMap, closeMap 
  } = useStationManager();

  const columns = [
    { 
      title: 'Mã Ga', dataIndex: 'code', key: 'code', width: 100,
      render: (t: string) => <Tag color="blue">{t}</Tag> 
    },
    { title: 'Tên Ga', dataIndex: 'name', key: 'name', width: 200, fontWeight: 'bold' },
    { 
      title: 'Tuyến', dataIndex: 'line_name', key: 'line', width: 250,
      render: (_: any, r: any) => <span>{r.line_code} - {r.line_name}</span>
    },
    { 
      title: 'Thứ tự', dataIndex: 'order_index', key: 'order', width: 100, align: 'center' as const,
      render: (t: number) => <Tag color="orange">#{t}</Tag>
    },
    { 
      title: 'Tọa độ', key: 'coords',
      render: (_: any, r: any) => (
        <span style={{ fontSize: 12, color: '#888' }}>
          {r.lat && r.lon ? `${r.lat}, ${r.lon}` : 'Chưa cập nhật'}
        </span>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<CompassOutlined />} onClick={() => openMap(record)} disabled={!record.lat || !record.lon} />
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.code)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2><EnvironmentOutlined /> Quản lý Nhà Ga</h2>
        <Space>
          <Input 
            placeholder="Tìm theo mã, tên ga, tuyến..." 
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Button icon={<CompassOutlined />} onClick={() => openMap()}>Bản đồ tổng</Button>
          <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm Ga Mới</Button>
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table 
          columns={columns} 
          dataSource={filteredStations} 
          rowKey="code"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* MODAL FORM */}
      <Modal 
        title={editingStation ? `Cập nhật ga: ${editingStation.name}` : "Thêm Nhà Ga Mới"} 
        open={isModalOpen} 
        onOk={handleSave} 
        onCancel={closeModal}
        confirmLoading={loading}
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Mã Ga (VD: L1-01)" 
                name="code" 
                rules={[{ required: true, message: 'Vui lòng nhập mã ga' }]}
              >
                <Input disabled={!!editingStation} placeholder="L1-XX" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Tuyến thuộc về" 
                name="line_code" 
                rules={[{ required: true, message: 'Chọn tuyến' }]}
              >
                <Select placeholder="Chọn tuyến metro">
                  {lines.map((line: any) => (
                    <Option key={line.code} value={line.code}>
                      {line.code} - {line.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item 
                label="Tên Ga" 
                name="name" 
                rules={[{ required: true, message: 'Nhập tên ga' }]}
              >
                <Input placeholder="VD: Bến Thành" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Thứ tự" 
                name="order_index" 
                rules={[{ required: true, type: 'number', min: 1 }]}
                tooltip="Thứ tự của ga trên tuyến (1, 2, 3...)"
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Vĩ độ (Lat)" name="lat">
                <InputNumber style={{ width: '100%' }} step="0.000001" placeholder="10.77..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kinh độ (Lon)" name="lon">
                <InputNumber style={{ width: '100%' }} step="0.000001" placeholder="106.70..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        title={focusedStation ? `Vị trí: ${focusedStation.name}` : "Bản đồ hệ thống Metro"}
        open={isMapOpen}
        onCancel={closeMap}
        width={900}
        footer={[<Button key="close" onClick={closeMap}>Đóng</Button>]}
        centered
      >
        {/* Truyền danh sách filteredStations để map cũng lọc theo kết quả tìm kiếm */}
        <StationMap stations={stations} focusedStation={focusedStation} />
      </Modal>
    </div>
  );
};

export default StationManager;