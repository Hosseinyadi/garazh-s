import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Search as SearchIcon, SlidersHorizontal, Heart, Eye } from "lucide-react";
import apiService from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  type: 'rent' | 'sale';
  category_name: string;
  images: string[];
  location: string;
  condition: string;
  year: number;
  brand: string;
  model: string;
  view_count: number;
  created_at: string;
  is_favorite?: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const RentAds = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load listings when filters change
  useEffect(() => {
    loadListings();
  }, [searchQuery, selectedCategory, selectedProvince, currentPage]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const params: any = {
        type: 'rent',
        page: currentPage,
        limit: 12
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedProvince) params.location = selectedProvince;

      const response = await apiService.getListings(params);
      if (response.success && response.data) {
        setListings(response.data.listings);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('خطا در بارگذاری آگهی‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadListings();
  };

  const handleListingClick = (listing: Listing) => {
    navigate(`/rent/${listing.id}`);
  };

  const handleFavoriteToggle = async (listingId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید');
      return;
    }

    try {
      const response = await apiService.toggleFavorite(listingId);
      if (response.success) {
        setListings(prev => 
          prev.map(listing => 
            listing.id === listingId 
              ? { ...listing, is_favorite: response.data?.is_favorite }
              : listing
          )
        );
        toast.success(
          response.data?.is_favorite 
            ? 'به علاقه‌مندی‌ها اضافه شد' 
            : 'از علاقه‌مندی‌ها حذف شد'
        );
      }
    } catch (error) {
      toast.error('خطا در تغییر وضعیت علاقه‌مندی');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Search Header */}
        <section className="bg-gradient-surface py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                آگهی‌های اجاره
              </h1>
              <p className="text-muted-foreground text-lg">
                {listings.length} آگهی اجاره موجود است
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
                      placeholder="جستجو در آگهی‌های اجاره..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                <Button onClick={handleSearch} className="btn-primary">
                  <SearchIcon className="w-4 h-4 ml-2" />
                  جستجو
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">دسته‌بندی</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="search-select">
                        <SelectValue placeholder="همه دسته‌ها" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">همه دسته‌ها</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">موقعیت مکانی</label>
                    <Input
                      type="text"
                      placeholder="شهر یا استان..."
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  آگهی اجاره‌ای یافت نشد
                </h3>
                <p className="text-gray-500">
                  لطفاً فیلترهای جستجو را تغییر دهید
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <Card 
                      key={listing.id} 
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-warm"
                      onClick={() => handleListingClick(listing)}
                    >
                      <CardHeader className="p-0">
                        <div className="relative">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                              <span className="text-gray-400">بدون تصویر</span>
                            </div>
                          )}
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            اجاره
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 left-2 p-2 h-8 w-8"
                            onClick={(e) => handleFavoriteToggle(listing.id, e)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                listing.is_favorite 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-white'
                              }`} 
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                              {listing.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {listing.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(listing.price)}
                            </span>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Eye className="w-4 h-4 ml-1" />
                              {listing.view_count}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 ml-1" />
                              {listing.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 ml-1" />
                              {formatDate(listing.created_at)}
                            </div>
                          </div>

                          {listing.brand && (
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{listing.brand}</Badge>
                              {listing.year && (
                                <Badge variant="outline">{listing.year}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        قبلی
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        بعدی
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RentAds;