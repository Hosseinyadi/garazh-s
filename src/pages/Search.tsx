import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiService from "@/services/api";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  const { data: provincesData } = useQuery({
    queryKey: ['provinces'],
    queryFn: () => apiService.getProvinces(),
  });

  const { data: adsData, isLoading } = useQuery({
    queryKey: ['ads', { searchQuery, selectedType, selectedCategory, selectedProvince, page }],
    queryFn: () => apiService.getListings({
      type: selectedType !== 'all' ? selectedType : undefined,
      category: selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined,
      search: searchQuery,
      page,
      limit: 12,
    }),
  });

  const items = adsData?.data?.listings ?? [];
  const total = adsData?.data?.pagination?.total_items ?? 0;
  const hasNoResults = !isLoading && items.length === 0;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Search Header */}
        <section className="bg-gradient-surface py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                جستجوی ماشین‌آلات
              </h1>
              <p className="text-muted-foreground text-lg">
                {isLoading ? 'در حال بارگذاری...' : `${total} آگهی موجود`}
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-warm p-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="جستجو در ماشین‌آلات..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                      className="search-input pl-10"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-outline-warm"
                >
                  <SlidersHorizontal className="w-4 h-4 ml-2" />
                  فیلترها
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نوع آگهی</label>
                    <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setPage(1); }}>
                      <SelectTrigger className="search-select">
                        <SelectValue placeholder="همه انواع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه انواع</SelectItem>
                        <SelectItem value="rent">اجاره</SelectItem>
                        <SelectItem value="sale">فروش</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">دسته‌بندی</label>
                    <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(1); }}>
                      <SelectTrigger className="search-select">
                        <SelectValue placeholder="همه دسته‌ها" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه دسته‌ها</SelectItem>
                        {(categoriesData?.data?.categories ?? []).map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">استان</label>
                    <Select value={selectedProvince} onValueChange={(v) => { setSelectedProvince(v); setPage(1); }}>
                      <SelectTrigger className="search-select">
                        <SelectValue placeholder="همه استان‌ها" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه استان‌ها</SelectItem>
                        {(provincesData?.data?.provinces ?? []).map((province) => (
                          <SelectItem key={province.id} value={province.id.toString()}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search Results */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {hasNoResults ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-4">آگهی یافت نشد</h2>
                <p className="text-muted-foreground mb-6">
                  متأسفانه هیچ آگهی مطابق با فیلترهای انتخابی شما یافت نشد
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedCategory('all');
                    setSelectedProvince('all');
                    setPage(1);
                  }}
                  className="btn-outline-warm"
                >
                  حذف فیلترها
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item: any) => (
                  <Card key={item.id} className="card-warm group cursor-pointer hover:-translate-y-2 transition-all duration-300">
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-xl">
                        {Array.isArray(item.images) && item.images[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute top-4 right-4">
                          <Badge variant={item.ad_type === 'rent' ? 'default' : 'secondary'} className="font-bold">
                            {item.ad_type === 'rent' ? 'اجاره' : 'فروش'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        {/* نمایش موقعیت در صورت اتصال lookup نام‌ها */}
                        {item.created_at && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{new Date(item.created_at).toLocaleDateString('fa-IR')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            {typeof item.price === 'number' ? new Intl.NumberFormat('fa-IR').format(item.price) : ''}
                          </span>
                          <span className="text-muted-foreground text-sm mr-2">
                            {item.ad_type === 'rent' ? 'تومان/روز' : 'تومان'}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.category_id || '—'}
                        </Badge>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0 space-x-2 space-x-reverse">
                      <Button className="flex-1 btn-secondary">
                        مشاهده جزئیات
                      </Button>
                      <Button variant="outline" size="sm" className="px-3">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            {!hasNoResults && total > 12 && (
              <div className="flex justify-center mt-8 space-x-2 space-x-reverse">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>قبلی</Button>
                <Button variant="outline" onClick={() => setPage(p => p + 1)}>بعدی</Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Search;