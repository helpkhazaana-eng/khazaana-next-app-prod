import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Users, Award, Target, ArrowRight } from 'lucide-react';
import { restaurants } from '@/data/restaurants';
import RestaurantCard from '@/components/restaurant/RestaurantCard';

export const metadata: Metadata = {
  title: 'About Us | Khazaana',
  description: "Learn about Khazaana's mission to bring the best food experiences to your doorstep. Founded with passion for culinary excellence.",
};

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-grid-black/[0.02] pointer-events-none" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight">
            About <span className="text-orange-600">Khazaana</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Bringing the best culinary experiences to your doorstep in Aurangabad.
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Built with Passion</h2>
              <div className="space-y-6 text-slate-600 text-base leading-relaxed">
                <p>
                  Khazaana was born from a simple idea: everyone deserves access to delicious, 
                  quality food from the best restaurants in Aurangabad. What started as a passion 
                  project has grown into a platform that connects food lovers with amazing 
                  culinary experiences.
                </p>
                <p>
                  Our founder, <strong className="text-orange-600">Md. Askin Ali</strong>, 
                  with years of experience in the food industry, recognized the need for a reliable, 
                  user-friendly platform that puts customers first. Today, we partner with the finest 
                  restaurants in Aurangabad to bring you an unparalleled food ordering experience.
                </p>
                <p>
                  Every order placed through Khazaana supports local businesses and helps our 
                  community thrive. We&apos;re not just delivering food – we&apos;re delivering happiness, 
                  one meal at a time.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-lg rotate-2 hover:rotate-0 transition-transform duration-500 relative group">
                <Image src="/images/founder.jpg" alt="Founder" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-lg -rotate-2 hover:rotate-0 transition-transform duration-500 translate-y-8 relative group">
                 <Image src="/images/partners.jpg" alt="Our Team" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-lg -rotate-2 hover:rotate-0 transition-transform duration-500 relative group">
                 <Image src="/images/cc.jpeg" alt="Kitchen" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-lg rotate-2 hover:rotate-0 transition-transform duration-500 translate-y-8 relative group">
                 <Image src="/images/cc2.jpeg" alt="Dish" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Our Values</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">The core principles that drive everything we do.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
                { icon: Heart, title: 'Quality First', desc: 'We partner only with restaurants that meet our high standards for quality and taste.' },
                { icon: Users, title: 'Customer Focus', desc: 'Your satisfaction is our priority. We&apos;re here to make your experience seamless.' },
                { icon: Award, title: 'Excellence', desc: 'We strive for excellence in every aspect of our service, from ordering to delivery.' },
                { icon: Target, title: 'Community', desc: 'Supporting local businesses and bringing the community together through great food.' }
            ].map((value, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all group">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-50 rounded-xl mb-6 group-hover:scale-110 transition-transform text-orange-600">
                        <value.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{value.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        {value.desc}
                    </p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Restaurants */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
             <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900">Our Partners</h2>
                <p className="text-slate-500">Proudly partnered with the best in Aurangabad</p>
             </div>
             <Link href="/restaurants" className="btn-secondary flex items-center gap-2 text-sm">
                View All <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.slice(0, 3).map((restaurant) => (
              <div key={restaurant.id} className="h-full">
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to Order?</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Explore our partner restaurants and discover your next favorite meal delivered to your doorstep.
          </p>
          <Link href="/restaurants" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-orange-500/20 inline-flex items-center gap-2 hover:scale-105">
            <span>Browse Restaurants</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
