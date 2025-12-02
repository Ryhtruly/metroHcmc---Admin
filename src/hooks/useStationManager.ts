/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { Form, App } from 'antd';
import axiosClient from '../api/axiosClient';

export const useStationManager = () => {
  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]); // Để chọn tuyến khi tạo ga

  const [searchText, setSearchText] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [form] = Form.useForm();

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [focusedStation, setFocusedStation] = useState<any>(null);

  // 1. Lấy dữ liệu (Ga & Tuyến)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi song song lấy danh sách ga và danh sách tuyến (để fill dropdown)
      const [resStations, resLines]: any = await Promise.all([
        axiosClient.get('/admin/stations'),
        axiosClient.get('/tickets/lines') // Dùng API public của ticket để lấy lines
      ]);

      if (resStations.ok) setStations(resStations.data);
      if (resLines.data?.lines) setLines(resLines.data.lines); 

    } catch (error) {
      message.error('Lỗi tải dữ liệu nhà ga');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStations = stations.filter((s) => {
    const value = searchText.toLowerCase();
    return (
      s.code?.toLowerCase().includes(value) ||       // Tìm theo Mã ga
      s.name?.toLowerCase().includes(value) ||       // Tìm theo Tên ga
      s.line_code?.toLowerCase().includes(value) ||  // Tìm theo Mã tuyến
      s.line_name?.toLowerCase().includes(value)     // Tìm theo Tên tuyến
    );
  });

  // 2. Xử lý Modal
  const openModal = (record?: any) => {
    if (record) {
      setEditingStation(record);
      form.setFieldsValue(record);
    } else {
      setEditingStation(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStation(null);
    form.resetFields();
  };

  // 3. Lưu (Thêm/Sửa)
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        code: values.code,
        name: values.name,
        line_code: values.line_code,
        order_index: values.order_index,
        lat: values.lat || null,
        lon: values.lon || null
      };

      const res: any = await axiosClient.post('/admin/stations', payload);

      if (res.ok) {
        message.success(editingStation ? 'Cập nhật thành công!' : 'Thêm ga mới thành công!');
        closeModal();
        fetchData();
      } else {
        message.error('Lỗi: ' + (res.error?.message || res.message));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Xóa
  const handleDelete = (code: string) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa ga ${code}? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          const res: any = await axiosClient.delete(`/admin/stations/${code}`);
          if (res.ok) {
            message.success('Đã xóa ga.');
            fetchData();
          } else {
            message.error('Không thể xóa: ' + res.message);
          }
        } catch (error) {
          message.error('Lỗi hệ thống khi xóa');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const openMap = (station?: any) => {
    setFocusedStation(station || null); // Nếu truyền station vào thì focus, không thì hiện toàn bộ
    setIsMapOpen(true);
  };

  const closeMap = () => {
    setIsMapOpen(false);
    setFocusedStation(null);
  };

  return {
    loading,
    stations,
    filteredStations, // Danh sách đã lọc
    lines,
    isModalOpen,
    form,
    editingStation,
    searchText,    // Trả về state
    setSearchText, // Trả về hàm set
    openModal,
    closeModal,
    handleSave,
    handleDelete,
    isMapOpen, 
    focusedStation,
    openMap, 
    closeMap,
    refresh: fetchData
  };
};