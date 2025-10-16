import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import apiService from "@/services/api";
import { toast } from "sonner";
import { 
  Plus, 
  Save, 
  X, 
  Upload,
  Loader2,
  ArrowLeft,
  CheckCircle
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const PostAd = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState(1);
  
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
    loadCategories();
  }, [isAuthenticated, navigate]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('خطا در بارگذاری دسته‌بندی‌ها');
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

      const response = await apiService.createListing(listingData);

      if (response.success) {
        toast.success('آگهی با موفقیت ثبت شد');
        navigate('/seller');
      } else {
        toast.error(response.message || 'خطا در ثبت آگهی');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('خطا در ثبت آگهی');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!form.title || !form.type || !form.category_id)) {
      toast.error('لطفاً فیلدهای اجباری را پر کنید');
      return;
    }
    if (step === 2 && (!form.description || !form.price || !form.location)) {
      toast.error('لطفاً فیلدهای اجباری را پر کنید');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const formatPrice = (price: string) => {
    if (!price) return '';
    return new Intl.NumberFormat('fa-IR').format(parseFloat(price)) + ' تومان';
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
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-4 h-4 ml-2" />
            بازگشت
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ثبت آگهی جدید</h1>
            <p className="text-muted-foreground">آگهی خود را در چند مرحله ثبت کنید</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                مرحله {step} از 3: {
                  step === 1 ? 'اطلاعات کلی' :
                  step === 2 ? 'جزئیات آگهی' :
                  'تایید و ثبت'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">عنوان آگهی *</label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="عنوان جذاب برای آگهی خود بنویسید"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">نوع آگهی *</label>
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
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">توضیحات *</label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="توضیحات کامل و دقیق از آگهی خود بنویسید"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">قیمت *</label>
                        <Input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="قیمت به تومان"
                          required
                        />
                        {form.price && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatPrice(form.price)}
                          </p>
                        )}
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
                        placeholder="وضعیت دستگاه (مثال: عالی، خوب، متوسط)"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">خلاصه آگهی شما:</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>عنوان:</strong> {form.title}</p>
                        <p><strong>نوع:</strong> {form.type === 'rent' ? 'اجاره' : 'فروش'}</p>
                        <p><strong>دسته‌بندی:</strong> {categories.find(c => c.id.toString() === form.category_id)?.name}</p>
                        <p><strong>قیمت:</strong> {formatPrice(form.price)}</p>
                        <p><strong>موقعیت:</strong> {form.location}</p>
                        {form.brand && <p><strong>برند:</strong> {form.brand}</p>}
                        {form.model && <p><strong>مدل:</strong> {form.model}</p>}
                        {form.year && <p><strong>سال:</strong> {form.year}</p>}
                        <p><strong>توضیحات:</strong> {form.description}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">نکات مهم:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• آگهی شما پس از تایید ادمین منتشر خواهد شد</li>
                        <li>• اطلاعات تماس شما در آگهی نمایش داده می‌شود</li>
                        <li>• می‌توانید آگهی خود را در پنل فروشنده مدیریت کنید</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ArrowLeft className="w-4 h-4 ml-2" />
                      قبلی
                    </Button>
                  )}
                  
                  {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="flex-1">
                      بعدی
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 ml-2" />
                      )}
                      ثبت آگهی
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostAd;