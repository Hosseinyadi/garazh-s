import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, MapPin, DollarSign, Filter } from "lucide-react";
import { categories, provinces, cities } from "@/data/machinery";

const SearchSection = () => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const availableCities = selectedProvince && cities[selectedProvince as keyof typeof cities] 
    ? cities[selectedProvince as keyof typeof cities] 
    : ['همه شهرها'];

  const handleSearch = () => {
    // This would normally navigate to search results
    console.log('Search with:', { selectedProvince, selectedCity, selectedCategory, maxPrice });
  };

  return (
    <section className="bg-gradient-surface py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-4">
            جستجوی هوشمند ماشین‌آلات
          </h2>
          <p className="text-muted-foreground text-lg">
            با فیلترهای پیشرفته، دقیقاً همان چیزی که نیاز دارید پیدا کنید
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-warm p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Province Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <MapPin className="w-4 h-4 ml-2" />
                انتخاب استان
              </label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="search-select">
                  <SelectValue placeholder="همه استان‌ها" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <MapPin className="w-4 h-4 ml-2" />
                انتخاب شهر
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="search-select">
                  <SelectValue placeholder="همه شهرها" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <Filter className="w-4 h-4 ml-2" />
                دسته‌بندی
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="search-select">
                  <SelectValue placeholder="همه دسته‌ها" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center">
                <DollarSign className="w-4 h-4 ml-2" />
                حداکثر قیمت (تومان)
              </label>
              <Input
                type="text"
                placeholder="مثال: ۵،۰۰۰،۰۰۰"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                className="btn-hero w-full"
                size="lg"
              >
                <Search className="w-5 h-5 ml-2" />
                جستجوی هوشمند
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>جستجوهای پرطرفدار:</span>
            <button className="text-primary hover:underline">بیل مکانیکی تهران</button>
            <button className="text-primary hover:underline">لودر اجاره‌ای</button>
            <button className="text-primary hover:underline">بولدوزر کاترپیلار</button>
            <button className="text-primary hover:underline">کرین سنگین</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;