'use client';

import { Flame, Clock, Truck, ShoppingCart, ArrowRight, Tag, UtensilsCrossed } from 'lucide-react';
import type { ExclusiveOffer } from '@/data/offers';
import { isExpiringSoon, getRemainingDays } from '@/data/offers';
import Link from 'next/link';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { addToCart, getCart, clearCart, createEmptyCart } from '@/lib/cart';
import type { MenuItem } from '@/types';

interface OffersSectionProps {
  offers: ExclusiveOffer[];
}

export default function OffersSection({ offers }: OffersSectionProps) {
  const router = useRouter();

  if (offers.length === 0) return null;

  const handleOrderNow = (offer: ExclusiveOffer) => {
    // Construct a menu item from the offer
    const item: MenuItem = {
        itemName: offer.dishName,
        price: offer.offerPrice || 0,
        category: 'Exclusive Offer',
        vegNonVeg: offer.vegNonVeg || 'Veg',
        description: offer.description
    };

    // Try to add to cart
    const currentCart = getCart();
    const { error } = addToCart(currentCart, item, offer.restaurantId, offer.restaurantName, 1, offers);
    
    if (error) {
        if (confirm(`${error} Do you want to clear your cart and add this offer?`)) {
            clearCart();
            addToCart(createEmptyCart(), item, offer.restaurantId, offer.restaurantName, 1, offers);
            router.push('/checkout');
        }
    } else {
        router.push('/checkout');
    }
  };

  return (
    <section id="offers-section" className="py-16 bg-slate-50">
      <div className="container-custom">
        <m.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
            <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
                        <Flame className="w-6 h-6 fill-current" />
                    </span>
                    Exclusive Offers
                </h2>
                <p className="text-sm text-slate-600 mt-2 font-medium">Limited time deals from top restaurants</p>
            </div>
            <Link href="/restaurants" className="hidden md:flex items-center text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 hover:shadow-md">
                View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
        </m.div>

        {/* Offers Carousel - Mobile (Horizontal Scroll) & Desktop Grid */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {offers.map((offer, idx) => {
              const expiringSoon = isExpiringSoon(offer.endDate);
              const remainingDays = getRemainingDays(offer.endDate);
              const isCombo = offer.offerType === 'combo';
              
              return (
                <m.div 
                  key={offer.id} 
                  className="snap-center shrink-0 w-[320px] md:w-auto h-full flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                   <div className="group relative h-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      
                      {/* Card Header/Banner */}
                      <div className={`relative h-40 p-6 overflow-hidden bg-gradient-to-br ${isCombo ? 'from-orange-500 to-red-600' : 'from-blue-500 to-indigo-600'}`}>
                         {/* Modern Pattern Overlay */}
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                         <div className="absolute -bottom-6 -right-6 p-3 opacity-20 transform rotate-12">
                            {isCombo ? <UtensilsCrossed className="w-32 h-32 text-white" /> : <Truck className="w-32 h-32 text-white" />}
                         </div>
                         
                         <div className="relative z-10 flex flex-col h-full justify-between">
                             <div className="flex justify-between items-start">
                                 <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20 shadow-sm">
                                     {offer.restaurantName}
                                 </span>
                                 {offer.discountPercent && offer.discountPercent > 0 && (
                                    <span className="bg-white text-red-600 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1">
                                        <Flame className="w-3.5 h-3.5 fill-current" />
                                        {offer.discountPercent}% OFF
                                    </span>
                                 )}
                             </div>
                             
                             <h3 className="text-white font-extrabold text-2xl leading-tight line-clamp-2 drop-shadow-md">
                                {offer.dishName}
                             </h3>
                         </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex flex-col flex-grow bg-white">
                          <p className="text-sm text-slate-600 line-clamp-2 mb-6 h-10 leading-relaxed font-medium">{offer.description}</p>
                          
                          <div className="flex items-end justify-between mt-auto">
                              <div>
                                  {isCombo ? (
                                    <>
                                        <div className="text-xs text-slate-600 line-through font-medium mb-0.5">₹{offer.originalPrice}</div>
                                        <div className="text-3xl font-extrabold text-slate-900">₹{offer.offerPrice}</div>
                                    </>
                                  ) : (
                                    <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                        Above ₹{offer.minOrderValue}
                                    </div>
                                  )}
                              </div>
                              
                              {isCombo ? (
                                  <button 
                                    onClick={() => handleOrderNow(offer)}
                                    className="bg-orange-600 text-white px-5 py-3 rounded-2xl hover:bg-orange-700 hover:scale-105 transition-all shadow-lg shadow-orange-500/30 active:scale-95 flex items-center justify-center font-bold text-sm gap-2"
                                  >
                                      Order Now <ArrowRight className="w-4 h-4" />
                                  </button>
                              ) : (
                                  <Link 
                                    href={`/restaurants/${offer.restaurantId}`}
                                    className="bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center font-bold text-sm gap-2"
                                  >
                                      View Menu <ArrowRight className="w-4 h-4" />
                                  </Link>
                              )}
                          </div>
                          
                          {/* Footer Info */}
                          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                             <div className="flex items-center gap-1.5">
                                {isCombo && (
                                    <>
                                        <div className="p-1 bg-green-50 rounded text-green-700"><Truck className="w-3 h-3" /></div>
                                        <span className={offer.deliveryCharge === 0 ? "text-green-700 font-bold" : ""}>
                                            {offer.deliveryCharge === 0 ? 'Free Delivery' : `₹${offer.deliveryCharge} Delivery`}
                                        </span>
                                    </>
                                )}
                                {!isCombo && (
                                     <span className="text-blue-600 font-bold flex items-center gap-1">
                                        <Truck className="w-3 h-3" /> Free Delivery
                                     </span>
                                )}
                             </div>
                             {expiringSoon && (
                                <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                                    <Clock className="w-3 h-3" />
                                    <span>{remainingDays}d left</span>
                                </div>
                             )}
                          </div>
                      </div>
                   </div>
                </m.div>
              );
            })}
            
            {/* View All Card (Mobile Only) */}
            <div className="md:hidden snap-center shrink-0 w-[150px] flex items-center justify-center">
                <Link href="/restaurants" className="flex flex-col items-center gap-3 text-slate-400 hover:text-orange-600 transition-colors group">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-orange-500 group-hover:bg-orange-50 transition-all">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold">View All</span>
                </Link>
            </div>
        </div>
      </div>
    </section>
  );
}
