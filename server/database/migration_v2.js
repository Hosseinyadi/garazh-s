// Migration script to update database schema for enhanced categorization
// Run this after updating the schema.sql file

const { dbHelpers } = require('../config/database');

async function runMigration() {
    try {
        console.log('Starting database migration v2...');

        // Add new columns to listings table
        console.log('Adding new columns to listings table...');

        // Add ad_type_id column
        await dbHelpers.run(`
            ALTER TABLE listings
            ADD COLUMN ad_type_id INTEGER,
            ADD COLUMN tags TEXT,
            ADD FOREIGN KEY (ad_type_id) REFERENCES ad_types(id)
        `).catch(err => {
            if (!err.message.includes('duplicate column name')) {
                throw err;
            }
        });

        // Create ad_types table if it doesn't exist
        console.log('Creating ad_types table...');
        await dbHelpers.run(`
            CREATE TABLE IF NOT EXISTS ad_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Update categories table structure
        console.log('Updating categories table...');
        await dbHelpers.run(`
            ALTER TABLE categories
            ADD COLUMN parent_id INTEGER,
            ADD COLUMN category_type VARCHAR(50) DEFAULT 'equipment'
        `).catch(err => {
            if (!err.message.includes('duplicate column name')) {
                throw err;
            }
        });

        // Insert new categories (skip if they already exist)
        console.log('Inserting new categories...');
        const categories = [
            // Equipment categories
            ['ماشین‌آلات سنگین', 'machinery', '🚜', null, 'equipment'],
            ['بیل مکانیکی', 'excavators', '🚜', null, 'equipment'],
            ['بولدوزر', 'bulldozers', '🚧', null, 'equipment'],
            ['لودر', 'loaders', '🚛', null, 'equipment'],
            ['کرین', 'cranes', '🏗️', null, 'equipment'],
            ['کمپرسی', 'compressors', '💨', null, 'equipment'],
            ['رولر', 'rollers', '🚧', null, 'equipment'],
            ['دامپ تراک', 'dump-trucks', '🚚', null, 'equipment'],
            ['میکسر بتن', 'concrete-mixers', '🏗️', null, 'equipment'],
            ['ژنراتور', 'generators', '⚡', null, 'equipment'],
            ['پمپ', 'pumps', '💧', null, 'equipment'],

            // Parts categories
            ['قطعات یدکی', 'parts', '🔧', null, 'parts'],
            ['قطعات بیل مکانیکی', 'excavator-parts', '🔧', null, 'parts'],
            ['قطعات بولدوزر', 'bulldozer-parts', '🔧', null, 'parts'],
            ['قطعات لودر', 'loader-parts', '🔧', null, 'parts'],
            ['فیلتر و روغن', 'filters-oil', '🛢️', null, 'parts'],
            ['تیغه و دندانه', 'blades-teeth', '⚔️', null, 'parts'],
            ['باتری و برق', 'battery-electric', '🔋', null, 'parts'],

            // Services categories
            ['خدمات تعمیرات', 'repair-services', '🔧', null, 'services'],
            ['خدمات اجاره', 'rental-services', '📅', null, 'services'],
            ['خدمات حمل و نقل', 'transport-services', '🚛', null, 'services'],
            ['مشاوره فنی', 'technical-consulting', '👨‍🔬', null, 'services'],
            ['فروش قطعات', 'parts-sales', '🛒', null, 'services']
        ];

        for (const [name, slug, icon, parentId, categoryType] of categories) {
            await dbHelpers.run(`
                INSERT OR IGNORE INTO categories (name, slug, icon, parent_id, category_type)
                VALUES (?, ?, ?, ?, ?)
            `, [name, slug, icon, parentId, categoryType]);
        }

        // Insert ad types
        console.log('Inserting ad types...');
        const adTypes = [
            ['فروش ماشین‌آلات', 'machinery-sale', 'فروش ماشین‌آلات سنگین و تجهیزات'],
            ['اجاره ماشین‌آلات', 'machinery-rent', 'اجاره ماشین‌آلات سنگین'],
            ['فروش قطعات', 'parts-sale', 'فروش قطعات یدکی و لوازم جانبی'],
            ['خدمات تعمیرات', 'repair-service', 'ارائه خدمات تعمیر و نگهداری'],
            ['همکاری تجاری', 'business-cooperation', 'پیشنهاد همکاری و مشارکت تجاری'],
            ['تبلیغات', 'advertising', 'آگهی‌های تبلیغاتی و بازاریابی']
        ];

        for (const [name, slug, description] of adTypes) {
            await dbHelpers.run(`
                INSERT OR IGNORE INTO ad_types (name, slug, description)
                VALUES (?, ?, ?)
            `, [name, slug, description]);
        }

        // Update existing listings to have default ad_type_id based on type
        console.log('Updating existing listings with default ad types...');
        await dbHelpers.run(`
            UPDATE listings
            SET ad_type_id = (
                SELECT id FROM ad_types
                WHERE slug = CASE
                    WHEN listings.type = 'sale' THEN 'machinery-sale'
                    WHEN listings.type = 'rent' THEN 'machinery-rent'
                    ELSE 'machinery-sale'
                END
                LIMIT 1
            )
            WHERE ad_type_id IS NULL
        `);

        // Initialize tags as empty arrays for existing listings
        console.log('Initializing tags for existing listings...');
        await dbHelpers.run(`
            UPDATE listings
            SET tags = '[]'
            WHERE tags IS NULL
        `);

        // Update category_type for existing categories
        console.log('Updating category types for existing categories...');
        await dbHelpers.run(`
            UPDATE categories
            SET category_type = 'equipment'
            WHERE category_type IS NULL
        `);

        // Create indexes for better performance
        console.log('Creating indexes...');
        await dbHelpers.run(`CREATE INDEX IF NOT EXISTS idx_listings_ad_type ON listings(ad_type_id)`);
        await dbHelpers.run(`CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(category_type)`);
        await dbHelpers.run(`CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id)`);

        console.log('Migration v2 completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

// Export for use in other scripts
module.exports = { runMigration };

// Run migration if called directly
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}