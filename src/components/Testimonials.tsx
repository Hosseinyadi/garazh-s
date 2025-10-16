import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "احمد رضایی",
      company: "شرکت راه‌سازی پارس",
      text: "از خدمات پارس اکسکاواتور بسیار راضی هستم. ماشین‌آلات با کیفیت و خدمات عالی ارائه می‌دهند.",
      rating: 5,
      avatar: "AR"
    },
    {
      id: 2,
      name: "مریم احمدی",
      company: "پیمانکاری عمران",
      text: "سرعت تحویل و کیفیت ماشین‌آلات فوق‌العاده بود. حتماً دوباره استفاده خواهم کرد.",
      rating: 5,
      avatar: "MA"
    },
    {
      id: 3,
      name: "علی کریمی",
      company: "ساختمانی آریا",
      text: "پشتیبانی ۲۴ ساعته و قیمت‌های مناسب، دقیقاً همان چیزی بود که نیاز داشتم.",
      rating: 5,
      avatar: "AK"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            نظرات مشتریان ما
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            تجربه واقعی مشتریان ما از خدمات پارس اکسکاواتور
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="card-warm relative overflow-hidden group hover:shadow-warm transition-all duration-300">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-12 h-12 text-primary" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground leading-relaxed mb-6 relative z-10">
                  "{testimonial.text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold ml-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm font-medium">۱۰۰+ مشتری راضی</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">★</span>
              </div>
              <span className="text-sm font-medium">امتیاز ۴.۹ از ۵</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm font-medium">تضمین کیفیت</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;