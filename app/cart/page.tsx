'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/shared/Toast';
import { 
  Trash2, Minus, Plus, ShoppingBag, ArrowRight, 
  Store, MapPin, ShoppingCart, Heart, ShieldCheck,
  ChevronRight, ArrowLeft, Package, Sparkles
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { showToast } = useToast();
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-50 dark:bg-white/5 p-10 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 max-w-md w-full"
        >
          <div className="w-16 h-16 bg-agro-green/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-agro-green">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-3">Your Bag is Empty</h1>
          <p className="text-zinc-500 mb-8 text-base leading-relaxed">
            Invite some premium agricultural feeds to your cart.
          </p>
          <Link href="/products">
            <Button className="btn-glow-green text-white font-bold h-11 px-8 rounded-xl text-base w-full">
              Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );

  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 text-agro-green bg-agro-green/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
            <ShoppingCart className="h-3.5 w-3.5" /> Shopping Bag
          </div>
          <h1 className="text-3xl font-display font-bold">Review <span className="gradient-text">Selection</span></h1>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400">
           <span className="text-zinc-900 dark:text-white">{items.length} Items</span>
           <div className="h-1 w-1 bg-zinc-300 rounded-full" />
           <span>Estimated Total: Nu. {totalPrice.toLocaleString()}</span>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-16 items-start">
        {/* CART ITEMS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.product._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-center card-hover overflow-hidden"
              >
                {/* Visual mesh */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-agro-green/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative h-32 w-full sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 flex-shrink-0 border border-zinc-100 dark:border-white/5">

                  <Image 
                    src={item.product.image || '/images/placeholder-product.jpg'} 
                    alt={item.product.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[9px] font-bold text-agro-green uppercase tracking-[0.2em] mb-1">{item.product.category}</p>
                  <Link href={`/product/${item.product._id}`}>
                    <h3 className="text-xl font-display font-bold hover:text-agro-green transition-colors mb-1 leading-tight">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Nu. {item.product.price.toLocaleString()}</p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex items-center bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-xl h-10 w-fit px-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-7 w-7 hover:bg-white hover:shadow-sm rounded-lg"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-base">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="h-7 w-7 hover:bg-white hover:shadow-sm rounded-lg"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeFromCart(item.product._id)}
                      className="h-10 w-10 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Row Total</p>
                   <p className="text-xl font-display font-bold text-agro-green">Nu. {(item.product.price * item.quantity).toLocaleString()}</p>
                </div>


              </motion.div>
            ))}
          </AnimatePresence>
          
          <div className="pt-8">
            <Link href="/products" className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-agro-green transition-colors gap-2">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* ORDER SUMMARY PANEL */}
        <div className="lg:sticky lg:top-24">
          <Card className="rounded-3xl border-zinc-100 dark:border-white/5 shadow-xl overflow-hidden bg-white dark:bg-zinc-950">
            <div className="p-7 flex flex-col gap-6">
              <h2 className="text-xl font-display font-bold">Checkout <span className="text-agro-green">Summary</span></h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal ({items.length} items)</span>
                  <span className="font-bold text-sm">Nu. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-500">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Processing Fee</span>
                   <span className="font-bold text-xs text-agro-green">FREE</span>
                </div>
                <Separator className="bg-zinc-100 dark:bg-white/5" />
                <div className="flex justify-between items-end">
                   <div>
                     <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Grand Total</span>
                     <span className="text-3xl font-display font-bold text-zinc-900 dark:text-white leading-none">Nu. {totalPrice.toLocaleString()}</span>
                   </div>
                   <div className="text-[9px] font-bold text-agro-orange uppercase tracking-tighter mb-1 flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 fill-agro-orange" /> Tax Inc.
                   </div>
                </div>
              </div>

              <div className="p-5 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-agro-green/10 text-agro-green flex items-center justify-center">
                       <Store className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="font-bold text-[10px] uppercase tracking-widest leading-none mb-1">PickUp only</p>
                       <p className="text-[9px] text-zinc-400 font-medium">Select store in next step</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                       <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="font-bold text-[10px] uppercase tracking-widest leading-none mb-1">Secure checkout</p>
                       <p className="text-[9px] text-zinc-400 font-medium">IKPL Trusted Network</p>
                    </div>
                 </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full h-12 rounded-2xl bg-agro-green hover:bg-agro-green/90 text-white font-bold text-base shadow-lg group border-0 transition-all">
                  Proceed to Secure Checkout
                  <ChevronRight className="ml-1.5 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <div className="text-center space-y-3">
                 <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Trusted payment at pickup</p>
                 <div className="flex justify-center gap-3 grayscale opacity-30">
                    <div className="w-7 h-4 bg-zinc-200 rounded-sm" />
                    <div className="w-7 h-4 bg-zinc-200 rounded-sm" />
                    <div className="w-7 h-4 bg-zinc-200 rounded-sm" />
                 </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
