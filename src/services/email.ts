// Email service for sending notifications
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Simple email templates
export const emailTemplates = {
  newOrder: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    adTitle: string;
    totalAmount: number;
    orderId: string;
  }) => ({
    subject: `سفارش جدید - ${data.adTitle}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>سفارش جدید دریافت شد</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>اطلاعات مشتری:</h3>
          <p><strong>نام:</strong> ${data.customerName}</p>
          <p><strong>شماره تماس:</strong> ${data.customerPhone}</p>
          ${data.customerEmail ? `<p><strong>ایمیل:</strong> ${data.customerEmail}</p>` : ''}
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>اطلاعات سفارش:</h3>
          <p><strong>آگهی:</strong> ${data.adTitle}</p>
          <p><strong>مبلغ:</strong> ${data.totalAmount.toLocaleString('fa-IR')} تومان</p>
          <p><strong>شماره سفارش:</strong> ${data.orderId}</p>
        </div>
        <p>لطفا در اولین فرصت با مشتری تماس بگیرید.</p>
      </div>
    `,
  }),

  adApproved: (data: { adTitle: string; sellerName: string }) => ({
    subject: `آگهی شما تایید شد - ${data.adTitle}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">آگهی شما تایید شد! ✅</h2>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <h3>تبریک ${data.sellerName}!</h3>
          <p>آگهی "<strong>${data.adTitle}</strong>" شما با موفقیت تایید و منتشر شد.</p>
          <p>اکنون مشتریان می‌توانند آگهی شما را مشاهده و با شما تماس بگیرند.</p>
        </div>
        <p>موفق باشید!</p>
      </div>
    `,
  }),

  adRejected: (data: { adTitle: string; sellerName: string; reason?: string }) => ({
    subject: `آگهی شما رد شد - ${data.adTitle}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">آگهی شما رد شد</h2>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p>با عرض پوزش ${data.sellerName}،</p>
          <p>آگهی "<strong>${data.adTitle}</strong>" شما رد شد.</p>
          ${data.reason ? `<p><strong>دلیل:</strong> ${data.reason}</p>` : ''}
        </div>
        <p>می‌توانید آگهی خود را ویرایش کرده و دوباره ارسال کنید.</p>
      </div>
    `,
  }),

  newInquiry: (data: {
    adTitle: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    message: string;
  }) => ({
    subject: `پیام جدید برای آگهی ${data.adTitle}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>پیام جدید دریافت شد</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>اطلاعات مشتری:</h3>
          <p><strong>نام:</strong> ${data.customerName}</p>
          <p><strong>شماره تماس:</strong> ${data.customerPhone}</p>
          ${data.customerEmail ? `<p><strong>ایمیل:</strong> ${data.customerEmail}</p>` : ''}
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>پیام:</h3>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
        <p>لطفا در اولین فرصت با مشتری تماس بگیرید.</p>
      </div>
    `,
  }),
};

// Email service functions
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // For now, just log the email instead of sending it
    // TODO: Implement actual email sending with a service like SendGrid, Mailgun, etc.
    console.log('📧 Email would be sent:', {
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html.substring(0, 100) + '...',
    });

    // Simulate successful sending for development
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Notification email functions
export async function sendNewOrderEmail(orderData: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  adTitle: string;
  totalAmount: number;
  sellerEmail?: string;
}): Promise<boolean> {
  if (!orderData.sellerEmail) {
    console.warn('No seller email provided for order notification');
    return false;
  }

  const template = emailTemplates.newOrder(orderData);

  return await sendEmail({
    to: orderData.sellerEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendAdApprovedEmail(adData: {
  adId: string;
  adTitle: string;
  sellerName: string;
  sellerEmail?: string;
}): Promise<boolean> {
  if (!adData.sellerEmail) {
    console.warn('No seller email provided for approval notification');
    return false;
  }

  const template = emailTemplates.adApproved(adData);

  return await sendEmail({
    to: adData.sellerEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendAdRejectedEmail(adData: {
  adId: string;
  adTitle: string;
  sellerName: string;
  sellerEmail?: string;
  reason?: string;
}): Promise<boolean> {
  if (!adData.sellerEmail) {
    console.warn('No seller email provided for rejection notification');
    return false;
  }

  const template = emailTemplates.adRejected(adData);

  return await sendEmail({
    to: adData.sellerEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendNewInquiryEmail(inquiryData: {
  adTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  sellerEmail?: string;
}): Promise<boolean> {
  if (!inquiryData.sellerEmail) {
    console.warn('No seller email provided for inquiry notification');
    return false;
  }

  const template = emailTemplates.newInquiry(inquiryData);

  return await sendEmail({
    to: inquiryData.sellerEmail,
    subject: template.subject,
    html: template.html,
  });
}

// Helper function to get seller email from ad
export async function getSellerEmail(adId: string): Promise<string | null> {
  try {
    // For now, return null since we don't have seller email lookup without Supabase
    // TODO: Implement seller email lookup with local API
    console.log('getSellerEmail called for ad:', adId);
    return null;
  } catch (error) {
    console.error('Error getting seller email:', error);
    return null;
  }
}

// Helper function to get seller info from user ID
export async function getSellerInfo(userId: string): Promise<{ name: string; email?: string } | null> {
  try {
    // For now, return basic seller info without database lookup
    // TODO: Implement seller info lookup with local API
    console.log('getSellerInfo called for user:', userId);
    return { name: 'فروشنده' };
  } catch (error) {
    console.error('Error getting seller info:', error);
    return null;
  }
}