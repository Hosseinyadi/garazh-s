import { Search, FileText, Handshake, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "جستجو کنید",
      description: "ماشین‌آلات مورد نیاز خود را با فیلترهای هوشمند پیدا کنید"
    },
    {
      icon: FileText,
      title: "مشخصات بررسی کنید",
      description: "جزئیات کامل، قیمت و شرایط اجاره یا فروش را مطالعه کنید"
    },
    {
      icon: Handshake,
      title: "تماس بگیرید",
      description: "مستقیماً با صاحب آگهی تماس گرفته و قرارداد ببندید"
    },
    {
      icon: CheckCircle,
      title: "استفاده کنید",
      description: "ماشین‌آلات را تحویل گرفته و پروژه خود را شروع کنید"
    }
  ];

  return (
    <section className="py-16 bg-gradient-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            چگونه کار می‌کند؟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            در چند قدم ساده به ماشین‌آلات مورد نیاز خود دسترسی پیدا کنید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                
                {/* Icon Container */}
                <div className="w-20 h-20 bg-white rounded-2xl shadow-warm flex items-center justify-center mx-auto group-hover:shadow-blue transition-all duration-300 group-hover:-translate-y-2">
                  <step.icon className="w-10 h-10 text-primary group-hover:text-secondary transition-colors duration-300" />
                </div>

                {/* Connector Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 transform translate-x-10"></div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;