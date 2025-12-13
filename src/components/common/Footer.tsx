'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Instagram, Linkedin, Code, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200">
      <div className="container-custom py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* About Section */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Image 
                src="/images/logo.png" 
                alt="Khazaana" 
                className="h-14 w-auto hover:opacity-80 transition-all duration-300" 
                width={120} 
                height={120} 
                quality={95}
              />
              <div>
                <p className="text-slate-900 text-xl font-extrabold tracking-tight">Khazaana</p>
                <p className="text-xs text-slate-600 uppercase tracking-widest font-bold mt-1">Food & Delivery</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed font-medium">
              Founded by <span className="text-orange-600 font-extrabold">Md Askin Ali</span>, owner of Cups n Crumbs Cafe. 
              We bring the best flavors of Aurangabad to your doorstep with speed and care.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/_khazaana/" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full text-slate-500 hover:text-orange-600 hover:shadow-md border border-slate-200 transition-all group" aria-label="Follow us on Instagram">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://wa.me/918695902696" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full text-slate-500 hover:text-green-600 hover:shadow-md border border-slate-200 transition-all group" aria-label="Contact us on WhatsApp">
                <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Links / Explore - Redesigned */}
          <div>
            <p className="text-slate-900 font-extrabold mb-6 tracking-wide text-sm uppercase flex items-center gap-2">
                <span className="w-8 h-1 bg-orange-500 rounded-full" aria-hidden="true"></span>
                Explore
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-3">
              {[
                { name: 'Home', href: '/', icon: '🏠' },
                { name: 'Restaurants', href: '/restaurants', icon: '🍽️' },
                { name: 'About Us', href: '/about', icon: '👋' },
                { name: 'Order History', href: '/history', icon: '📜' },
                { name: 'Terms', href: '/terms', icon: '⚖️' },
              ].map((link) => (
                <li key={link.href}>
                    <Link href={link.href} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md hover:bg-orange-50/50 transition-all group">
                        <span className="text-lg filter grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">{link.icon}</span>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-orange-700">{link.name}</span>
                    </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <p className="text-slate-900 font-extrabold mb-6 tracking-wide text-sm uppercase">Contact Us</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all group">
                    <div className="flex items-start space-x-4">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                        <span className="text-slate-900 font-bold block text-base">+91 86959 02696</span>
                        <p className="text-xs text-slate-600 mt-1 font-medium">For Delivery & New Restaurant Registration</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all group">
                    <div className="flex items-start space-x-4">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                        <a href="mailto:helpkhazaana@gmail.com" className="text-slate-900 hover:text-orange-600 transition-colors font-bold break-all text-sm">helpkhazaana@gmail.com</a>
                        <p className="text-xs text-slate-600 mt-1 font-medium">For Support & Queries</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all sm:col-span-2 group">
                    <div className="flex items-start space-x-4">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                        <a 
                            href="https://www.google.com/maps?q=24.619968473610793,88.0229246716395" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-700 hover:text-slate-900 transition-colors text-sm leading-relaxed font-bold block"
                        >
                            College More, near DNC College, Aurangabad, Suti, West Bengal 742201
                        </a>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 text-sm font-medium">&copy; {new Date().getFullYear()} Khazaana. All rights reserved.</p>
            
            {/* Developer Credit */}
            <div className="flex items-center gap-4 text-sm text-slate-600 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <span className="flex items-center gap-2 font-medium">
                <Code className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Built by</span>
              </span>
              <a 
                href="https://www.linkedin.com/in/siddharthharshraj/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-extrabold transition-colors flex items-center gap-1 group"
              >
                Siddharth Harsh Raj
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0" />
              </a>
            </div>
        </div>
      </div>
    </footer>
  );
}
