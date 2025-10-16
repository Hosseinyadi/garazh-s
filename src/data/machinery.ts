// Mock data for machinery listings
export interface MachineryItem {
  id: string;
  title: string;
  description: string;
  price: string;
  type: 'rent' | 'sale';
  adType?: string; // More granular ad classification
  category: string;
  categoryType?: 'equipment' | 'parts' | 'services';
  tags?: string[]; // Additional tags for better categorization
  location: {
    province: string;
    city: string;
  };
  image: string;
  featured: boolean;
  specs: {
    brand: string;
    model: string;
    year: number;
    hours?: number;
    condition: string;
  };
  contact: {
    name: string;
    phone: string;
  };
  createdAt: string;
}

// Category interface for hierarchical categories
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parentId?: number;
  categoryType: 'equipment' | 'parts' | 'services';
}

// Ad type interface for granular classification
export interface AdType {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export const featuredMachinery: MachineryItem[] = [
  {
    id: '1',
    title: 'بیل مکانیکی کوماتسو PC200',
    description: 'بیل مکانیکی کوماتسو مدل PC200 در شرایط عالی، مناسب برای پروژه‌های سنگین',
    price: '۲،۵۰۰،۰۰۰',
    type: 'rent',
    adType: 'اجاره ماشین‌آلات',
    category: 'بیل مکانیکی',
    categoryType: 'equipment',
    tags: ['بیل مکانیکی', 'کوماتسو', 'اجاره روزانه'],
    location: {
      province: 'تهران',
      city: 'تهران'
    },
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
    featured: true,
    specs: {
      brand: 'کوماتسو',
      model: 'PC200',
      year: 2020,
      hours: 2500,
      condition: 'عالی'
    },
    contact: {
      name: 'احمد محمدی',
      phone: '۰۹۱۲۳۴۵۶۷۸۹'
    },
    createdAt: '۱۴۰۳/۰۵/۱۵'
  },
  {
    id: '2',
    title: 'بولدوزر کاترپیلار D6T',
    description: 'بولدوزر کاترپیلار مدل D6T قدرتمند و کارآمد برای عملیات خاکریزی',
    price: '۴،۸۰۰،۰۰۰،۰۰۰',
    type: 'sale',
    adType: 'فروش ماشین‌آلات',
    category: 'بولدوزر',
    categoryType: 'equipment',
    tags: ['بولدوزر', 'کاترپیلار', 'فروش نقدی', 'عملیات خاکریزی'],
    location: {
      province: 'اصفهان',
      city: 'اصفهان'
    },
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
    featured: true,
    specs: {
      brand: 'کاترپیلار',
      model: 'D6T',
      year: 2019,
      hours: 3200,
      condition: 'خوب'
    },
    contact: {
      name: 'رضا احمدی',
      phone: '۰۹۱۱۲۳۴۵۶۷۸'
    },
    createdAt: '۱۴۰۳/۰۵/۱۲'
  },
  {
    id: '3',
    title: 'لودر چرخی ولوو L90H',
    description: 'لودر چرخی ولوو مدل L90H با قابلیت‌های بالا برای حمل و نقل مواد',
    price: '۱،۸۰۰،۰۰۰',
    type: 'rent',
    category: 'لودر',
    location: {
      province: 'فارس',
      city: 'شیراز'
    },
    image: 'https://images.unsplash.com/photo-1615387000132-465b8c2e5e05?w=400&h=300&fit=crop',
    featured: true,
    specs: {
      brand: 'ولوو',
      model: 'L90H',
      year: 2021,
      hours: 1800,
      condition: 'عالی'
    },
    contact: {
      name: 'علی کریمی',
      phone: '۰۹۱۷۳۴۵۶۷۸۹'
    },
    createdAt: '۱۴۰۳/۰۵/۱۰'
  }
];

export const categories = [
  // Equipment categories
  'ماشین‌آلات سنگین',
  'بیل مکانیکی',
  'بولدوزر',
  'لودر',
  'کرین',
  'کمپرسی',
  'رولر',
  'دامپ تراک',
  'میکسر بتن',
  'ژنراتور',
  'پمپ',
  // Parts categories
  'قطعات یدکی',
  'قطعات بیل مکانیکی',
  'قطعات بولدوزر',
  'قطعات لودر',
  'فیلتر و روغن',
  'تیغه و دندانه',
  'باتری و برق',
  // Services categories
  'خدمات تعمیرات',
  'خدمات اجاره',
  'خدمات حمل و نقل',
  'مشاوره فنی',
  'فروش قطعات'
];

export const adTypes = [
  'فروش ماشین‌آلات',
  'اجاره ماشین‌آلات',
  'فروش قطعات',
  'خدمات تعمیرات',
  'همکاری تجاری',
  'تبلیغات'
];

export const provinces = [
  'همه استان‌ها',
  'تهران',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'آذربایجان شرقی',
  'خوزستان',
  'مازندران',
  'گیلان',
  'کرمان',
  'سیستان و بلوچستان'
];

export const cities = {
  'تهران': ['همه شهرها', 'تهران', 'کرج', 'اسلامشهر', 'ورامین'],
  'اصفهان': ['همه شهرها', 'اصفهان', 'کاشان', 'نجف‌آباد', 'خمینی‌شهر'],
  'فارس': ['همه شهرها', 'شیراز', 'مرودشت', 'کازرون', 'فسا'],
  'خراسان رضوی': ['همه شهرها', 'مشهد', 'نیشابور', 'سبزوار', 'تربت حیدریه']
};