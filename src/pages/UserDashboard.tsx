import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import apiService from "@/services/api";
import { toast } from "sonner";
import { 
  User, 
  Settings, 
  Heart, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  LogOut
} from "lucide-react";

interface UserListing {
  id: number;
  title: string;
  price: number;
  type: 'rent' | 'sale';
  category_name: string;
  images: string[];
  location: string;
  view_count: number;
  is_active: boolean;
  created_at: string;
}

interface UserFavorite {
  id: number;
  title: string;
  price: number;
  type: 'rent' | 'sale';
  images: string[];
  location: string;
  created_at: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user's listings
      const listingsResponse = await apiService.getListings({ 
        user_id: user?.id,
        limit: 50 
      });
      if (listingsResponse.success && listingsResponse.data) {
        setListings(listingsResponse.data.listings);
      }

      // Load user's favorites
      const favoritesResponse = await apiService.getFavorites();
      if (favoritesResponse.success && favoritesResponse.data) {
        setFavorites(favoritesResponse.data.favorites);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      
      if (result.success) {
        toast.success('پروفایل با موفقیت به‌روزرسانی شد');
      } else {
        toast.error(result.message || 'خطا در به‌روزرسانی پروفایل');
      }
    } catch (error) {
      toast.error('خطا در به‌روزرسانی پروفایل');
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('آیا از حذف این آگهی اطمینان دارید؟')) return;

    try {
      const response = await apiService.deleteListing(id);
      if (response.success) {
        setListings(prev => prev.filter(listing => listing.id !== id));
        toast.success('آگهی حذف شد');
      }
    } catch (error) {
      toast.error('خطا در حذف آگهی');
    }
  };

  const handleRemoveFavorite = async (listingId: number) => {
    try {
      const response = await apiService.removeFromFavorites(listingId);
      if (response.success) {
        setFavorites(prev => prev.filter(fav => fav.listing_id !== listingId));
        toast.success('از علاقه‌مندی‌ها حذف شد');
      }
    } catch (error) {
      toast.error('خطا در حذف از علاقه‌مندی‌ها');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">لطفاً وارد شوید</h1>
          <Button onClick={() => navigate('/auth')}>ورود</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">پنل کاربری</h1>
            <p className="text-muted-foreground">خوش آمدید، {user.name}</p>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut className="w-4 h-4 ml-2" />
            خروج
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">پروفایل</TabsTrigger>
            <TabsTrigger value="listings">آگهی‌های من</TabsTrigger>
            <TabsTrigger value="favorites">علاقه‌مندی‌ها</TabsTrigger>
            <TabsTrigger value="settings">تنظیمات</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 ml-2" />
                  اطلاعات شخصی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">نام</label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="نام شما"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">ایمیل</label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="ایمیل شما"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">شماره تماس</label>
                    <Input
                      value={profileForm.phone}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      شماره تماس قابل تغییر نیست
                    </p>
                  </div>

                  <Button type="submit" className="w-full md:w-auto">
                    <Settings className="w-4 h-4 ml-2" />
                    ذخیره تغییرات
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">آگهی‌های من</h2>
              <Button onClick={() => navigate('/post-ad')}>
                <Plus className="w-4 h-4 ml-2" />
                آگهی جدید
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : listings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">هنوز آگهی‌ای ثبت نکرده‌اید</p>
                  <Button onClick={() => navigate('/post-ad')}>
                    <Plus className="w-4 h-4 ml-2" />
                    ثبت اولین آگهی
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card key={listing.id} className="group">
                    <CardHeader className="p-0">
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
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground">{listing.category_name}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            {formatPrice(listing.price)}
                          </span>
                          <Badge variant={listing.is_active ? "default" : "secondary"}>
                            {listing.is_active ? "فعال" : "غیرفعال"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 ml-1" />
                            {listing.view_count}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 ml-1" />
                            {formatDate(listing.created_at)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/${listing.type}/${listing.id}`)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            مشاهده
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteListing(listing.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-xl font-semibold">علاقه‌مندی‌ها</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : favorites.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">هنوز آگهی‌ای به علاقه‌مندی‌ها اضافه نکرده‌اید</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="group">
                    <CardHeader className="p-0">
                      {favorite.images && favorite.images.length > 0 ? (
                        <img
                          src={favorite.images[0]}
                          alt={favorite.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <span className="text-gray-400">بدون تصویر</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold line-clamp-2">{favorite.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {favorite.type === 'rent' ? 'اجاره' : 'فروش'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            {formatPrice(favorite.price)}
                          </span>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 ml-1" />
                            {favorite.location}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/${favorite.type}/${favorite.listing_id}`)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            مشاهده
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFavorite(favorite.listing_id)}
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات حساب کاربری</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">تغییر رمز عبور</h3>
                    <p className="text-sm text-muted-foreground">
                      برای تغییر رمز عبور با پشتیبانی تماس بگیرید
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    غیرفعال
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">حذف حساب کاربری</h3>
                    <p className="text-sm text-muted-foreground">
                      این عمل قابل بازگشت نیست
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    حذف حساب
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
