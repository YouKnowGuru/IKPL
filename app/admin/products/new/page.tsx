'use client';

import { useState, useEffect } from 'react';
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

export default function AddProductPage() {
  const router = useRouter();
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
        const [catRes, locRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/locations?all=true', { cache: 'no-store' })
        ]);
        const catData = await catRes.json();
        const locData = await locRes.json();
        
        if (catData.success) setCategories(catData.categories);
        // Only load active locations for initial stock seeding
        if (locData.success) {
          const activeLocs = locData.locations.filter((l: any) => l.isActive);
          setLocations(activeLocs);
          
          // Initialize stock map with empty strings
          const initialStock: Record<string, string> = {};
          activeLocs.forEach((l: any) => { initialStock[l._id] = ''; });
          setStockMap(initialStock);
        }
      } catch (err) {
        showToast('Failed to load initial data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const handleStockChange = (locationId: string, val: string) => {
    setStockMap(prev => ({ ...prev, [locationId]: val }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Product name is required';
    if (!form.categoryId) return 'Please select a category';
    if (form.price && parseFloat(form.price) < 0) return 'Price cannot be negative';
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
      // 1. Create Product
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId,
          ...(form.price ? { price: parseFloat(form.price) } : {}),
          unit: form.unit,
          status: form.status,
          description,
          images,
          nutrients
        })
      });
      
      const productData = await productRes.json();
      if (!productData.success) throw new Error(productData.message || 'Failed to create product');

      const newProductId = productData.product._id;

      // 2. Assign Stock sequentially
      const stockEntries = Object.entries(stockMap).filter(([_, val]) => val.trim() !== '');
      
      for (const [locationId, stockValue] of stockEntries) {
        const parsedStock = parseInt(stockValue);
        if (isNaN(parsedStock) || parsedStock < 0) continue; // Skip invalid stock

        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             productId: newProductId,
             locationId: locationId,
             stock: parsedStock
          })
        });
      }

      showToast('Product successfully created!', 'success');
      router.push('/admin/products');
      
    } catch (err: any) {
      showToast(err.message || 'An error occurred during creation', 'error');
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
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Add New Product</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Create a product and assign initial stock.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" className="px-6 rounded-xl font-bold">Discard</Button>
          </Link>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="btn-glow-green text-white font-bold px-6 rounded-xl shadow-lg border-0"
          >
            {submitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── LEFT COLUMN (Main Info) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Basic Info */}
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
                   placeholder="e.g. Premium Broiler Starter Pellets" 
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
                     className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-green/20"
                   >
                     <option value="">Select a category</option>
                     {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Price (Nu.)</label>
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

          {/* Card 2: Description (Rich Text) */}
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

          {/* Card 3: Images */}
          <Card className="border-0 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 overflow-hidden">
             <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <ImageIcon className="h-5 w-5 text-agro-green" /> Product Images <span className="text-red-500">*</span>
               </CardTitle>
               <CardDescription>Upload up to 5 high-quality images. The first image will be the cover.</CardDescription>
             </CardHeader>
             <CardContent className="p-6">
                <ImageUploader images={images} onChange={setImages} maxFiles={5} />
             </CardContent>
          </Card>

        </div>

        {/* ── RIGHT COLUMN (Sidebar Info) ── */}
        <div className="space-y-6">
          
          {/* Status */}
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
                  <option value="active" className="text-black dark:text-white font-normal">Active (Visible)</option>
                  <option value="inactive" className="text-black dark:text-white font-normal">Draft (Hidden)</option>
                </select>
             </CardContent>
          </Card>

          {/* Nutrients */}
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
                   <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Additional Vitamins / Minerals</label>
                   <Input 
                     placeholder="e.g. Calcium 2%, Phosphorus 1%" 
                     value={nutrients.others} 
                     onChange={e => setNutrients({...nutrients, others: e.target.value})}
                     className="h-10 rounded-lg"
                   />
                </div>
             </CardContent>
          </Card>

          {/* Initial Inventory Seeding */}
          <Card className="border-0 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 overflow-hidden">
             <CardHeader className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-blue-500" /> Initial Stock
               </CardTitle>
               <CardDescription className="text-xs">
                 Optionally assign starting stock for each active pickup facility.
               </CardDescription>
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
                   {locations.length === 0 && (
                     <div className="p-4 text-center text-sm text-zinc-500">
                       No active stores found.
                     </div>
                   )}
                </div>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
