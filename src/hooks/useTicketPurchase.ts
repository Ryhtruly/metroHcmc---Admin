import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import axiosClient from '../api/axiosClient';

// Types
interface Line {
    code: string;
    name: string;
    color_hex: string;
    status: string;
}

interface Station {
    code: string;
    name: string;
    order_index: number;
}

interface TicketProduct {
    code: string;
    name_vi: string;
    type: string;
    price: number;
    duration_hours: number;
    state: boolean;
}

interface QuoteResult {
    line_code: string;
    from_station: string;
    to_station: string;
    stops: number;
    base_price: number;
    discount: number;
    final_price: number;
}

interface PurchasedTicket {
    ticket_id: number;
    product_code: string;
    product_name?: string;
    type?: string;
    from_station?: string;
    to_station?: string;
    final_price: number;
    qr_code: string;
    status: string;
    valid_from?: string;
    valid_to?: string;
    created_at: string;
}

export const useTicketPurchase = () => {
    const [loading, setLoading] = useState(false);
    const [lines, setLines] = useState<Line[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [ticketProducts, setTicketProducts] = useState<TicketProduct[]>([]);
    const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
    const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
    const [guestTickets, setGuestTickets] = useState<PurchasedTicket[]>([]);

    // Fetch lines on mount
    const fetchLines = useCallback(async () => {
        try {
            const res: any = await axiosClient.get('/tickets/lines');
            if (res?.data?.lines) {
                setLines(res.data.lines);
            }
        } catch (error) {
            console.error('Error fetching lines:', error);
        }
    }, []);

    // Fetch stations for a line
    const fetchStations = useCallback(async (lineCode: string) => {
        if (!lineCode) {
            setStations([]);
            return;
        }
        try {
            const res: any = await axiosClient.get(`/tickets/lines/${lineCode}/stations`);
            if (res?.data?.stations) {
                setStations(res.data.stations);
            }
        } catch (error) {
            console.error('Error fetching stations:', error);
        }
    }, []);

    // Fetch ticket products
    const fetchProducts = useCallback(async () => {
        try {
            const res: any = await axiosClient.get('/tickets/products');
            console.log('Ticket products response:', res);

            // Handle various response structures from API
            let products: TicketProduct[] = [];

            if (Array.isArray(res)) {
                products = res;
            } else if (Array.isArray(res?.data?.products)) {
                // Handle { ok: true, data: { products: [...] } }
                products = res.data.products;
            } else if (Array.isArray(res?.data)) {
                products = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                products = res.data.data;
            } else if (res?.products && Array.isArray(res.products)) {
                products = res.products;
            }

            // Filter only pass tickets (exclude single_ride)
            const passProducts = products.filter(
                (p: TicketProduct) => p.type === 'day_pass' || p.type === 'monthly_pass' || p.type === 'multi_day_pass'
            );

            console.log('Filtered pass products:', passProducts);
            setTicketProducts(passProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, []);

    // Quote single ticket
    const quoteSingleTicket = async (lineCode: string, fromStation: string, toStation: string) => {
        if (!lineCode || !fromStation || !toStation) {
            message.warning('Vui lòng chọn đầy đủ tuyến và ga');
            return null;
        }
        try {
            setLoading(true);
            const res: any = await axiosClient.post('/tickets/quote/single', {
                line_code: lineCode,
                from_station: fromStation,
                to_station: toStation
            });
            if (res?.data) {
                setQuoteResult(res.data);
                return res.data;
            }
            return null;
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Không thể tính giá vé');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Purchase single ticket (admin buy for walk-in customer)
    const purchaseSingleTicket = async (data: {
        line_code: string;
        from_station: string;
        to_station: string;
        stops: number;
        final_price: number;
    }) => {
        try {
            setLoading(true);
            const res: any = await axiosClient.post('/admin/purchase/single', data);
            if (res?.success && res?.ticket) {
                message.success('Mua vé thành công!');
                setPurchasedTickets(prev => [res.ticket, ...prev]);
                setQuoteResult(null);
                return res.ticket;
            } else {
                message.error(res?.message || 'Không thể mua vé');
                return null;
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi mua vé');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Purchase pass ticket
    const purchasePassTicket = async (productCode: string, finalPrice: number) => {
        try {
            setLoading(true);
            const res: any = await axiosClient.post('/admin/purchase/pass', {
                product_code: productCode,
                final_price: finalPrice
            });
            if (res?.success && res?.ticket) {
                message.success('Mua vé thành công!');
                setPurchasedTickets(prev => [res.ticket, ...prev]);
                return res.ticket;
            } else {
                message.error(res?.message || 'Không thể mua vé');
                return null;
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi mua vé');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Clear purchased tickets
    const clearPurchasedTickets = () => {
        setPurchasedTickets([]);
    };

    // Fetch guest tickets history
    const fetchGuestTickets = useCallback(async () => {
        try {
            setLoading(true);
            const res: any = await axiosClient.get('/admin/guest-tickets');
            if (res?.success && res?.tickets) {
                setGuestTickets(res.tickets);
            }
        } catch (error) {
            console.error('Error fetching guest tickets:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize data
    useEffect(() => {
        fetchLines();
        fetchProducts();
    }, [fetchLines, fetchProducts]);

    return {
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
    };
};
