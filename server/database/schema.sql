-- Bil Flow Database Schema
-- SQLite database for production server

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100),
    avatar TEXT,
    is_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    parent_id INTEGER, -- For hierarchical categories
    category_type VARCHAR(50) DEFAULT 'equipment', -- equipment, parts, services
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Ad types table for more granular classification
CREATE TABLE IF NOT EXISTS ad_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Machinery listings table
CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('rent','sale')),
    ad_type_id INTEGER, -- More granular ad classification
    category_id INTEGER,
    user_id INTEGER NOT NULL,
    images TEXT, -- JSON array of image URLs
    location VARCHAR(200),
    condition VARCHAR(50),
    year INTEGER,
    brand VARCHAR(100),
    model VARCHAR(100),
    specifications TEXT, -- JSON object
    tags TEXT, -- JSON array of tags for better search
    is_active BOOLEAN DEFAULT 1,
    is_featured BOOLEAN DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_type_id) REFERENCES ad_types(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    UNIQUE(user_id, listing_id)
);

-- View tracking table
CREATE TABLE IF NOT EXISTS listing_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    user_id INTEGER, -- NULL for anonymous views
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT OR IGNORE INTO admin_users (username, password_hash, role) 
VALUES ('hossein', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Provinces table
CREATE TABLE IF NOT EXISTS provinces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    province_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (province_id) REFERENCES provinces(id)
);

-- Insert default categories (hierarchical structure)
INSERT OR IGNORE INTO categories (name, slug, icon, category_type) VALUES
-- Main equipment categories
('ماشین‌آلات سنگین', 'machinery', '🚜', 'equipment'),
('بیل مکانیکی', 'excavators', '🚜', 'equipment'),
('بولدوزر', 'bulldozers', '🚧', 'equipment'),
('لودر', 'loaders', '🚛', 'equipment'),
('کرین', 'cranes', '🏗️', 'equipment'),
('کمپرسی', 'compressors', '💨', 'equipment'),
('رولر', 'rollers', '🚧', 'equipment'),
('دامپ تراک', 'dump-trucks', '🚚', 'equipment'),
('میکسر بتن', 'concrete-mixers', '🏗️', 'equipment'),
('ژنراتور', 'generators', '⚡', 'equipment'),
('پمپ', 'pumps', '💧', 'equipment'),

-- Parts categories
('قطعات یدکی', 'parts', '🔧', 'parts'),
('قطعات بیل مکانیکی', 'excavator-parts', '🔧', 'parts'),
('قطعات بولدوزر', 'bulldozer-parts', '🔧', 'parts'),
('قطعات لودر', 'loader-parts', '🔧', 'parts'),
('فیلتر و روغن', 'filters-oil', '🛢️', 'parts'),
('تیغه و دندانه', 'blades-teeth', '⚔️', 'parts'),
('باتری و برق', 'battery-electric', '🔋', 'parts'),

-- Services categories
('خدمات تعمیرات', 'repair-services', '🔧', 'services'),
('خدمات اجاره', 'rental-services', '📅', 'services'),
('خدمات حمل و نقل', 'transport-services', '🚛', 'services'),
('مشاوره فنی', 'technical-consulting', '👨‍🔬', 'services'),
('فروش قطعات', 'parts-sales', '🛒', 'services');

-- Insert default ad types
INSERT OR IGNORE INTO ad_types (name, slug, description) VALUES
('فروش ماشین‌آلات', 'machinery-sale', 'فروش ماشین‌آلات سنگین و تجهیزات'),
('اجاره ماشین‌آلات', 'machinery-rent', 'اجاره ماشین‌آلات سنگین'),
('فروش قطعات', 'parts-sale', 'فروش قطعات یدکی و لوازم جانبی'),
('خدمات تعمیرات', 'repair-service', 'ارائه خدمات تعمیر و نگهداری'),
('همکاری تجاری', 'business-cooperation', 'پیشنهاد همکاری و مشارکت تجاری'),
('تبلیغات', 'advertising', 'آگهی‌های تبلیغاتی و بازاریابی');

-- Insert default provinces
INSERT OR IGNORE INTO provinces (name, name_en) VALUES
('تهران', 'Tehran'),
('اصفهان', 'Isfahan'),
('فارس', 'Fars'),
('خراسان رضوی', 'Razavi Khorasan'),
('آذربایجان شرقی', 'East Azerbaijan'),
('مازندران', 'Mazandaran'),
('گیلان', 'Gilan'),
('کرمان', 'Kerman'),
('خوزستان', 'Khuzestan'),
('سیستان و بلوچستان', 'Sistan and Baluchestan');

-- Insert default cities for Tehran
INSERT OR IGNORE INTO cities (name, name_en, province_id) VALUES
('تهران', 'Tehran', 1),
('کرج', 'Karaj', 1),
('ورامین', 'Varamin', 1),
('شهریار', 'Shahriar', 1),
('ملارد', 'Malard', 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_ad_type ON listings(ad_type_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(category_type);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_views_listing ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_views_date ON listing_views(viewed_at);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending|confirmed|cancelled|completed
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES listings(id),
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_ad ON orders(ad_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_id INTEGER NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new', -- new|read|replied
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES listings(id)
);

CREATE INDEX IF NOT EXISTS idx_inquiries_ad ON inquiries(ad_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
