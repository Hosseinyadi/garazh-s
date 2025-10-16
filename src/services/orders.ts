import { notifyNewOrder, notifyNewInquiry } from './notifications';
// Use direct fetch against backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Order {
  id: string;
  ad_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  ad_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message?: string;
  total_amount: number;
}

export async function createOrder(orderData: OrderCreate): Promise<Order> {
  try {
    const resp = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...orderData, status: 'pending' }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) throw new Error(data.message || 'Order create failed');
    const order = data.data as Order;

    // Get ad details for notification
    let ad: any = null;
    try {
      const lr = await fetch(`${API_BASE_URL}/listings/${encodeURIComponent(orderData.ad_id)}`);
      const ld = await lr.json();
      if (lr.ok && ld.success) ad = ld.data?.listing;
    } catch {}

    // Notify admins about new order
    if (ad) {
      await notifyNewOrder({
        orderId: order.id,
        customerName: orderData.customer_name,
        customerPhone: orderData.customer_phone,
        customerEmail: orderData.customer_email,
        adTitle: ad.title,
        total: orderData.total_amount,
        adId: orderData.ad_id,
      });
    }

    return order as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getOrders(userId: string): Promise<Order[]> {
  try {
    const r = await fetch(`${API_BASE_URL}/orders?customer_id=${encodeURIComponent(userId)}`);
    const d = await r.json();
    if (!r.ok || !d.success) return [];
    return (d.data || []) as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function getOrdersByAd(adId: string): Promise<Order[]> {
  try {
    const r = await fetch(`${API_BASE_URL}/orders?ad_id=${encodeURIComponent(adId)}`);
    const d = await r.json();
    if (!r.ok || !d.success) return [];
    return (d.data || []) as Order[];
  } catch (error) {
    console.error('Error fetching orders by ad:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    const r = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const d = await r.json();
    if (!r.ok || !d.success) throw new Error(d.message || 'Order status update failed');
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const r = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    const d = await r.json();
    if (!r.ok || !d.success) return null;
    return d.data as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Simple inquiry system for ads
export interface Inquiry {
  id: string;
  ad_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export async function createInquiry(inquiryData: Omit<Inquiry, 'id' | 'status' | 'created_at'>): Promise<Inquiry> {
  try {
    const r = await fetch(`${API_BASE_URL}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...inquiryData, status: 'new' }),
    });
    const d = await r.json();
    if (!r.ok || !d.success) throw new Error(d.message || 'Inquiry create failed');
    const inquiry = d.data as Inquiry;

    // Get ad details for notification
    let ad: any = null;
    try {
      const lr = await fetch(`${API_BASE_URL}/listings/${encodeURIComponent(inquiryData.ad_id)}`);
      const ld = await lr.json();
      if (lr.ok && ld.success) ad = ld.data?.listing;
    } catch {}

    // Send notification
    if (ad) {
      await notifyNewInquiry({
        inquiryId: inquiry.id,
        adId: inquiryData.ad_id,
        adTitle: ad.title,
        customerName: inquiryData.customer_name,
        customerPhone: inquiryData.customer_phone,
        customerEmail: inquiryData.customer_email,
        message: inquiryData.message,
      });
    }

    return inquiry as Inquiry;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
}

export async function getInquiriesByAd(adId: string): Promise<Inquiry[]> {
  try {
    const r = await fetch(`${API_BASE_URL}/inquiries?ad_id=${encodeURIComponent(adId)}`);
    const d = await r.json();
    if (!r.ok || !d.success) return [];
    return (d.data || []) as Inquiry[];
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
}

export async function markInquiryAsRead(inquiryId: string): Promise<void> {
  try {
    const r = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' }),
    });
    const d = await r.json();
    if (!r.ok || !d.success) throw new Error(d.message || 'Mark inquiry read failed');
  } catch (error) {
    console.error('Error marking inquiry as read:', error);
    throw error;
  }
}
