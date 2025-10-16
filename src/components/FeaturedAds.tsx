import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Phone, Clock, Star, ArrowLeft } from "lucide-react";
import { featuredMachinery } from "@/data/machinery";

const FeaturedAds = () => {

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            ⭐ آگهی‌های ویژه
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            بهترین ماشین‌آلات در دسترس
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            انتخاب شده از بین بهترین آگهی‌های اجاره و فروش ماشین‌آلات سنگین
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredMachinery.map((item) => (
            <Card key={item.id} className="card-featured group cursor-pointer slide-up hover:-translate-y-2 transition-all duration-300">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant={item.type === 'rent' ? 'default' : 'secondary'} className="font-bold">
                      {item.type === 'rent' ? 'اجاره' : 'فروش'}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="bg-white/90 text-primary border-primary">
                      <Star className="w-3 h-3 ml-1 fill-current" />
                      ویژه
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 ml-2" />
                    <span>{item.location.city}، {item.location.province}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{item.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {item.price}
                    </span>
                    <span className="text-muted-foreground text-sm mr-2">
                      {item.type === 'rent' ? 'تومان/روز' : 'تومان'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 space-x-2 space-x-reverse">
                <Button className="flex-1 btn-secondary">
                  مشاهده جزئیات
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <Phone className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="btn-outline-warm">
            مشاهده همه آگهی‌ها
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAds;