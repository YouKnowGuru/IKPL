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
import { Eye, Package, Store } from 'lucide-react';

export default function OrdersPage() {
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">My Pickups</h1>
        <p className="text-muted-foreground">
          Track and manage your store pickups
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-3xl">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h2 className="text-xl font-display font-bold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              You haven't placed any orders yet. Start shopping to see your pickups here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order._id} className="rounded-3xl border-zinc-100 dark:border-white/5 overflow-hidden hover:border-agro-green/30 transition-all card-hover shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display font-bold text-lg">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <Store className="h-3 w-3 text-agro-green" /> 
                       <p className="text-sm text-agro-green font-medium">
                         {order.locationId?.name} ({order.locationId?.district})
                       </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Status</p>
                      <p className="text-xl font-display font-bold text-agro-green">
                        {order.totalPrice > 0 ? `Nu. ${order.totalPrice.toFixed(2)}` : 'PICKUP'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-xl border-zinc-200 dark:border-white/10 hover:border-agro-green hover:text-agro-green"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
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
        <DialogContent className="max-w-xl rounded-[2rem] border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950 p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-display font-bold">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-start bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Order #</p>
                  <p className="font-display font-bold text-lg">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Items Purchased</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-agro-green/10 rounded-xl flex items-center justify-center text-agro-green font-bold text-xs">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-sm">{(item.productId || item.product)?.name}</p>
                          {item.price > 0 ? (
                            <p className="text-[10px] text-zinc-400 font-medium">Unit Price: Nu. {item.price.toFixed(2)}</p>
                          ) : (
                            <p className="text-[10px] text-agro-green font-bold uppercase tracking-widest">Pay at Pickup</p>
                          )}
                        </div>
                      </div>
                      {item.price > 0 ? (
                        <p className="font-display font-bold text-sm text-agro-green">
                          Nu. {(item.quantity * item.price).toFixed(2)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Pickup Store</p>
                  <p className="font-bold text-sm text-agro-green">{(selectedOrder as any).locationId?.name}</p>
                  <p className="text-xs text-zinc-500">{(selectedOrder as any).locationId?.district}</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Order Date</p>
                  <p className="font-bold text-sm">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="bg-agro-green/5 border border-agro-green/15 rounded-2xl p-5 mt-4">
                <p className="text-xs font-bold text-agro-green uppercase tracking-widest mb-2 text-[10px]">Pickup Instructions</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Your order is being prepared for pickup at {(selectedOrder as any).locationId?.name}. Please present your Order ID when you arrive.
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center bg-agro-green/5 p-4 rounded-xl">
                  <span className="font-bold">{selectedOrder.totalPrice > 0 ? 'Total Amount' : 'Payment Status'}</span>
                  <span className="text-2xl font-display font-bold text-agro-green">
                    {selectedOrder.totalPrice > 0 ? `Nu. ${selectedOrder.totalPrice.toFixed(2)}` : 'PAY AT PICKUP'}
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
