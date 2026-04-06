'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/shared/Toast';
import { 
  CheckCircle, Store, MapPin, ShoppingBag, 
  ArrowLeft, CreditCard, ShieldCheck, AlertTriangle,
  Loader2, Phone, Briefcase, Sparkles, Receipt, ChevronRight
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();

  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [locationStockInfo, setLocationStockInfo] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      showToast('Authentication required', 'error');
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations);
        if (data.locations.length > 0) setSelectedLocation(data.locations[0]._id);
      }
    } catch (err) {
      showToast('Failed to load pickup locations', 'error');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedLocation) {
      showToast('Please select a pickup store', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.product._id,
            quantity: i.quantity,
          })),
          locationId: selectedLocation,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderComplete(true);
        showToast('Order placed successfully!', 'success');
        clearCart();
        setTimeout(() => router.push('/orders'), 3000);
      } else {
        showToast(data.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      showToast('Network error during checkout', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || (!user && !orderComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-agro-green animate-spin" />
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    router.push('/cart');
    return null;
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 sm:p-14 bg-zinc-950 rounded-3xl shadow-xl relative overflow-hidden max-w-xl w-full border border-white/10"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-agro-green to-emerald-400" />
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
             <div className="w-16 h-16 bg-agro-green rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-agro-green/20">
               <CheckCircle className="h-8 w-8 text-zinc-950" />
             </div>
             <h1 className="text-3xl font-display font-bold text-white mb-4 leading-tight">Order Received!</h1>
             <p className="text-zinc-500 text-base mb-8 leading-relaxed max-w-sm mx-auto">
               Your premium agricultural order has been placed successfully for pickup.
             </p>
             <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/orders">
                   <Button className="btn-glow-green h-11 px-8 text-white font-bold rounded-xl">View My Orders</Button>
                </Link>
                <Link href="/products">
                   <Button variant="ghost" className="h-11 px-8 text-zinc-500 hover:text-white font-bold rounded-xl transition-colors">Return to Catalog</Button>
                </Link>
             </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="mb-10">
        <Link href="/cart" className="inline-flex items-center text-[10px] font-bold text-zinc-400 hover:text-agro-green transition-colors gap-1.5 mb-5 uppercase tracking-widest">
           <ArrowLeft className="h-3 w-3" /> Back to Bag
        </Link>
        <h1 className="text-3xl font-display font-bold">Secure <span className="gradient-text">Checkout</span></h1>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-20 items-start">
        
        {/* LEFT: Shipping/Pickup Details */}
        <div className="lg:col-span-2 space-y-10">
          
          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-agro-green/10 text-agro-green flex items-center justify-center font-black">1</div>
               <h2 className="text-2xl font-display font-bold">Select Pickup Store</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loadingLocations ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />) : (
                locations.map((loc) => {
                  const isSelected = selectedLocation === loc._id;
                  return (
                    <motion.div
                      key={loc._id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedLocation(loc._id)}
                      className={cn(
                        "p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group",
                        isSelected 
                          ? "border-agro-green bg-agro-green/5 shadow-md shadow-agro-green/5" 
                          : "border-zinc-100 dark:border-white/5 hover:border-zinc-200"
                      )}
                    >

                      {isSelected && (
                        <div className="absolute top-4 right-4">
                           <CheckCircle className="h-6 w-6 text-agro-green" />
                        </div>
                      )}
                      <Store className={cn("h-5 w-5 mb-3", isSelected ? "text-agro-green" : "text-zinc-300")} />
                      <h3 className="font-bold text-base mb-0.5 leading-none">{loc.name}</h3>
                      <p className="text-[9px] font-bold text-agro-orange uppercase tracking-widest mb-2">{loc.district}</p>
                      <p className="text-[10px] text-zinc-500 line-clamp-1">{loc.address}</p>
                      {isSelected && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 pt-3 border-t border-agro-green/20 flex items-center gap-1.5">
                           <div className="h-1.5 w-1.5 rounded-full bg-agro-green animate-pulse" />
                           <span className="text-[9px] font-bold uppercase tracking-widest text-agro-green">Live Stock Info</span>
                        </motion.div>
                      )}
                    </motion.div>

                  )
                })
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-agro-green/10 text-agro-green flex items-center justify-center font-black">2</div>
               <h2 className="text-2xl font-display font-bold">Payment Method</h2>
            </div>
            
            <div className="p-6 rounded-3xl bg-zinc-950 border border-white/5 relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-zinc-800 rounded-full blur-2xl opacity-20" />
               <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                     <CreditCard className="h-8 w-8 text-agro-green" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                     <h3 className="text-lg font-display font-bold text-white mb-0.5">Pay on Pickup (COD)</h3>
                     <p className="text-zinc-500 text-xs leading-relaxed">
                        Securely pay at the warehouse using Cash, mBoB, or QR.
                     </p>
                  </div>
                  <Badge className="bg-agro-green text-zinc-950 font-bold px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">Active</Badge>
               </div>
            </div>
          </section>


          <div className="p-6 bg-amber-50 dark:bg-amber-500/10 rounded-3xl border border-amber-500/20 flex gap-5 items-start">
             <div className="w-10 h-10 rounded-xl bg-amber-500 flex flex-shrink-0 items-center justify-center text-white">
                <AlertTriangle className="h-5 w-5" />
             </div>
             <div>
                <h4 className="font-bold text-amber-600 mb-0.5 text-xs leading-none uppercase tracking-wide">Pickup Policy</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                   Products must be collected within 48 hours of order confirmation.
                </p>
             </div>
          </div>

        </div>

        {/* RIGHT: Advanced Order Review */}
        <div className="lg:sticky lg:top-24">
           <Card className="rounded-3xl border-zinc-100 dark:border-white/5 shadow-xl bg-white dark:bg-zinc-950 overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-display font-bold">Review <span className="text-agro-green">Order</span></h2>
                     <Receipt className="h-5 w-5 text-zinc-300" />
                  </div>

                  
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                    {items.map((item) => (
                      <div key={item.product._id} className="flex gap-3 items-center">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-50">
                           <Image src={item.product.image || '/images/placeholder.jpg'} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-xs truncate leading-tight">{item.product.name}</p>
                           {item.product.price && item.product.price > 0 ? (
                             <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.quantity} × Nu. {item.product.price}</p>
                           ) : (
                             <p className="text-[9px] font-bold text-agro-green uppercase tracking-widest">{item.quantity} × BAGS</p>
                           )}
                        </div>
                        {item.product.price && item.product.price > 0 ? (
                          <p className="font-bold text-xs">Nu. {(item.quantity * item.product.price).toLocaleString()}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>


                  <Separator className="bg-zinc-100 dark:bg-white/5" />

                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-zinc-500">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Pickup</span>
                        <span className="text-[9px] font-bold text-agro-green truncate max-w-[120px]">
                           {locations.find(l => l._id === selectedLocation)?.name || 'Select store'}
                        </span>
                     </div>
                     <div className="flex justify-between items-end pt-1">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Total Payable</span>
                          <span className="text-3xl font-display font-bold text-zinc-900 dark:text-white leading-none">
                            {totalPrice > 0 ? `Nu. ${totalPrice.toLocaleString()}` : 'PAY ON PICKUP'}
                          </span>
                        </div>
                        <Sparkles className="h-4 w-4 text-agro-orange opacity-40" />
                     </div>
                  </div>

                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !selectedLocation}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-agro-green via-emerald-500 to-agro-green bg-[length:200%_auto] hover:animate-shimmer text-zinc-950 font-black text-sm shadow-xl hover:shadow-2xl shadow-agro-green/20 hover:shadow-agro-green/40 group border-0 mt-2 transition-all overflow-hidden relative"
                  >
                    {/* Glossy overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 w-full flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isProcessing ? (
                          <motion.div 
                            key="processing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2.5 text-zinc-950 tracking-widest"
                          >
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>PROCESSING SECURELY</span>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="complete"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 uppercase tracking-widest"
                          >
                             Complete Order 
                             <div className="w-6 h-6 rounded-full bg-zinc-950/10 flex items-center justify-center ml-1 group-hover:bg-zinc-950/20 transition-colors">
                               <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Button>


                  <div className="flex flex-col items-center text-center gap-4">
                     <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-4 py-2 bg-zinc-50 dark:bg-white/5 rounded-full">
                        <ShieldCheck className="h-3 w-3 text-agro-green" /> Bhutan Authorized Partner
                     </div>
                     <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                        By completing this order, you agree to our 2-day pickup policy and localized distribution terms.
                     </p>
                  </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}


