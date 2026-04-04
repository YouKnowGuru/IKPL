'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, Trash2, Loader2, Image as ImageIcon, 
  Plus, X, Filter, Grid, LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const CATEGORIES = ['General', 'Logistics', 'Farming', 'Events'];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const { showToast } = useToast();

  // Form State for new upload
  const [newImage, setNewImage] = useState({
    imageUrl: '',
    caption: '',
    category: 'General',
    order: 0,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?isAdmin=true`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      showToast('Failed to load gallery items', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setNewImage(prev => ({ ...prev, imageUrl: data.url }));
        showToast('Image uploaded to Cloudinary', 'success');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('Upload error', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.imageUrl) return;

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImage),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => [data.item, ...prev]);
        setNewImage({ imageUrl: '', caption: '', category: 'General', order: 0 });
        showToast('Added to gallery', 'success');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this image?')) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(item => item._id !== id));
        showToast('Image removed', 'success');
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const toggleActive = async (item: any) => {
    try {
      const res = await fetch(`/api/gallery/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !item.isActive } : i));
        showToast(item.isActive ? 'Hidden from frontend' : 'Vibile on frontend', 'success');
      }
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Gallery Management</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-md">
            Upload and organize photos showcasing IKPL's impact and reach.
          </p>
        </div>
      </div>

      {/* ── Uploader Section ──────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/10 p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Upload className="h-5 w-5 text-agro-green" />
          Add New Photo
        </h2>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 space-y-4">
            <div 
              className={cn(
                "relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                newImage.imageUrl ? "border-agro-green/50" : "border-zinc-200 dark:border-white/10 hover:border-agro-green/30"
              )}
              onClick={() => document.getElementById('gallery-upload')?.click()}
            >
              {newImage.imageUrl ? (
                <img src={newImage.imageUrl} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-agro-green mx-auto" />
                  ) : (
                    <>
                      <Plus className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">Click to Upload</p>
                    </>
                  )}
                </div>
              )}
              <input type="file" id="gallery-upload" className="hidden" onChange={handleFileUpload} accept="image/*" />
            </div>
            {newImage.imageUrl && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="w-full text-red-500 rounded-xl"
                onClick={() => setNewImage(p => ({ ...p, imageUrl: '' }))}
              >
                Clear Photo
              </Button>
            )}
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 pl-1">Caption (Optional)</Label>
              <Input 
                value={newImage.caption}
                onChange={e => setNewImage(p => ({ ...p, caption: e.target.value }))}
                placeholder="Ex: Delivering fresh feed to Punakha..."
                className="h-12 rounded-2xl border-zinc-200 dark:border-white/10 focus:ring-agro-green/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 pl-1">Category</Label>
              <select 
                className="w-full h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/10 px-4 text-sm"
                value={newImage.category}
                onChange={e => setNewImage(p => ({ ...p, category: e.target.value as any }))}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 pl-1">Display Order (Higher = First)</Label>
              <Input 
                type="number"
                value={newImage.order}
                onChange={e => setNewImage(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                className="h-12 rounded-2xl border-zinc-200 dark:border-white/10 focus:ring-agro-green/20"
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={!newImage.imageUrl}
                className="w-full h-12 bg-agro-green text-white font-bold rounded-2xl btn-glow-green"
              >
                Add Image to Gallery
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Gallery List ────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">Image Library</h2>
          <div className="flex bg-white dark:bg-zinc-900 rounded-xl p-1 border border-zinc-100 dark:border-white/10 shadow-sm">
            {['All', ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  activeCategory === cat 
                    ? "bg-agro-green text-white" 
                    : "text-zinc-500 hover:text-agro-green"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="aspect-square bg-zinc-200 dark:bg-white/5 animate-pulse rounded-3xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
            <ImageIcon className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">Your gallery is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items
              .filter(item => activeCategory === 'All' || item.category === activeCategory)
              .map(item => (
                <div key={item._id} className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-white/10 shadow-sm card-hover">
                  <div className="aspect-square relative">
                    <Image src={item.imageUrl} alt={item.caption || 'Gallery Image'} fill className={cn("object-cover transition-opacity", !item.isActive && "opacity-40 grayscale")} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => toggleActive(item)}
                        className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        {item.isActive ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(item._id)}
                        className="rounded-xl bg-red-500/10 hover:bg-red-500/30 text-red-100 border-red-500/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase font-bold text-agro-green mb-0.5">{item.category}</p>
                    <p className="text-[11px] font-medium text-zinc-500 truncate">{item.caption || 'No caption'}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
