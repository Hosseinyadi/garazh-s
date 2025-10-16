import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-hero py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              تماس با ما
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              ما آماده‌ایم تا بهترین خدمات ماشین‌آلات سنگین را به شما ارائه دهیم
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text mb-6">
                      اطلاعات تماس
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      کارشناسان ما آماده پاسخگویی به سوالات شما هستند
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Card className="card-warm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Phone className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold mb-2">تلفن تماس</h3>
                            <p className="text-muted-foreground">۰۲۱-۸۸۷۷۶۶۵۵</p>
                            <p className="text-muted-foreground">۰۹۱۲۳۴۵۶۷۸۹</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-warm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                            <Mail className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <h3 className="font-bold mb-2">ایمیل</h3>
                            <p className="text-muted-foreground">info@bilflow.ir</p>
                            <p className="text-muted-foreground">support@bilflow.ir</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-warm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-success" />
                          </div>
                          <div>
                            <h3 className="font-bold mb-2">آدرس</h3>
                            <p className="text-muted-foreground">
                              تهران، خیابان آزادی، خیابان ۱۸ تیر، پلاک ۱۲۳
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-warm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold mb-2">ساعات کاری</h3>
                            <p className="text-muted-foreground">شنبه تا پنج‌شنبه</p>
                            <p className="text-muted-foreground">۸:۰۰ تا ۱۸:۰۰</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="card-warm">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold gradient-text mb-6">
                      پیام خود را برای ما ارسال کنید
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">نام و نام خانوادگی *</label>
                          <Input
                            type="text"
                            placeholder="نام کامل خود را وارد کنید"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            className="search-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">ایمیل *</label>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            className="search-input"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">شماره تماس</label>
                          <Input
                            type="tel"
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="search-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">موضوع *</label>
                          <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                            <SelectTrigger className="search-select">
                              <SelectValue placeholder="موضوع پیام خود را انتخاب کنید" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="support">پشتیبانی فنی</SelectItem>
                              <SelectItem value="sales">فروش و اجاره</SelectItem>
                              <SelectItem value="parts">قطعات و خدمات</SelectItem>
                              <SelectItem value="partnership">همکاری</SelectItem>
                              <SelectItem value="other">سایر موارد</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">پیام شما *</label>
                        <Textarea
                          placeholder="پیام و سوالات خود را اینجا بنویسید..."
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          required
                          className="min-h-[120px] search-input"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button type="submit" className="btn-hero flex-1">
                          <Send className="w-5 h-5 ml-2" />
                          ارسال پیام
                        </Button>
                        <Button type="button" variant="outline" className="btn-outline-warm">
                          <MessageCircle className="w-5 h-5 ml-2" />
                          چت آنلاین
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;