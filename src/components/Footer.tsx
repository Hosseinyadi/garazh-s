import { Phone, Mail, MapPin, Clock, Instagram, MessageCircle, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center ml-3">
                <span className="text-white font-bold text-xl">پ</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">پارس اکسکاواتور</h3>
                <p className="text-gray-300 text-sm">ماشین‌آلات سنگین</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              پلتفرم جامع اجاره و فروش ماشین‌آلات سنگین، بیل مکانیکی، لودر، بولدوزر و قطعات یدکی در سراسر ایران
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">اطلاعات تماس</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 ml-3" />
                <span>۰۲۱-۸۸۷۷۶۶۵۵</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 ml-3" />
                <span>info@bilflow.ir</span>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPin className="w-4 h-4 ml-3 mt-1" />
                <span>تهران، خیابان آزادی، پلاک ۱۲۳</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="w-4 h-4 ml-3" />
                <span>شنبه تا پنج‌شنبه ۸:۰۰ تا ۱۸:۰۰</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">لینک‌های مفید</h4>
            <div className="space-y-2">
              <a href="/about" className="block text-gray-300 hover:text-primary transition-colors">
                درباره ما
              </a>
              <a href="/faq" className="block text-gray-300 hover:text-primary transition-colors">
                سوالات متداول
              </a>
              <a href="/privacy" className="block text-gray-300 hover:text-primary transition-colors">
                حریم خصوصی
              </a>
              <a href="/terms" className="block text-gray-300 hover:text-primary transition-colors">
                قوانین و مقررات
              </a>
              <a href="/help" className="block text-gray-300 hover:text-primary transition-colors">
                راهنمای سایت
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">شبکه‌های اجتماعی</h4>
            <div className="flex space-x-4 space-x-reverse">
              <a
                href="#"
                className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center hover:shadow-warm transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center hover:shadow-blue transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <div className="space-y-2 pt-4">
              <p className="text-gray-300 text-sm">تلگرام: @bilflow</p>
              <p className="text-gray-300 text-sm">واتساپ: ۰۹۱۲۳۴۵۶۷۸۹</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © ۱۴۰۳ پارس اکسکاواتور. تمامی حقوق محفوظ است.
            </p>
            <p className="text-gray-400 text-sm">
              طراحی و توسعه با ❤️ برای صنعت ماشین‌آلات ایران
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;