import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, TrendingUp, Users } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            ماشین‌آلات و تجهیزات
            <span className="block text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
              حرفه‌ای
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
            اجاره • فروش • قطعات یدکی • خدمات تخصصی
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button className="btn-hero text-lg px-8 py-4">
              مشاهده اجاره‌ها
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
            <Button variant="outline" size="lg" className="btn-outline-warm text-lg px-8 py-4">
              <Play className="w-5 h-5 ml-2" />
              ثبت آگهی رایگان
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">۲۵۰+</div>
              <div className="text-gray-300">ماشین‌آلات فعال</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">۱۰۰+</div>
              <div className="text-gray-300">مشتری راضی</div>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <div className="text-3xl md:text-4xl font-bold text-success mb-2">۱۵+</div>
              <div className="text-gray-300">سال تجربه</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white border border-white/20">
          <div className="flex items-center space-x-3 space-x-reverse">
            <TrendingUp className="w-6 h-6 text-primary" />
            <div>
              <div className="font-bold">رشد ۳۰٪</div>
              <div className="text-sm text-gray-300">اجاره‌های ماهانه</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white border border-white/20">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Users className="w-6 h-6 text-secondary" />
            <div>
              <div className="font-bold">پشتیبانی ۲۴/۷</div>
              <div className="text-sm text-gray-300">خدمات مشتریان</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;