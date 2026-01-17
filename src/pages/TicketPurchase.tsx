import React, { useState, useEffect } from 'react';
import {
    Tabs, Card, Form, Button, Table, Tag, Space, Typography, Modal,
    Select, Row, Col, Statistic, Descriptions, Empty, Tooltip
} from 'antd';
import {
    ShoppingCartOutlined, QrcodeOutlined, PrinterOutlined,
    EyeOutlined, CheckCircleOutlined, DeleteOutlined, HistoryOutlined, ReloadOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { useTicketPurchase } from '../hooks/useTicketPurchase';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const { Title, Text } = Typography;
const { Option } = Select;

// Format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
};

// Format date
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN');
};

// ==================== TAB 1: Vé Lượt ====================
const SingleTicketTab: React.FC<{
    lines: any[];
    stations: any[];
    quoteResult: any;
    loading: boolean;
    onLineChange: (code: string) => void;
    onQuote: () => void;
    onPurchase: () => void;
    form: any;
}> = ({ lines, stations, quoteResult, loading, onLineChange, onQuote, onPurchase, form }) => {
    return (
        <Card title="Mua vé lượt cho khách" bordered={false} style={{ borderRadius: 12 }}>
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item label="Chọn tuyến" name="line_code" rules={[{ required: true, message: 'Chọn tuyến' }]}>
                            <Select
                                placeholder="Chọn tuyến metro"
                                onChange={onLineChange}
                                showSearch
                                optionFilterProp="children"
                            >
                                {lines.map(line => (
                                    <Option key={line.code} value={line.code}>
                                        <span style={{ color: line.color_hex }}>●</span> {line.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Ga đi" name="from_station" rules={[{ required: true, message: 'Chọn ga đi' }]}>
                            <Select
                                placeholder="Chọn ga đi"
                                disabled={stations.length === 0}
                                showSearch
                                optionFilterProp="children"
                            >
                                {stations.map(station => (
                                    <Option key={station.code} value={station.code}>
                                        {station.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Ga đến" name="to_station" rules={[{ required: true, message: 'Chọn ga đến' }]}>
                            <Select
                                placeholder="Chọn ga đến"
                                disabled={stations.length === 0}
                                showSearch
                                optionFilterProp="children"
                            >
                                {stations.map(station => (
                                    <Option key={station.code} value={station.code}>
                                        {station.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 16 }}>
                    <Button onClick={onQuote} loading={loading} size="large">
                        Xem giá vé
                    </Button>

                    {quoteResult && (
                        <Card size="small" style={{ flex: 1, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                            <Row gutter={24}>
                                <Col>
                                    <Statistic
                                        title="Số ga"
                                        value={quoteResult.stops}
                                        suffix="ga"
                                    />
                                </Col>
                                <Col>
                                    <Statistic
                                        title="Giá gốc"
                                        value={quoteResult.base_price}
                                        suffix="₫"
                                        valueStyle={{ color: '#999', textDecoration: quoteResult.discount ? 'line-through' : 'none' }}
                                    />
                                </Col>
                                {quoteResult.discount > 0 && (
                                    <Col>
                                        <Statistic
                                            title="Giảm giá"
                                            value={quoteResult.discount}
                                            suffix="₫"
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                    </Col>
                                )}
                                <Col>
                                    <Statistic
                                        title="Thành tiền"
                                        value={quoteResult.final_price}
                                        suffix="₫"
                                        valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    )}
                </div>

                {quoteResult && (
                    <div style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<ShoppingCartOutlined />}
                            onClick={onPurchase}
                            loading={loading}
                            style={{ borderRadius: 8 }}
                        >
                            Xác nhận mua vé (Thanh toán tiền mặt)
                        </Button>
                    </div>
                )}
            </Form>
        </Card>
    );
};

// ==================== TAB 2: Vé Pass ====================
const PassTicketTab: React.FC<{
    products: any[];
    loading: boolean;
    onPurchase: (productCode: string, price: number) => void;
}> = ({ products, loading }) => {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    return (
        <Card title="Mua vé ngày / vé tháng cho khách" bordered={false} style={{ borderRadius: 12 }}>
            {products.length === 0 ? (
                <Empty description="Không có gói vé nào" />
            ) : (
                <Row gutter={[16, 16]}>
                    {products.map(product => (
                        <Col key={product.code} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: 12,
                                    border: selectedProduct?.code === product.code ? '2px solid #1890ff' : undefined,
                                    transition: 'all 0.3s'
                                }}
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <QrcodeOutlined style={{ fontSize: 36, color: '#1890ff', marginBottom: 12 }} />
                                    <Title level={5} style={{ margin: 0 }}>{product.name_vi}</Title>
                                    <Tag color={product.type === 'day_pass' ? 'cyan' : 'purple'} style={{ marginTop: 8 }}>
                                        {product.type === 'day_pass' ? 'Vé Ngày' : 'Vé Tháng'}
                                    </Tag>
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong style={{ fontSize: 20, color: '#3f8600' }}>
                                            {formatPrice(product.price)}
                                        </Text>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Hiệu lực: {product.duration_hours / 24} ngày
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {selectedProduct && (
                <div style={{ marginTop: 24, padding: 16, background: '#fafafa', borderRadius: 8 }}>
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Text strong>Đã chọn: </Text>
                            <Tag color="blue">{selectedProduct.name_vi}</Tag>
                            <Text strong style={{ marginLeft: 16 }}>Giá: </Text>
                            <Text style={{ color: '#3f8600', fontWeight: 'bold' }}>{formatPrice(selectedProduct.price)}</Text>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                loading={loading}
                                style={{ borderRadius: 8 }}
                                data-product-code={selectedProduct.code}
                                data-product-price={selectedProduct.price}
                            >
                                Mua vé (Tiền mặt)
                            </Button>
                        </Col>
                    </Row>
                </div>
            )}
        </Card>
    );
};

// ==================== MAIN COMPONENT ====================
const TicketPurchase: React.FC = () => {
    const {
        loading,
        lines,
        stations,
        ticketProducts,
        quoteResult,
        purchasedTickets,
        guestTickets,
        fetchStations,
        quoteSingleTicket,
        purchaseSingleTicket,
        purchasePassTicket,
        clearPurchasedTickets,
        setQuoteResult,
        fetchGuestTickets
    } = useTicketPurchase();

    const [singleForm] = Form.useForm();
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('1');

    // Fetch guest tickets when switching to history tab
    useEffect(() => {
        if (activeTab === '3') {
            fetchGuestTickets();
        }
    }, [activeTab, fetchGuestTickets]);

    // Handle line change
    const handleLineChange = (lineCode: string) => {
        fetchStations(lineCode);
        singleForm.setFieldsValue({ from_station: undefined, to_station: undefined });
        setQuoteResult(null);
    };

    // Handle quote
    const handleQuote = async () => {
        const values = await singleForm.validateFields();
        quoteSingleTicket(values.line_code, values.from_station, values.to_station);
    };

    // Handle purchase single ticket
    const handlePurchaseSingle = async () => {
        if (!quoteResult) return;
        const values = await singleForm.validateFields();
        await purchaseSingleTicket({
            line_code: values.line_code,
            from_station: values.from_station,
            to_station: values.to_station,
            stops: quoteResult.stops,
            final_price: quoteResult.final_price
        });
        singleForm.resetFields();
    };

    // Handle purchase pass ticket
    const handlePurchasePass = async (productCode: string, price: number) => {
        await purchasePassTicket(productCode, price);
    };

    // Handle click on purchase button in PassTicketTab
    const handlePassTabClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const button = target.closest('button[data-product-code]') as HTMLButtonElement;
        if (button) {
            const code = button.dataset.productCode;
            const price = Number(button.dataset.productPrice);
            if (code && price) {
                handlePurchasePass(code, price);
            }
        }
    };

    // View ticket details
    const viewTicketDetail = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsDetailModalOpen(true);
    };

    // Generate PDF for ticket
    const generatePDF = async (ticket: any) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(25, 91, 153);
        doc.text('METRO HO CHI MINH', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('PHIEU VE DIEN TU', 105, 28, { align: 'center' });

        // QR Code
        try {
            const qrDataUrl = await QRCode.toDataURL(ticket.qr_code, { width: 200, margin: 2 });
            doc.addImage(qrDataUrl, 'PNG', 65, 35, 80, 80);
        } catch (err) {
            console.error('Error generating QR:', err);
        }

        // Ticket info
        let y = 125;
        doc.setFontSize(11);
        doc.setTextColor(0);

        doc.text(`Ma ve: ${ticket.ticket_id}`, 20, y);
        y += 8;
        doc.text(`Loai ve: ${ticket.product_name || ticket.product_code}`, 20, y);
        y += 8;

        if (ticket.from_station) {
            doc.text(`Ga di: ${ticket.from_station}`, 20, y);
            y += 8;
            doc.text(`Ga den: ${ticket.to_station}`, 20, y);
            y += 8;
        }

        doc.text(`Gia tien: ${formatPrice(ticket.final_price)}`, 20, y);
        y += 8;
        doc.text(`Trang thai: ${ticket.status}`, 20, y);
        y += 8;
        doc.text(`Ngay mua: ${formatDate(ticket.created_at)}`, 20, y);
        y += 8;

        if (ticket.valid_to) {
            doc.text(`Het han: ${formatDate(ticket.valid_to)}`, 20, y);
            y += 8;
        }

        // QR code value
        y += 10;
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Ma QR: ${ticket.qr_code}`, 20, y);

        // Footer
        doc.setFontSize(8);
        doc.text('Xuat boi: Metro Admin - ' + new Date().toLocaleString('vi-VN'), 105, 280, { align: 'center' });

        // Save
        doc.save(`ve_${ticket.ticket_id}.pdf`);
    };

    // Table columns for purchased tickets
    const columns = [
        {
            title: 'Mã vé',
            dataIndex: 'ticket_id',
            key: 'ticket_id',
            render: (id: number) => <Tag color="blue">#{id}</Tag>
        },
        {
            title: 'Loại vé',
            dataIndex: 'product_code',
            key: 'product_code',
            render: (code: string, record: any) => record.product_name || code
        },
        {
            title: 'Ga đi/đến',
            key: 'stations',
            render: (_: any, record: any) => record.from_station
                ? `${record.from_station} → ${record.to_station}`
                : '-'
        },
        {
            title: 'Giá',
            dataIndex: 'final_price',
            key: 'final_price',
            render: (price: number) => <Text strong style={{ color: '#3f8600' }}>{formatPrice(price)}</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'NEW' ? 'processing' : status === 'ACTIVE' ? 'success' : 'default'}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button type="link" icon={<EyeOutlined />} onClick={() => viewTicketDetail(record)} />
                    </Tooltip>
                    <Tooltip title="Xuất PDF">
                        <Button type="link" icon={<PrinterOutlined />} onClick={() => generatePDF(record)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: <span><QrcodeOutlined /> Vé Lượt (Single)</span>,
            children: (
                <SingleTicketTab
                    lines={lines}
                    stations={stations}
                    quoteResult={quoteResult}
                    loading={loading}
                    onLineChange={handleLineChange}
                    onQuote={handleQuote}
                    onPurchase={handlePurchaseSingle}
                    form={singleForm}
                />
            )
        },
        {
            key: '2',
            label: <span><QrcodeOutlined /> Vé Pass (Ngày/Tháng)</span>,
            children: (
                <div onClick={handlePassTabClick}>
                    <PassTicketTab
                        products={ticketProducts}
                        loading={loading}
                        onPurchase={handlePurchasePass}
                    />
                </div>
            )
        },
        {
            key: '3',
            label: <span><HistoryOutlined /> Lịch sử bán vé</span>,
            children: (
                <Card
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Vé đã bán cho khách vãng lai</span>
                            <Button icon={<ReloadOutlined />} onClick={fetchGuestTickets} loading={loading}>
                                Làm mới
                            </Button>
                        </div>
                    }
                    bordered={false}
                    style={{ borderRadius: 12 }}
                >
                    {guestTickets.length === 0 ? (
                        <Empty description="Chưa có vé nào được bán" />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={guestTickets}
                            rowKey="ticket_id"
                            pagination={{ pageSize: 10 }}
                        />
                    )}
                </Card>
            )
        }
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <ShoppingCartOutlined style={{ marginRight: 12 }} />
                    Mua vé cho khách
                </Title>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} type="card" />

            {/* Purchased tickets section */}
            {purchasedTickets.length > 0 && (
                <Card
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />Vé đã mua ({purchasedTickets.length})</span>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={clearPurchasedTickets}
                            >
                                Xóa danh sách
                            </Button>
                        </div>
                    }
                    style={{ marginTop: 24, borderRadius: 12 }}
                >
                    <Table
                        columns={columns}
                        dataSource={purchasedTickets}
                        rowKey="ticket_id"
                        pagination={false}
                    />
                </Card>
            )}

            {/* Ticket detail modal */}
            <Modal
                title={<><QrcodeOutlined /> Chi tiết vé #{selectedTicket?.ticket_id}</>}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="pdf" type="primary" icon={<PrinterOutlined />} onClick={() => selectedTicket && generatePDF(selectedTicket)}>
                        Xuất PDF
                    </Button>,
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {selectedTicket && (
                    <Descriptions column={1} bordered style={{ marginTop: 16 }}>
                        <Descriptions.Item label="Mã vé">
                            <Tag color="blue">#{selectedTicket.ticket_id}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã QR">
                            <Text code copyable>{selectedTicket.qr_code}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại vé">
                            {selectedTicket.product_name || selectedTicket.product_code}
                        </Descriptions.Item>
                        {selectedTicket.from_station && (
                            <>
                                <Descriptions.Item label="Ga đi">{selectedTicket.from_station}</Descriptions.Item>
                                <Descriptions.Item label="Ga đến">{selectedTicket.to_station}</Descriptions.Item>
                            </>
                        )}
                        <Descriptions.Item label="Giá tiền">
                            <Text strong style={{ color: '#3f8600' }}>{formatPrice(selectedTicket.final_price)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={selectedTicket.status === 'NEW' ? 'processing' : 'success'}>{selectedTicket.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày mua">{formatDate(selectedTicket.created_at)}</Descriptions.Item>
                        {selectedTicket.valid_to && (
                            <Descriptions.Item label="Hết hạn">{formatDate(selectedTicket.valid_to)}</Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default TicketPurchase;
