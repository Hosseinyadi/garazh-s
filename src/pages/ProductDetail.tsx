import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiService from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Phone, Mail, MessageSquare, Send, MapPin, Calendar, Heart, Eye, User, ArrowLeft } from "lucide-react";

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
  specifications: any;
  view_count: number;
  created_at: string;
  user_name: string;
  user_phone: string;
  is_favorite?: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    message: '',
  });

  useEffect(() => {
    if (id) {
      loadListing();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      setInquiryForm(prev => ({
        ...prev,
        customer_name: user.name || '',
        customer_phone: user.phone || '',
        customer_email: user.email || '',
      }));
    }
  }, [user]);

  const loadListing = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await apiService.getListing(id);
      if (response.success && response.data) {
        setListing(response.data.listing);
        setIsFavorite(response.data.listing.is_favorite || false);
      } else {
        toast.error('آگهی یافت نشد');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      toast.error('خطا در بارگذاری آگهی');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید');
      return;
    }

    if (!listing) return;

    try {
      const response = await apiService.toggleFavorite(listing.id);
      if (response.success) {
        setIsFavorite(response.data?.is_favorite || false);
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

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inquiryForm.customer_name || !inquiryForm.customer_phone || !inquiryForm.message) {
      toast.error('لطفا فیلدهای اجباری را پر کنید');
      return;
    }

    // For now, just show a success message
    // In a real app, you would send this to your backend
    toast.success('پیام شما با موفقیت ارسال شد');
    setInquiryForm(prev => ({ ...prev, message: '' }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">در حال بارگذاری...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">آگهی یافت نشد</h1>
          <p className="text-muted-foreground mb-6">آگهی مورد نظر شما موجود نیست.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            بازگشت
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-0">
                {listing.images && listing.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {listing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${listing.title} - تصویر ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">بدون تصویر</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="details">جزئیات</TabsTrigger>
                <TabsTrigger value="specifications">مشخصات فنی</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{listing.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Badge variant="outline">{listing.category_name}</Badge>
                      <Badge variant={listing.type === 'rent' ? 'default' : 'secondary'}>
                        {listing.type === 'rent' ? 'اجاره' : 'فروش'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{listing.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>مشخصات فنی</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listing.brand && (
                        <div>
                          <span className="font-medium">برند:</span>
                          <span className="mr-2">{listing.brand}</span>
                        </div>
                      )}
                      {listing.model && (
                        <div>
                          <span className="font-medium">مدل:</span>
                          <span className="mr-2">{listing.model}</span>
                        </div>
                      )}
                      {listing.year && (
                        <div>
                          <span className="font-medium">سال ساخت:</span>
                          <span className="mr-2">{listing.year}</span>
                        </div>
                      )}
                      {listing.condition && (
                        <div>
                          <span className="font-medium">وضعیت:</span>
                          <span className="mr-2">{listing.condition}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">موقعیت:</span>
                        <span className="mr-2">{listing.location}</span>
                      </div>
                      <div>
                        <span className="font-medium">تعداد بازدید:</span>
                        <span className="mr-2">{listing.view_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price and Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(listing.price)}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {listing.type === 'rent' ? 'روزانه' : 'قیمت کل'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        // In a real app, this would open a contact modal or redirect to contact
                        toast.info('برای تماس با فروشنده، از فرم زیر استفاده کنید');
                      }}
                    >
                      <Phone className="w-4 h-4 ml-2" />
                      تماس با فروشنده
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleFavoriteToggle}
                    >
                      <Heart className={`w-4 h-4 ml-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 ml-2" />
                  اطلاعات فروشنده
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{listing.user_name}</p>
                  <p className="text-sm text-muted-foreground">{listing.user_phone}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 ml-1" />
                    عضو از {formatDate(listing.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inquiry Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 ml-2" />
                  ارسال پیام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">نام شما</label>
                    <Input
                      value={inquiryForm.customer_name}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="نام شما"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">شماره تماس</label>
                    <Input
                      value={inquiryForm.customer_phone}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                      placeholder="شماره تماس"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">ایمیل (اختیاری)</label>
                    <Input
                      type="email"
                      value={inquiryForm.customer_email}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="ایمیل شما"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">پیام شما</label>
                    <Textarea
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="پیام خود را بنویسید..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 ml-2" />
                    ارسال پیام
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;