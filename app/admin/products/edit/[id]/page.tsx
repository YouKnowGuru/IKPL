'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/shared/Toast';
import { Package, ArrowLeft, Loader2, Save, MapPin, TestTube2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Custom Components
import RichTextEditor from '@/components/admin/RichTextEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import { cn } from '@/lib/utils';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Lookups
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Form State
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    unit: 'bags',
    status: 'active',
  });
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [nutrients, setNutrients] = useState({
    protein: '0', fat: '0', fiber: '0', moisture: '0', others: ''
  });
  
  // Stock mapping: { locationId: stockValue }
  const [stockMap, setStockMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, locRes, prodRes, invRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/locations?all=true', { cache: 'no-store' }),
          fetch(`/api/products/${id}`, { cache: 'no-store' }),
          fetch(`/api/inventory?productId=${id}`, { cache: 'no-store' })
        ]);
        
        const catData = await catRes.json();
        const locData = await locRes.json();
        const prodData = await prodRes.json();
        const invData = await invRes.json();
        
        if (catData.success) setCategories(catData.categories);
        
        if (locData.success) {
          const activeLocs = locData.locations.filter((l: any) => l.isActive);
          setLocations(activeLocs);
          
          // Map existing inventory to stock map
          const initialStock: Record<string, string> = {};
          // Initialize with empty first
          activeLocs.forEach((l: any) => { 
            const idStr = l._id?.toString();
            if (idStr) initialStock[idStr] = ''; 
          });
          // Overlay existing counts using the dedicated inventory fetch
          if (invData.success && invData.items) {
            invData.items.forEach((item: any) => {
              const locIdStr = item.locationId?._id?.toString() || item.locationId?.toString();
              if (locIdStr) {
                // If the stock is exactly 0, store it as "0" so the input reflects the DB
                initialStock[locIdStr] = item.stock?.toString() || '0';
              }
            });
          }
          console.log("Mapped initial locations:", activeLocs.map((l: any) => l._id));
          console.log("Received loc items:", invData.items?.map((i: any) => i.locationId));
          setStockMap(initialStock);
        }

        if (prodData.success) {
          const p = prodData.product;
          setForm({
            name: p.name,
            categoryId: p.categoryId?._id || p.categoryId,
            price: p.price.toString(),
            unit: p.unit || 'bags',
            status: p.status,
          });
          setDescription(p.description || '');
          setImages(p.images || []);
          if (p.nutrients) {
            setNutrients({
              protein: p.nutrients.protein || '0',
              fat: p.nutrients.fat || '0',
              fiber: p.nutrients.fiber || '0',
              moisture: p.nutrients.moisture || '0',
              others: p.nutrients.others || '',
            });
          }
        }
      } catch (err) {
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, showToast]);

  const handleStockChange = (locationId: string, val: string) => {
    setStockMap(prev => ({ ...prev, [locationId]: val }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Product name is required';
    if (!form.categoryId) return 'Please select a category';
    if (!form.price || parseFloat(form.price) < 0) return 'Please enter a valid price greater than 0';
    if (images.length === 0) return 'At least one image is required';
    if (!description || description === '<p></p>') return 'Description is required';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      showToast(error, 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update Product
      const productRes = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId,
          price: parseFloat(form.price),
          unit: form.unit,
          status: form.status,
          description,
          images,
          nutrients
        })
      });
      
      const productData = await productRes.json();
      if (!productData.success) throw new Error(productData.message || 'Failed to update product');

      // 2. Update Stock entries
      const stockEntries = Object.entries(stockMap).filter(([_, val]) => val.trim() !== '');
      
      for (const [locationId, stockValue] of stockEntries) {
        const parsedStock = parseInt(stockValue);
        if (isNaN(parsedStock) || parsedStock < 0) continue;

        await fetch('/api/inventory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             productId: id,
             locationId: locationId,
             stock: parsedStock
          })
        });
      }

      showToast('Product updated successfully!', 'success');
      router.push('/admin/products');
      router.refresh();
      
    } catch (err: any) {
      showToast(err.message || 'An error occurred during update', 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-agro-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 animate-in fade-in">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Edit Product</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Modify product details and location stock.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" className="px-6 rounded-xl font-bold">Cancel</Button>
          </Link>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="btn-glow-green text-white font-bold px-6 rounded-xl shadow-lg border-0"
          >
            {submitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Update Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── LEFT COLUMN (Main Info) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border-0 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 overflow-hidden">
             <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <Package className="h-5 w-5 text-agro-green" /> Basic Information
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-5">
               <div>
                 <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Product Name <span className="text-red-500">*</span></label>
                 <Input 
                   placeholder="Product Name" 
                   value={form.name} 
                   onChange={e => setForm({...form, name: e.target.value})} 
                   className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 focus:ring-agro-green/20"
                 />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <div>
                   <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Category <span className="text-red-500">*</span></label>
                   <select 
                     value={form.categoryId} 
                     onChange={e => setForm({...form, categoryId: e.target.value})}
                     className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none"
                   >
                     <option value="">Select a category</option>
                     {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Price (Nu.) <span className="text-red-500">*</span></label>
                   <Input 
                     type="number"
                     placeholder="0.00" 
                     value={form.price} 
                     onChange={e => setForm({...form, price: e.target.value})} 
                     className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 focus:ring-agro-green/20 font-mono"
                   />
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Unit <span className="text-red-500">*</span></label>
                   <select
                     value={form.unit}
                     onChange={e => setForm({...form, unit: e.target.value})}
                     className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-green/20"
                   >
                     <option value="bags">Bags</option>
                     <option value="kgs">Kilograms (kg)</option>
                     <option value="pcs">Pieces</option>
                     <option value="liters">Liters</option>
                   </select>
                 </div>
               </div>
             </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 overflow-hidden">
             <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <Package className="h-5 w-5 text-agro-green" /> Product Description <span className="text-red-500">*</span>
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <RichTextEditor value={description} onChange={setDescription} />
             </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 overflow-hidden">
             <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <ImageIcon className="h-5 w-5 text-agro-green" /> Product Images <span className="text-red-500">*</span>
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <ImageUploader images={images} onChange={setImages} maxFiles={5} />
             </CardContent>
          </Card>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 overflow-hidden">
             <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <CheckCircle2 className="h-5 w-5 text-agro-green" /> Visibility
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <select 
                  value={form.status} 
                  onChange={e => setForm({...form, status: e.target.value})}
                  className={cn(
                    "flex h-11 w-full items-center justify-between rounded-xl border-2 px-3 py-2 text-sm font-bold focus:outline-none transition-colors",
                    form.status === 'active' 
                      ? "border-agro-green bg-agro-green/5 text-agro-green" 
                      : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-500"
                  )}
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Draft (Hidden)</option>
                </select>
             </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 overflow-hidden">
             <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <TestTube2 className="h-5 w-5 text-agro-orange" /> Nutritional Info
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                {['protein', 'fat', 'fiber', 'moisture'].map((nutrient) => (
                  <div key={nutrient} className="flex items-center gap-3">
                    <label className="w-20 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {nutrient}
                    </label>
                    <div className="relative flex-1">
                      <Input 
                        value={(nutrients as any)[nutrient]} 
                        onChange={e => setNutrients({...nutrients, [nutrient]: e.target.value})}
                        className="h-10 rounded-lg pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">%</span>
                    </div>
                  </div>
                ))}
                <div>
                   <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Others</label>
                   <Input 
                     value={nutrients.others} 
                     onChange={e => setNutrients({...nutrients, others: e.target.value})}
                     className="h-10 rounded-lg"
                   />
                </div>
             </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 overflow-hidden">
             <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-blue-500" /> Inventory levels
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto divide-y divide-zinc-100 dark:divide-white/5 p-2">
                   {locations.map(loc => (
                     <div key={loc._id} className="flex justify-between items-center py-3 px-4 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                       <span className="text-sm font-semibold">{loc.name}</span>
                       <Input 
                         type="number" 
                         min="0"
                         placeholder="0"
                         value={stockMap[loc._id] || ''}
                         onChange={(e) => handleStockChange(loc._id, e.target.value)}
                         className="w-24 h-9 text-right font-mono"
                       />
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
