'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Order } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Eye, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2 text-zinc-900 dark:text-white">Order History</h1>
          <p className="text-zinc-500">Track your past purchases and active shipments.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-3xl bg-white/30 dark:bg-zinc-900/30">
          <Package className="h-20 w-20 text-zinc-300 dark:text-zinc-700 mb-6 opacity-80" />
          <h2 className="text-xl font-display font-bold mb-2">No Orders Yet</h2>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
            You haven't placed any feed orders yet. Ensure your livestock receives the best nutrition globally.
          </p>
          <Link href="/products">
            <Button className="rounded-xl bg-agro-green hover:bg-agro-green/90 font-bold px-8 shadow-lg shadow-agro-green/20">
              Shop Premium Feeds <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="rounded-2xl border-zinc-200 dark:border-white/10 overflow-hidden hover:border-agro-green/30 transition-all shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display font-bold text-lg text-zinc-900 dark:text-white">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <Badge className={getStatusColor(order.status) + ' shadow-sm'}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-zinc-400 font-medium mt-1">
                      {order.items.reduce((acc, item) => acc + item.quantity, 0)} item(s) • Pick Up
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Status</p>
                      <p className="text-xl font-display font-black text-zinc-900 dark:text-white">
                        {order.totalPrice > 0 ? `Nu. ${order.totalPrice.toLocaleString()}` : 'PICKUP'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-xl border-zinc-200 dark:border-white/10 hover:border-agro-green hover:bg-agro-green/5 hover:text-agro-green transition-all shadow-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-xl rounded-3xl border-zinc-100 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-8 shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-display font-black text-zinc-900 dark:text-white">Order Summary</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-start bg-zinc-50 dark:bg-white/5 p-5 rounded-2xl border border-zinc-100 dark:border-white/10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Receipt ID</p>
                  <p className="font-display font-bold text-lg text-zinc-900 dark:text-white">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Manifest</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/10 shadow-sm transition-all hover:border-agro-green/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-agro-green/10 rounded-xl flex items-center justify-center text-agro-green font-black shadow-inner border border-agro-green/20">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-white">
                            {(item.product?.name || item.productId?.name) || 'Unknown Product'}
                          </p>
                          {item.price && item.price > 0 ? (
                            <p className="text-xs text-zinc-500 font-medium mt-1">
                              Unit: Nu. {item.price.toLocaleString()}
                            </p>
                          ) : (
                            <p className="text-[10px] text-agro-green font-bold uppercase tracking-widest mt-1">Pay at Pickup</p>
                          )}
                        </div>
                      </div>
                      {item.price && item.price > 0 ? (
                        <p className="font-display font-bold text-base text-zinc-900 dark:text-white">
                          Nu. {(item.quantity * item.price).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/10 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Logistics</p>
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">Store Pickup</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/10 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Placed On</p>
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-agro-green/10 to-transparent border border-agro-green/20 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-agro-green uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Instructions
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  Your premium feed order is verified. Please present your Receipt ID at your designated IKPL center for immediate pickup.
                </p>
              </div>

              <div className="border-t border-zinc-200 dark:border-white/10 pt-6">
                <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-zinc-900 dark:bg-white/5 text-white shadow-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-agro-green/20 to-transparent pointer-events-none" />
                  <span className="font-bold tracking-wide relative z-10">{selectedOrder.totalPrice > 0 ? 'Grand Total' : 'Payment Status'}</span>
                  <span className="text-2xl font-display font-black text-agro-green relative z-10">
                    {selectedOrder.totalPrice > 0 ? `Nu. ${selectedOrder.totalPrice.toLocaleString()}` : 'PAY ON PICKUP'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
