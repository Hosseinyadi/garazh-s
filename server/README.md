# Bil Flow Server

سرور API برای بازارگاه ماشین آلات سنگین بیل فلو

## ویژگی‌ها

- ✅ احراز هویت OTP با پیامک
- ✅ پروفایل کاربری کامل
- ✅ سیستم علاقه‌مندی‌ها
- ✅ ردیابی بازدیدها
- ✅ پنل مدیریت ادمین
- ✅ دیتابیس SQLite (ساده و قابل حمل)
- ✅ امنیت بالا با Rate Limiting
- ✅ پشتیبانی از آپلود تصاویر

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 16+ 
- npm یا yarn

### نصب
```bash
cd server
npm install
```

### تنظیمات
1. فایل `.env` ایجاد کنید:
```bash
cp .env.example .env
```

2. متغیرهای محیطی را تنظیم کنید:
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-secret-key
SMS_USERNAME=your_sms_username
SMS_PASSWORD=your_sms_password
```

### اجرا
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### احراز هویت
- `POST /api/auth/send-otp` - ارسال کد تایید
- `POST /api/auth/verify-otp` - تایید کد و ورود
- `POST /api/auth/admin/login` - ورود ادمین
- `GET /api/auth/profile` - دریافت پروفایل
- `PUT /api/auth/profile` - به‌روزرسانی پروفایل

### آگهی‌ها
- `GET /api/listings` - لیست آگهی‌ها
- `GET /api/listings/:id` - جزئیات آگهی
- `POST /api/listings` - ایجاد آگهی جدید
- `PUT /api/listings/:id` - ویرایش آگهی
- `DELETE /api/listings/:id` - حذف آگهی
- `GET /api/listings/categories/all` - لیست دسته‌بندی‌ها

### علاقه‌مندی‌ها
- `GET /api/favorites` - لیست علاقه‌مندی‌ها
- `POST /api/favorites` - اضافه کردن به علاقه‌مندی‌ها
- `DELETE /api/favorites/:listing_id` - حذف از علاقه‌مندی‌ها
- `POST /api/favorites/toggle` - تغییر وضعیت علاقه‌مندی

### مدیریت (ادمین)
- `GET /api/admin/dashboard` - آمار کلی
- `GET /api/admin/listings` - مدیریت آگهی‌ها
- `GET /api/admin/users` - مدیریت کاربران
- `PATCH /api/admin/listings/:id/status` - تغییر وضعیت آگهی

## دیتابیس

دیتابیس SQLite به صورت خودکار ایجاد می‌شود. فایل دیتابیس در مسیر `database/bilflow.db` ذخیره می‌شود.

### جداول اصلی:
- `users` - کاربران
- `otp_verifications` - کدهای تایید
- `listings` - آگهی‌ها
- `categories` - دسته‌بندی‌ها
- `user_favorites` - علاقه‌مندی‌ها
- `listing_views` - بازدیدها
- `admin_users` - ادمین‌ها

## امنیت

- Rate Limiting برای جلوگیری از حملات
- JWT برای احراز هویت
- Helmet برای امنیت HTTP
- اعتبارسنجی ورودی‌ها
- CORS تنظیم شده

## استقرار

برای استقرار روی سرور:

1. کد را روی سرور آپلود کنید
2. `npm install --production` اجرا کنید
3. متغیرهای محیطی را تنظیم کنید
4. `npm start` اجرا کنید

### با PM2:
```bash
npm install -g pm2
pm2 start server.js --name "bil-flow-server"
pm2 save
pm2 startup
```

## لاگ‌ها

لاگ‌های سرور در کنسول نمایش داده می‌شوند. برای محیط production از PM2 یا سیستم مشابه استفاده کنید.

## پشتیبانی

برای پشتیبانی و گزارش باگ با تیم توسعه تماس بگیرید.
