'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/shared/Toast';
import { Search, Factory, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

export default function InventoryAdmin() {
  const [items, setItems] = useState<any[]>([]);        // raw inventory docs from API
  const [products, setProducts] = useState<any[]>([]);  // all products
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState<string>('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<string | null>(null); // productId being saved
  const { showToast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  // Load locations for super admin
  useEffect(() => {
    if (!user) return;
    if (isSuperAdmin) {
      fetch('/api/locations', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setLocations(d.locations);
            if (d.locations.length > 0) setSelectedLoc(d.locations[0]._id);
          }
        })
        .catch(() => {});
    } else if (user?.locationId) {
      // Store admin — use their own location directly
      setSelectedLoc(user.locationId);
    }
  }, [user, isSuperAdmin]);

  // Fetch inventory whenever selectedLoc changes
  useEffect(() => {
    if (!selectedLoc) return;
    fetchInventory(selectedLoc);
  }, [selectedLoc]);

  const fetchInventory = async (locId: string) => {
    setLoading(true);
    try {
      const [pRes, iRes] = await Promise.all([
        fetch('/api/products?limit=200', { cache: 'no-store' }),
        fetch(`/api/inventory?locationId=${locId}`, { cache: 'no-store' }),
      ]);
      const pData = await pRes.json();
      const iData = await iRes.json();
      if (pData.success) setProducts(pData.products);
      if (iData.success) setItems(iData.items);
    } catch {
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId: string, stockStr: string) => {
    const stock = parseInt(stockStr);
    if (isNaN(stock) || stock < 0) return;
    setSaving(productId);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, locationId: selectedLoc, stock }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Stock updated', 'success');
        fetchInventory(selectedLoc);
      } else {
        showToast(data.message || 'Update failed', 'error');
      }
    } catch {
      showToast('Error updating stock', 'error');
    } finally {
      setSaving(null);
    }
  };

  // Build inventory map: productId string → stock number
  // KEY FIX: use .toString() to safely compare ObjectId vs string
  const inventoryMap = new Map<string, number>();
  items.forEach((inv) => {
    const pid = inv.productId?._id?.toString() || inv.productId?.toString();
    if (pid) inventoryMap.set(pid, inv.stock ?? 0);
  });

  const merged = products
    .map((p) => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      status: p.status,
      unit: p.unit || 'bags',
      stock: inventoryMap.get(p._id?.toString()) ?? 0,
    }))
    .filter((item) =>
      search.trim() === '' || item.name.toLowerCase().includes(search.toLowerCase())
    );

  const totalStock = merged.reduce((sum, i) => sum + i.stock, 0);

  if (!user) return null;

  const selectedLocName = locations.find((l) => l._id === selectedLoc)?.name;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            {isSuperAdmin ? 'Store Inventory' : 'My Store Inventory'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isSuperAdmin
              ? 'View and update stock levels per store location.'
              : `Stock levels at your assigned store.`}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="w-full md:w-72">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">
              Select Store
            </label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm"
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
            >
              <option value="" disabled>Select a location</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} — {l.district}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedLoc ? (
        <div className="p-12 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <Factory className="h-12 w-12 mx-auto mb-4 opacity-20" />
          Please select a location to view inventory.
        </div>
      ) : loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5 flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                className="pl-9 bg-white dark:bg-zinc-900"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-agro-green/10 border border-agro-green/20 rounded-xl px-4 py-2 text-agro-green text-sm font-bold flex-shrink-0">
              Total Stock: {totalStock.toLocaleString()} units
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">
                  Product Name
                </th>
                <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">
                  Price
                </th>
                <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px] text-right">
                  Stock Units
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {merged.map((item) => (
                <tr key={item.productId} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold">{item.name}</p>
                    {item.status === 'inactive' && (
                      <span className="text-[10px] text-red-500 font-bold">Unlisted globally</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">
                    {item.price != null ? `Nu. ${item.price.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isSuperAdmin ? (
                        <>
                          <Input
                            type="number"
                            defaultValue={item.stock}
                            min="0"
                            className="h-9 w-24 text-right font-bold text-agro-green"
                            onBlur={(e) => handleUpdateStock(item.productId, e.target.value)}
                          />
                          {saving === item.productId && (
                            <svg className="animate-spin h-4 w-4 text-agro-green flex-shrink-0" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          )}
                        </>
                      ) : (
                        <div className="h-9 flex items-center justify-end pr-3 font-bold text-agro-green text-lg gap-2">
                          {item.stock} <span className="text-[10px] uppercase text-zinc-400 mt-1">{item.unit}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {merged.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-zinc-500">
                    No products match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
