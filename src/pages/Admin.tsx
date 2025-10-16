import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiService from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Eye,
  Users,
  FileText,
  TrendingUp,
  Loader2,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Heart,
  MapPin,
  Calendar
} from "lucide-react";

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
  user_name: string;
  user_phone: string;
  is_active: boolean;
  is_featured: boolean;
  total_views: number;
}

interface User {
  id: number;
  phone: string;
  name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  listings_count: number;
  favorites_count: number;
}

interface DashboardStats {
  total_listings: number;
  active_listings: number;
  total_users: number;
  total_views: number;
}

const Admin = () => {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'listings') {
      loadListings();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, searchQuery, statusFilter, currentPage]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAdminDashboard();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('خطا در بارگذاری داشبورد');
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 20
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter === 'active') params.status = 'active';
      if (statusFilter === 'inactive') params.status = 'inactive';

      const response = await apiService.getAdminListings(params);
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

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAdminUsers({
        page: currentPage,
        limit: 20
      });
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('خطا در بارگذاری کاربران');
    } finally {
      setLoading(false);
    }
  };

  const handleListingStatusChange = async (id: number, isActive: boolean) => {
    try {
      const response = await apiService.updateListingStatus(id, { is_active: isActive });
      if (response.success) {
        setListings(prev => 
          prev.map(listing => 
            listing.id === id 
              ? { ...listing, is_active: isActive }
              : listing
          )
        );
        toast.success('وضعیت آگهی به‌روزرسانی شد');
      }
    } catch (error) {
      toast.error('خطا در تغییر وضعیت آگهی');
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('آیا از حذف این آگهی اطمینان دارید؟')) return;

    try {
      const response = await apiService.deleteAdminListing(id);
      if (response.success) {
        setListings(prev => prev.filter(listing => listing.id !== id));
        toast.success('آگهی حذف شد');
      }
    } catch (error) {
      toast.error('خطا در حذف آگهی');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">دسترسی غیرمجاز</h1>
          <p className="text-muted-foreground mb-4">شما مجاز به دسترسی به این صفحه نیستید</p>
          <Button onClick={() => logout()}>خروج</Button>
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
            <h1 className="text-3xl font-bold text-gray-900">پنل مدیریت گاراژ سنگین</h1>
            <p className="text-muted-foreground">خوش آمدید، {admin.username}</p>
          </div>
          <Button onClick={logout} variant="outline">
            خروج
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">داشبورد</TabsTrigger>
            <TabsTrigger value="listings">آگهی‌ها</TabsTrigger>
            <TabsTrigger value="users">کاربران</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : stats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div className="mr-4">
                          <p className="text-sm font-medium text-gray-600">کل آگهی‌ها</p>
                          <p className="text-2xl font-bold">{stats.total_listings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div className="mr-4">
                          <p className="text-sm font-medium text-gray-600">آگهی‌های فعال</p>
                          <p className="text-2xl font-bold">{stats.active_listings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-purple-500" />
                        <div className="mr-4">
                          <p className="text-sm font-medium text-gray-600">کل کاربران</p>
                          <p className="text-2xl font-bold">{stats.total_users}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Eye className="h-8 w-8 text-orange-500" />
                        <div className="mr-4">
                          <p className="text-sm font-medium text-gray-600">کل بازدیدها</p>
                          <p className="text-2xl font-bold">{stats.total_views}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>آخرین آگهی‌ها</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {listings.slice(0, 5).map((listing) => (
                        <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{listing.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {listing.user_name} • {formatDate(listing.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={listing.is_active ? "default" : "secondary"}>
                              {listing.is_active ? "فعال" : "غیرفعال"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {listing.view_count} بازدید
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="جستجو در آگهی‌ها..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      <SelectItem value="active">فعال</SelectItem>
                      <SelectItem value="inactive">غیرفعال</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={loadListings} variant="outline">
                    <RefreshCw className="w-4 h-4 ml-2" />
                    بروزرسانی
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Listings Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-right p-4">عنوان</th>
                          <th className="text-right p-4">فروشنده</th>
                          <th className="text-right p-4">قیمت</th>
                          <th className="text-right p-4">بازدید</th>
                          <th className="text-right p-4">وضعیت</th>
                          <th className="text-right p-4">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((listing) => (
                          <tr key={listing.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <h4 className="font-medium">{listing.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {listing.category_name} • {listing.type === 'rent' ? 'اجاره' : 'فروش'}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{listing.user_name}</p>
                                <p className="text-sm text-muted-foreground">{listing.user_phone}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{formatPrice(listing.price)}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 ml-1" />
                                {listing.view_count}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant={listing.is_active ? "default" : "secondary"}>
                                {listing.is_active ? "فعال" : "غیرفعال"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleListingStatusChange(listing.id, !listing.is_active)}
                                >
                                  {listing.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteListing(listing.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-right p-4">نام</th>
                          <th className="text-right p-4">شماره تماس</th>
                          <th className="text-right p-4">ایمیل</th>
                          <th className="text-right p-4">آگهی‌ها</th>
                          <th className="text-right p-4">تاریخ عضویت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <Badge variant={user.is_verified ? "default" : "secondary"}>
                                  {user.is_verified ? "تایید شده" : "تایید نشده"}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-4">{user.phone}</td>
                            <td className="p-4">{user.email || '-'}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <span>{user.listings_count} آگهی</span>
                                <span>{user.favorites_count} علاقه‌مندی</span>
                              </div>
                            </td>
                            <td className="p-4">{formatDate(user.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;