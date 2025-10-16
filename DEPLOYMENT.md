# راهنمای استقرار Bil Flow

## مراحل استقرار کامل

### 1. آماده‌سازی سرور

```bash
# به‌روزرسانی سیستم
sudo apt update && sudo apt upgrade -y

# نصب Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# نصب PM2 برای مدیریت پروسه‌ها
sudo npm install -g pm2
```

### 2. استقرار بک‌اند

```bash
# کپی کردن فایل‌های سرور
scp -r server/ user@your-server:/var/www/bilflow/

# اتصال به سرور
ssh user@your-server

# رفتن به پوشه پروژه
cd /var/www/bilflow/server

# نصب وابستگی‌ها
npm install --production

# ایجاد فایل .env
nano .env
```

محتوای فایل `.env`:
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-very-secure-secret-key-here
SMS_USERNAME=your_sms_username
SMS_PASSWORD=your_sms_password
SMS_FROM_NUMBER=50004001400000
```

```bash
# اجرای سرور با PM2
pm2 start server.js --name "bilflow-server"
pm2 save
pm2 startup
```

### 3. استقرار فرانت‌اند

```bash
# در ماشین محلی
npm run build

# آپلود فایل‌های build
scp -r dist/* user@your-server:/var/www/html/
```

### 4. تنظیم Nginx

```bash
# ایجاد فایل کانفیگ
sudo nano /etc/nginx/sites-available/bilflow
```

محتوای فایل:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# فعال کردن سایت
sudo ln -s /etc/nginx/sites-available/bilflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. تنظیم SSL (اختیاری)

```bash
# نصب Certbot
sudo apt install certbot python3-certbot-nginx

# دریافت گواهی SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6. تنظیم فایروال

```bash
# باز کردن پورت‌های لازم
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 7. مانیتورینگ

```bash
# مشاهده لاگ‌ها
pm2 logs bilflow-server

# وضعیت سرور
pm2 status

# ری‌استارت سرور
pm2 restart bilflow-server
```

## تنظیمات پایگاه داده

دیتابیس SQLite به صورت خودکار ایجاد می‌شود. برای پشتیبان‌گیری:

```bash
# کپی دیتابیس
cp /var/www/bilflow/server/database/bilflow.db /backup/

# بازگردانی دیتابیس
cp /backup/bilflow.db /var/www/bilflow/server/database/
```

## به‌روزرسانی

```bash
# توقف سرور
pm2 stop bilflow-server

# آپدیت کد
git pull origin main

# نصب وابستگی‌های جدید
npm install --production

# ری‌استارت سرور
pm2 start bilflow-server
```

## عیب‌یابی

### مشکلات رایج

1. **سرور شروع نمی‌شود**
   ```bash
   pm2 logs bilflow-server
   ```

2. **خطای دیتابیس**
   ```bash
   # بررسی مجوزهای فایل
   ls -la /var/www/bilflow/server/database/
   ```

3. **مشکل CORS**
   - بررسی تنظیمات `FRONTEND_URL` در `.env`

4. **مشکل SMS**
   - بررسی تنظیمات پنل پیامک
   - تست در حالت development

### لاگ‌ها

```bash
# لاگ‌های Nginx
sudo tail -f /var/log/nginx/error.log

# لاگ‌های PM2
pm2 logs bilflow-server --lines 100
```

## امنیت

1. **تغییر رمزهای پیش‌فرض**
2. **تنظیم فایروال**
3. **به‌روزرسانی منظم سیستم**
4. **پشتیبان‌گیری منظم**
5. **مانیتورینگ لاگ‌ها**

## پشتیبانی

در صورت بروز مشکل، لاگ‌ها و جزئیات خطا را برای تیم پشتیبانی ارسال کنید.
