'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, History, Phone, ChevronRight, Heart, Shield } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    // Try to get user info from last order in local storage
    const history = localStorage.getItem('khazaana_order_history');
    if (history) {
      try {
        const orders = JSON.parse(history);
        if (orders.length > 0) {
          const lastOrder = orders[0];
          setUser({
            name: lastOrder.customer.name,
            phone: lastOrder.customer.phone
          });
        }
      } catch (e) {
        console.error('Failed to load user info', e);
      }
    }
  }, []);

  const menuItems = [
    { icon: History, label: 'Order History', href: '/history' },
    { icon: Heart, label: 'About Us', href: '/about' },
    { icon: Shield, label: 'Terms & Conditions', href: '/terms' },
    { icon: Phone, label: 'Contact Support', href: 'https://wa.me/918695902696', external: true },
  ];

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header / Profile Card */}
      <section className="bg-white pt-12 pb-8 px-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100">
        <div className="flex flex-col items-center justify-center text-center mb-2">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 border-4 border-white shadow-lg mb-4">
            <User className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Manage your account and orders
          </p>
        </div>
      </section>

      {/* Menu Options */}
      <section className="px-4 py-8 max-w-lg mx-auto">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Account</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <Link 
                key={item.label} 
                href={item.href}
                target={item.external ? '_blank' : undefined}
                className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
                }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                    <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-900">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
                Khazaana v1.0.0
            </p>
        </div>
      </section>
    </main>
  );
}
