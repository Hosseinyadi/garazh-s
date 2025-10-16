import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import apiService from "@/services/api";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Upload,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  Mail
} from "lucide-react";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  type: 'rent' | 'sale';
  category_id: number;
  category_name: string;
  images: string[];
  location: string;
  condition: string;
  year: number;
  brand: string;
  model: string;
  specifications: any;
  is_active: boolean;
  view_count: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    type: 'rent' as 'rent' | 'sale',
    category_id: '',
    location: '',
    condition: '',
    year: '',
    brand: '',
    model: '',
    specifications: '{}',
    images: [] as string[],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user's listings
      const listingsResponse = await apiService.getListings({ 
        user_id: user?.id,
        limit: 100 
      });
      if (listingsResponse.success && listingsResponse.data) {
        setListings(listingsResponse.data.listings);
      }

      // Load categories
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.description || !form.price || !form.category_id || !form.location) {
      toast.error('لطفاً فیلدهای اجباری را پر کنید');
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        type: form.type,
        category_id: parseInt(form.category_id),
        location: form.location,
        condition: form.condition,
        year: form.year ? parseInt(form.year) : undefined,
        brand: form.brand,
        model: form.model,
        specifications: form.specifications ? JSON.parse(form.specifications) : {},
        images: form.images,
      };

      let response;
      if (editingListing) {
        response = await apiService.updateListing(editingListing.id, listingData);
      } else {
        response = await apiService.createListing(listingData);
      }

      if (response.success) {
        toast.success(editingListing ? 'آگهی به‌روزرسانی شد' : 'آگهی ایجاد شد');
        resetForm();
        loadData();
      } else {
        toast.error(response.message || 'خطا در ذخیره آگهی');
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error('خطا در ذخیره آگهی');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setForm({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      type: listing.type,
      category_id: listing.category_id.toString(),
      location: listing.location,
      condition: listing.condition || '',
      year: listing.year ? listing.year.toString() : '',
      brand: listing.brand || '',
      model: listing.model || '',
      specifications: JSON.stringify(listing.specifications || {}),
      images: listing.images || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این آگهی اطمینان دارید؟')) return;

    try {
      const response = await apiService.deleteListing(id);
      if (response.success) {
        toast.success('آگهی حذف شد');
        loadData();
      }
    } catch (error) {
      toast.error('خطا در حذف آگهی');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      price: '',
      type: 'rent',
      category_id: '',
      location: '',
      condition: '',
      year: '',
      brand: '',
      model: '',
      specifications: '{}',
      images: [],
    });
    setEditingListing(null);
    setShowForm(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (!isAuthenticated) {
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
            <h1 className="text-3xl font-bold text-gray-900">پنل فروشنده</h1>
            <p className="text-muted-foreground">مدیریت آگهی‌های شما</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 ml-2" />
            آگهی جدید
          </Button>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">آگهی‌های من</TabsTrigger>
            <TabsTrigger value="new">آگهی جدید</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : listings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">هنوز آگهی‌ای ثبت نکرده‌اید</p>
                  <Button onClick={() => setShowForm(true)}>
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
                            onClick={() => handleEdit(listing)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(listing.id)}
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

          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingListing ? 'ویرایش آگهی' : 'آگهی جدید'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">عنوان آگهی *</label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="عنوان آگهی"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">قیمت *</label>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="قیمت به تومان"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">توضیحات *</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="توضیحات کامل آگهی"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">نوع آگهی</label>
                      <Select value={form.type} onValueChange={(value) => setForm(prev => ({ ...prev, type: value as 'rent' | 'sale' }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rent">اجاره</SelectItem>
                          <SelectItem value="sale">فروش</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">دسته‌بندی *</label>
                      <Select value={form.category_id} onValueChange={(value) => setForm(prev => ({ ...prev, category_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب دسته‌بندی" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">موقعیت مکانی *</label>
                      <Input
                        value={form.location}
                        onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="شهر، استان"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">برند</label>
                      <Input
                        value={form.brand}
                        onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="برند"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">مدل</label>
                      <Input
                        value={form.model}
                        onChange={(e) => setForm(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="مدل"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">سال ساخت</label>
                      <Input
                        type="number"
                        value={form.year}
                        onChange={(e) => setForm(prev => ({ ...prev, year: e.target.value }))}
                        placeholder="سال"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">وضعیت</label>
                    <Input
                      value={form.condition}
                      onChange={(e) => setForm(prev => ({ ...prev, condition: e.target.value }))}
                      placeholder="وضعیت دستگاه"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 ml-2" />
                      )}
                      {editingListing ? 'به‌روزرسانی' : 'ایجاد آگهی'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <X className="w-4 h-4 ml-2" />
                      لغو
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;