'use client';

import { Truck, UtensilsCrossed, Percent } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { HoverEffect } from '@/components/ui/card-hover-effect';

export default function AboutSection() {
  const features = [
    {
      title: "Fast Delivery in Aurangabad",
      description: "Get your favorite food delivered quickly to College More, DNC College, and all areas of Aurangabad, Suti, West Bengal. Our delivery partners ensure your food arrives fresh and hot.",
      link: "/delivery-areas",
      icon: <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><Truck className="w-6 h-6 text-orange-600" /></div>
    },
    {
      title: "Best Restaurants Near You",
      description: "Order from top-rated restaurants including Kolkata Arsalan Biryani, Aaviora Chinese, Cups N Crumbs Cafe, and more. Enjoy authentic biryani, Chinese food, and cafe items delivered to your doorstep.",
      link: "/restaurants",
      icon: <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><UtensilsCrossed className="w-6 h-6 text-orange-600" /></div>
    },
    {
      title: "Great Offers & Discounts",
      description: "Save money with exclusive deals and combo offers. Free delivery on orders above ₹100 from select restaurants. Order online and enjoy the best food at affordable prices in Murshidabad district.",
      link: "/offers",
      icon: <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><Percent className="w-6 h-6 text-orange-600" /></div>
    },
  ];

  return (
    <>
      {/* About Founder Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

        <div className="container-custom relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6 text-slate-900 tracking-tight">About Our Founder</h2>
          <p className="text-center text-slate-600 mb-6 max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Founded by <strong className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">Md. Askin Ali</strong>, Khazaana was created with a passion for bringing the best culinary experiences to your doorstep.
          </p>
          <p className="text-center text-slate-500 mb-16 max-w-3xl mx-auto text-lg">
            Our mission is to connect food lovers with amazing restaurants in Aurangabad.
          </p>
          
          {/* 4-Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { src: "/images/founder.jpg", alt: "Founder" },
              { src: "/images/partners.jpg", alt: "Partners" },
              { src: "/images/cc.jpeg", alt: "Shop 1" },
              { src: "/images/cc2.jpeg", alt: "Shop 2" }
            ].map((img, idx) => (
              <div key={idx} className="aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white relative group transform hover:-translate-y-2 transition-transform duration-300">
                <Image 
                  src={img.src} 
                  alt={img.alt} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/about" className="px-10 py-4 rounded-full border-2 border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-base shadow-sm hover:shadow-md">
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Khazaana Section - SEO Content */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-2">Why Choose Khazaana</h2>
          <p className="text-center text-slate-500 mb-8 font-medium">Food Delivery in Aurangabad made easy</p>
          
          <HoverEffect items={features} />

          <div className="mt-8 text-center max-w-4xl mx-auto">
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Khazaana is the leading food delivery platform serving Aurangabad, Suti, and nearby areas in West Bengal. 
              Whether you&apos;re craving authentic Kolkata-style biryani, delicious Chinese cuisine, or fresh cafe items, 
              we bring the best restaurants to your fingertips. Our platform connects local food lovers with trusted 
              restaurants, ensuring quality food delivery every time. Order now and experience the convenience of 
              online food ordering in Aurangabad. Call us at 8695902696 for any assistance.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
