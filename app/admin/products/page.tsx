'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/shared/Toast';
import { Search, Plus, Edit, Trash2, Package, Warehouse } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]); // all inventory across all locations
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, iRes] = await Promise.all([
        fetch('/api/products?limit=200', { cache: 'no-store' }),
        // Fetch all inventory (no locationId filter) to get network-wide totals
        fetch('/api/inventory', { cache: 'no-store' }),
      ]);
      const pData = await pRes.json();
      const iData = await iRes.json();
      if (pData.success) setProducts(pData.products);
      if (iData.success) setInventory(iData.items);
    } catch {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Build a map: productId → total network stock
  const networkStockMap = new Map<string, number>();
  inventory.forEach((inv) => {
    const pid = inv.productId?._id?.toString() || inv.productId?.toString();
    if (pid) {
      networkStockMap.set(pid, (networkStockMap.get(pid) || 0) + (inv.stock || 0));
    }
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product and all its inventory?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted', 'success');
      fetchData();
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold">Global Products</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isSuperAdmin
              ? 'Manage catalog and view total network stock across all stores.'
              : 'View global product catalog.'}
          </p>
        </div>
        {isSuperAdmin && (
          <Link href="/admin/products/new">
            <Button className="btn-glow-green text-white font-bold rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">
                    Product / Category
                  </th>
                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Price</th>
                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Status</th>
                  {isSuperAdmin && (
                    <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px] text-right">
                      Network Stock
                    </th>
                  )}
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {products.map((p) => {
                  const totalStock = networkStockMap.get(p._id?.toString()) ?? 0;
                  return (
                    <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
                              {p.categoryId?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-display font-bold text-agro-green">
                        {p.price && p.price > 0 ? `Nu. ${p.price.toFixed(2)}` : <span className="text-zinc-400 font-normal text-[10px] uppercase tracking-tighter">Pickup Payment</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={p.status === 'active' ? 'default' : 'secondary'}
                          className={p.status === 'active' ? 'bg-agro-green' : ''}
                        >
                          {p.status?.toUpperCase()}
                        </Badge>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 rounded-lg px-3 py-1">
                            <Warehouse className="h-3 w-3 text-zinc-400" />
                            <span
                              className={`font-bold text-sm ${
                                totalStock === 0 ? 'text-red-500' : 'text-zinc-900 dark:text-white'
                              }`}
                            >
                              {totalStock.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-zinc-400 capitalize">{p.unit || 'bags'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/product/${p._id}`} target="_blank">
                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-agro-green">
                              <Search className="h-4 w-4" />
                            </Button>
                          </Link>
                          {isSuperAdmin && (
                            <>
                              <Link href={`/admin/products/edit/${p._id}`}>
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-agro-orange">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(p._id)}
                                className="text-zinc-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={isSuperAdmin ? 5 : 4} className="p-8 text-center text-zinc-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
