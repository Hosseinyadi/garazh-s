import { toast } from 'sonner';
import apiService from './api';
import {
  sendNewOrderEmail,
  sendAdApprovedEmail,
  sendAdRejectedEmail,
  sendNewInquiryEmail,
  getSellerEmail,
  getSellerInfo
} from './email';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

export async function createNotification(data: {
  user_id: string;
  title: string;
  message: string;
  type: Notification['type'];
  data?: Record<string, unknown>;
}) {
  try {
    // For now, just show toast notifications without storing in database
    // TODO: Implement notification storage in local database when needed

    // Show toast notification
    switch (data.type) {
      case 'success':
        toast.success(data.title, { description: data.message });
        break;
      case 'error':
        toast.error(data.title, { description: data.message });
        break;
      case 'warning':
        toast.warning(data.title, { description: data.message });
        break;
      default:
        toast.info(data.title, { description: data.message });
    }

    // Return a mock notification object for compatibility
    return {
      id: Date.now().toString(),
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      created_at: new Date().toISOString(),
      data: data.data
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function getNotifications(userId: string) {
  // For now, return empty array since we're not storing notifications in database
  // TODO: Implement notification storage in local database when needed
  console.log('getNotifications called for user:', userId);
  return [] as Notification[];
}

export async function markNotificationAsRead(notificationId: string) {
  // For now, just log the action since we're not storing notifications
  console.log('markNotificationAsRead called for notification:', notificationId);
}

export async function markAllNotificationsAsRead(userId: string) {
  // For now, just log the action since we're not storing notifications
  console.log('markAllNotificationsAsRead called for user:', userId);
}

// System notification functions
export async function notifyNewOrder(orderData: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  adTitle: string;
  total: number;
  adId: string;
}) {
  try {
    // Simplified version without database lookups for now
    // TODO: Implement proper notification system with local API

    // Show success notification
    toast.success('سفارش جدید ثبت شد', {
      description: `سفارش ${orderData.orderId} برای "${orderData.adTitle}"`
    });

    // Try to send email if seller info is available
    try {
      const sellerEmail = await getSellerEmail(orderData.adId);
      if (sellerEmail) {
        await sendNewOrderEmail({
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail,
          adTitle: orderData.adTitle,
          totalAmount: orderData.total,
          sellerEmail,
        });
      }
    } catch (emailError) {
      console.error('Error sending order email:', emailError);
    }
  } catch (error) {
    console.error('Error in notifyNewOrder:', error);
  }
}

export async function notifyAdApproved(adData: {
  adId: string;
  adTitle: string;
  sellerId: string;
}) {
  try {
    // Create in-app notification
    await createNotification({
      user_id: adData.sellerId,
      title: 'آگهی تایید شد',
      message: `آگهی "${adData.adTitle}" شما تایید و منتشر شد`,
      type: 'success',
      data: { adId: adData.adId }
    });

    // Send email notification
    const sellerInfo = await getSellerInfo(adData.sellerId);
    const sellerEmail = await getSellerEmail(adData.adId);

    if (sellerEmail && sellerInfo) {
      await sendAdApprovedEmail({
        adId: adData.adId,
        adTitle: adData.adTitle,
        sellerName: sellerInfo.name,
        sellerEmail,
      });
    }
  } catch (error) {
    console.error('Error in notifyAdApproved:', error);
  }
}

export async function notifyAdRejected(adData: {
  adId: string;
  adTitle: string;
  sellerId: string;
  reason?: string;
}) {
  try {
    // Create in-app notification
    await createNotification({
      user_id: adData.sellerId,
      title: 'آگهی رد شد',
      message: `آگهی "${adData.adTitle}" شما رد شد${adData.reason ? `: ${adData.reason}` : ''}`,
      type: 'warning',
      data: { adId: adData.adId, reason: adData.reason }
    });

    // Send email notification
    const sellerInfo = await getSellerInfo(adData.sellerId);
    const sellerEmail = await getSellerEmail(adData.adId);

    if (sellerEmail && sellerInfo) {
      await sendAdRejectedEmail({
        adId: adData.adId,
        adTitle: adData.adTitle,
        sellerName: sellerInfo.name,
        sellerEmail,
        reason: adData.reason,
      });
    }
  } catch (error) {
    console.error('Error in notifyAdRejected:', error);
  }
}

export async function notifyNewInquiry(inquiryData: {
  inquiryId: string;
  adId: string;
  adTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
}) {
  try {
    // Simplified version without database lookups for now
    // TODO: Implement proper notification system with local API

    // Show info notification
    toast.info('پیام جدید دریافت شد', {
      description: `پیام برای آگهی "${inquiryData.adTitle}"`
    });

    // Try to send email if seller info is available
    try {
      const sellerEmail = await getSellerEmail(inquiryData.adId);
      if (sellerEmail) {
        await sendNewInquiryEmail({
          adTitle: inquiryData.adTitle,
          customerName: inquiryData.customerName,
          customerPhone: inquiryData.customerPhone,
          customerEmail: inquiryData.customerEmail,
          message: inquiryData.message,
          sellerEmail,
        });
      }
    } catch (emailError) {
      console.error('Error sending inquiry email:', emailError);
    }
  } catch (error) {
    console.error('Error in notifyNewInquiry:', error);
  }
}
