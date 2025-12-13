import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Shield, AlertTriangle, Users, Database, Phone, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Khazaana',
  description: "Read Khazaana's terms and conditions, privacy policy, and understand how we handle your data and our service policies.",
};

export default function TermsPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-orange-50 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="container-custom relative z-10 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900">Terms & Conditions</h1>
          <p className="text-slate-500 font-medium">Last updated: November 2025</p>
        </div>
      </section>

      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">1</span>
              Introduction
            </h2>
            <div className="bg-white rounded-2xl p-6 md:p-8 space-y-4 text-slate-600 border border-slate-100 shadow-sm">
              <p>
                Welcome to <strong className="text-orange-600">Khazaana</strong>. By accessing or using our platform, 
                you agree to be bound by these Terms and Conditions. Please read them carefully before placing 
                any order.
              </p>
              <p>
                Khazaana is a food ordering platform that connects customers with local restaurants in 
                Aurangabad, West Bengal. We facilitate the ordering process and delivery coordination between 
                you and our partner restaurants.
              </p>
            </div>
          </section>

          {/* Platform Role & Restaurant Responsibility */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">2</span>
              Platform Role & Restaurant Responsibility
            </h2>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 md:p-8 space-y-4 text-slate-700">
              <p className="font-bold text-orange-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Important Disclaimer
              </p>
              <p>
                <strong>Khazaana is solely a technology platform</strong> that empowers local restaurants 
                to reach customers digitally. We provide the ordering interface, payment facilitation, 
                and delivery coordination services.
              </p>
              <p>
                <strong className="text-red-600">The quality, taste, hygiene, and safety of food is entirely 
                the responsibility of the respective restaurant.</strong> Each restaurant operates independently 
                and maintains its own standards for food preparation, handling, and packaging.
              </p>
              <p>
                Khazaana does not prepare, cook, or handle any food items. We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 marker:text-orange-500">
                <li>Quality or taste of food prepared by restaurants</li>
                <li>Hygiene standards maintained by restaurants</li>
                <li>Accuracy of menu descriptions or allergen information</li>
                <li>Food safety or any health-related issues arising from consumption</li>
                <li>Portion sizes or presentation of food items</li>
              </ul>
              <p className="font-medium text-slate-900 mt-4 bg-white p-4 rounded-xl border border-orange-100">
                By placing an order, you acknowledge that you are purchasing food directly from the 
                restaurant, and Khazaana acts only as an intermediary platform.
              </p>
            </div>
          </section>

          {/* Data Collection & Usage */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">3</span>
              Data Collection & Privacy
            </h2>
            <div className="bg-white rounded-2xl p-6 md:p-8 space-y-4 text-slate-600 border border-slate-100 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <p className="font-bold text-slate-900 mb-3">We collect:</p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div><strong>Personal Information:</strong> Name, phone, email</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div><strong>Delivery Information:</strong> Address, GPS coordinates</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div><strong>Order History:</strong> Items, amounts, times</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div><strong>Device Info:</strong> Browser, device type</li>
                    </ul>
                </div>
                <div>
                    <p className="font-bold text-slate-900 mb-3">How we use it:</p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>To process and deliver orders</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>To update status via WhatsApp</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>To improve user experience</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>To maintain support records</li>
                    </ul>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100 mt-4">
                <p className="font-bold text-slate-900 mb-3">Data Sharing:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 marker:text-slate-400">
                    <li>Your order details are shared with the respective restaurant for preparation</li>
                    <li>Delivery address is shared with delivery personnel</li>
                    <li>We do not sell your personal data to third parties</li>
                    <li>Data may be shared with authorities if required by law</li>
                </ul>
              </div>

              <p className="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg flex items-center gap-2">
                <Database className="w-4 h-4" />
                Your data is stored securely. You can request deletion by contacting us.
              </p>
            </div>
          </section>

          {/* Order Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">4</span>
              Order Terms & Conditions
            </h2>
            <div className="bg-white rounded-2xl p-6 md:p-8 space-y-6 text-slate-600 border border-slate-100 shadow-sm">
              <div>
                  <p className="font-bold text-slate-900 mb-1">Ordering Hours</p>
                  <p className="text-sm">Orders are accepted between <strong>9:00 AM to 9:00 PM</strong> (IST) daily. Orders placed outside these hours will not be processed.</p>
              </div>

              <div>
                  <p className="font-bold text-slate-900 mb-1">Payment</p>
                  <p className="text-sm">Currently, we accept <strong>Cash on Delivery (COD)</strong> only. Payment is to be made directly to the delivery person upon receiving your order.</p>
              </div>

              <div>
                  <p className="font-bold text-slate-900 mb-1">Delivery</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm marker:text-slate-400">
                    <li>Standard delivery charge: ₹30</li>
                    <li>Free delivery for Cups N Crumbs orders above ₹100</li>
                    <li>Free delivery for Bandhu Hotel orders above ₹350</li>
                    <li>Delivery times are estimates and may vary based on demand and traffic</li>
                  </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <p className="font-bold text-red-800 text-sm mb-1">Cancellation</p>
                      <p className="text-xs text-red-700">Orders can only be cancelled before preparation starts. Contact via WhatsApp immediately.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="font-bold text-blue-800 text-sm mb-1">Refunds</p>
                      <p className="text-xs text-blue-700">Processed case-by-case for valid complaints. Contact within 30 mins of delivery.</p>
                  </div>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">5</span>
              User Responsibilities
            </h2>
            <div className="bg-white rounded-2xl p-6 md:p-8 space-y-4 text-slate-600 border border-slate-100 shadow-sm">
              <p>By using Khazaana, you agree to:</p>
              <ul className="grid md:grid-cols-2 gap-3">
                <li className="flex gap-2 items-start text-sm"><Shield className="w-4 h-4 mt-0.5 text-slate-400" /> Provide accurate delivery info</li>
                <li className="flex gap-2 items-start text-sm"><Shield className="w-4 h-4 mt-0.5 text-slate-400" /> Be available at address</li>
                <li className="flex gap-2 items-start text-sm"><Shield className="w-4 h-4 mt-0.5 text-slate-400" /> Pay upon delivery</li>
                <li className="flex gap-2 items-start text-sm"><Shield className="w-4 h-4 mt-0.5 text-slate-400" /> No fraudulent orders</li>
                <li className="flex gap-2 items-start text-sm"><Shield className="w-4 h-4 mt-0.5 text-slate-400" /> Inform about allergies</li>
                <li className="flex gap-2 items-start text-sm"><Shield className="w-4 h-4 mt-0.5 text-slate-400" /> Respect delivery partners</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">6</span>
              Contact Us
            </h2>
            <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 space-y-4">
              <p className="text-slate-400">For any questions, concerns, or complaints regarding these terms or our services:</p>
              <div className="grid md:grid-cols-3 gap-6 pt-4">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">WhatsApp</p>
                    <a href="https://wa.me/918695902696" className="text-orange-400 hover:text-white transition-colors font-mono">+91 86959 02696</a>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Email</p>
                    <a href="mailto:helpkhazaana@gmail.com" className="text-orange-400 hover:text-white transition-colors">helpkhazaana@gmail.com</a>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Address</p>
                    <p className="text-slate-300">Aurangabad, West Bengal</p>
                </div>
              </div>
            </div>
          </section>

          {/* Agreement Footer */}
          <section className="text-center pt-8 border-t border-slate-200">
            <p className="text-slate-600 mb-6 text-sm">
              By placing an order on Khazaana, you confirm that you have read, understood, and 
              agree to these Terms & Conditions.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </section>

        </div>
      </div>
    </main>
  );
}
