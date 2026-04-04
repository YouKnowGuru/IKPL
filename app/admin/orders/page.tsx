'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/shared/Toast';
import { MapPin, CreditCard, DollarSign, CheckCircle2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusColor } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionStatus, setActionStatus] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('unpaid');
  const [paidAmount, setPaidAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (selectedOrder) {
      setActionStatus(selectedOrder.status);
      setPaymentStatus(selectedOrder.paymentStatus || 'unpaid');
      setPaidAmount(selectedOrder.amountPaid?.toString() || '0');
      setPaymentMethod(selectedOrder.paymentMethod || 'Cash');
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?limit=100', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = (val: string) => {
    setPaymentStatus(val);
    // Auto-fill the full totalPrice when marking as fully paid
    if (val === 'paid' && selectedOrder?.totalPrice) {
      setPaidAmount(selectedOrder.totalPrice.toString());
    }
  };

  const handleUpdateStatus = async () => {
    if (!actionStatus || !selectedOrder) return;
    setIsSaving(true);
    try {
      // When fully paid, always send the full totalPrice as amountPaid
      const effectivePaidAmount =
        paymentStatus === 'paid'
          ? selectedOrder.totalPrice
          : parseFloat(paidAmount) || 0;

      const body = {
        status: actionStatus,
        paymentStatus,
        paidAmount: effectivePaidAmount,
        paymentMethod,
      };

      const res = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order updated successfully', 'success');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        showToast(data.message || 'Update failed', 'error');
      }
    } catch {
      showToast('Error updating order', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Orders &amp; Logistics</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage processing and pickup queues.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
          <Button variant="ghost" size="sm" className="rounded-lg text-xs" onClick={fetchOrders}>
            Refresh Queue
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Order ID</th>
                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Customer</th>
                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Store Pickup</th>
                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px] text-right">Value</th>
                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px] text-center">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-zinc-500">
                      #{o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{o.userId?.name || 'Unknown User'}</p>
                      <p className="text-zinc-500 text-[10px]">{o.userId?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 font-medium text-xs text-agro-green bg-agro-green/10 px-2 py-1 rounded inline-flex">
                        <MapPin className="h-3 w-3" /> {o.locationId?.district || 'Store'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-display font-bold">Nu. {o.totalPrice?.toLocaleString()}</p>
                      {o.paymentStatus === 'credit' && (
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Credit</p>
                      )}
                      {o.paymentStatus === 'paid' && (
                        <p className="text-[10px] text-agro-green font-bold uppercase tracking-tighter">Paid</p>
                      )}
                      {o.paymentStatus === 'partial' && (
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter">
                          Advance: Nu. {o.amountPaid?.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={getStatusColor(o.status)}>
                        {o.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(o)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-zinc-500">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-agro-green" />
                Manage Order #{selectedOrder._id.slice(-8).toUpperCase()}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 my-4">
              {/* Customer + Amount Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1 tracking-widest">Customer</p>
                  <p className="font-bold text-sm">{selectedOrder.userId?.name || 'Unknown'}</p>
                  <p className="text-xs text-zinc-500 truncate">{selectedOrder.userId?.email}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1 tracking-widest">Total Bill</p>
                  <p className="font-bold text-sm text-agro-green">
                    Nu. {selectedOrder.totalPrice?.toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-[9px] h-4 px-1 mt-1">
                    {(selectedOrder.paymentStatus || 'unpaid').toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2 tracking-widest">Order Items</p>
                <div className="max-h-40 overflow-y-auto pr-1 space-y-1">
                  {selectedOrder.items.map((i: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm py-2 border-b border-zinc-100 dark:border-white/5 last:border-0"
                    >
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {i.quantity} × {i.productId?.name || 'Unknown Product'}
                      </span>
                      <span className="font-bold">Nu. {(i.price * i.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-zinc-100 dark:border-white/5" />

              {/* Status + Payment dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logistics */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Logistics Status
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-agro-green/20 disabled:opacity-50"
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                    disabled={user?.role === 'store_admin' && selectedOrder.status === 'completed'}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="confirmed">Confirmed / Processing</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="completed">Completed (Picked Up)</option>
                    <option value="cancelled">Cancelled / Void</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Payment Status
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-agro-green/20"
                    value={paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Fully Paid</option>
                    <option value="credit">Credit (Billed to User)</option>
                    <option value="partial">Partial / Advance</option>
                  </select>
                </div>
              </div>

              {/* Payment Detail */}
              <div className="bg-zinc-50 dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-200 dark:border-white/5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Amount Paid */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Amount Paid
                    </label>
                    {paymentStatus === 'paid' ? (
                      <div className="flex h-10 w-full items-center rounded-xl border border-agro-green/40 bg-agro-green/5 px-3 text-sm font-bold text-agro-green">
                        Nu. {selectedOrder.totalPrice?.toLocaleString()} (Full)
                      </div>
                    ) : (
                      <input
                        type="number"
                        className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-agro-green/20"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      Payment Method
                    </label>
                    <input
                      className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-agro-green/20"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="Cash, mBoB, Bank Transfer…"
                    />
                  </div>
                </div>

                {/* Warnings & hints */}
                {actionStatus === 'completed' && paymentStatus === 'unpaid' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-[10px] text-red-500 font-bold uppercase">
                      Warning: completing without payment — use &quot;Credit&quot; if intentional.
                    </p>
                  </div>
                )}
                {actionStatus === 'completed' && (
                  <div className="p-3 bg-agro-green/10 border border-agro-green/20 rounded-lg text-agro-green text-[10px] font-bold uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Final invoice will be emailed to customer
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                disabled={isSaving}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={isSaving}
                className="rounded-xl btn-glow-green text-white font-bold h-11 px-8 min-w-[160px]"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </span>
                ) : (
                  'Save & Update Order'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
