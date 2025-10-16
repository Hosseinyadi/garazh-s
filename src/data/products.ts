// Mock data for parts and services products

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  specs: string;
  seller: {
    id: string;
    name: string;
  };
  images: string[];
  createdAt: string;
}

// Sample products to populate the shop before any seller adds their own.
// These should be replaced by real data from the local database in production.
export const sampleProducts: ProductItem[] = [
  {
    id: 'p1',
    name: 'تیغه بیل مکانیکی کوماتسو PC200',
    category: 'قطعات بیل مکانیکی',
    description: 'تیغه اصلی بیل مکانیکی کوماتسو PC200، ساخته شده از فولاد مقاوم با عمر طولانی.',
    price: 1500000,
    specs: 'مناسب برای مدل PC200\nوزن: 25 کیلوگرم',
    seller: {
      id: 's1',
      name: 'شرکت تجهیز ماشین',
    },
    images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'],
    createdAt: '۱۴۰۳/۰۵/۲۰',
  },
  {
    id: 'p2',
    name: 'فیلتر هوای لودر ولوو L90H',
    category: 'قطعات لودر',
    description: 'فیلتر هوای اصلی برای لودر ولوو مدل L90H جهت کارایی بهتر و افزایش عمر موتور.',
    price: 800000,
    specs: 'مناسب برای مدل L90H\nطول: 50 سانتی‌متر',
    seller: {
      id: 's2',
      name: 'فروشگاه یدک سازان',
    },
    images: ['https://images.unsplash.com/photo-1615387000132-465b8c2e5e05?w=400&h=300&fit=crop'],
    createdAt: '۱۴۰۳/۰۵/۲۱',
  },
  {
    id: 'p3',
    name: 'خدمات تعمیر گیربکس بولدوزر CAT D6T',
    category: 'خدمات تعمیرات',
    description: 'تعمیر تخصصی گیربکس بولدوزر کاترپیلار D6T توسط تکنسین‌های مجرب.',
    price: 5000000,
    specs: 'هزینه خدمات شامل بازدید اولیه و اجرت تعمیر است.',
    seller: {
      id: 's3',
      name: 'مرکز خدمات راه‌سازی',
    },
    images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop'],
    createdAt: '۱۴۰۳/۰۵/۲۲',
  },
];