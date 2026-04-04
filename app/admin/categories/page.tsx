'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/shared/Toast';
import { Tags, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      showToast('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category created', 'success');
        setIsAdding(false);
        setName('');
        fetchCategories();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error creating category', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      showToast('Deleted successfully', 'success');
      fetchCategories();
    } catch (e) {
      showToast('Error deleting', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
       <div className="flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-display font-bold">Categories</h1>
             <p className="text-zinc-500 text-sm mt-1">Manage product categories.</p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} className="btn-glow-green text-white font-bold rounded-xl gap-2">
             <Plus className="h-4 w-4" /> Add Category
          </Button>
       </div>

       {isAdding && (
          <Card className="border-agro-green/20 shadow-lg shadow-agro-green/5">
             <CardContent className="p-6 flex gap-4">
                <Input placeholder="Category Name (e.g. Poultry Feed)" value={name} onChange={e => setName(e.target.value)} className="flex-1" />
                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Save</Button>
             </CardContent>
          </Card>
       )}

       {loading ? (
          <div className="space-y-3">
             <Skeleton className="h-16 w-full rounded-xl" />
             <Skeleton className="h-16 w-full rounded-xl" />
             <Skeleton className="h-16 w-full rounded-xl" />
          </div>
       ) : (
          <div className="grid grid-cols-1 gap-3">
             {categories.map((cat) => (
                <div key={cat._id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-xl shadow-sm hover:border-agro-green/30 transition-all flex justify-between items-center">
                   <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-500 flex items-center justify-center">
                         <Tags className="h-5 w-5" />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg">{cat.name}</h3>
                         <p className="text-[10px] text-zinc-400 font-mono">{cat.slug}</p>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
             ))}
             {categories.length === 0 && !isAdding && (
                <div className="p-12 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                   No categories found. Create one to get started.
                </div>
             )}
          </div>
       )}
    </div>
  );
}
