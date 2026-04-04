'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Save, Loader2, ImageIcon, 
  Tag, LayoutDashboard, Globe, EyeOff
} from 'lucide-react';
import BlogEditor from '@/components/admin/BlogEditor';
import Link from 'next/link';

interface BlogFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function BlogForm({ initialData, isEdit }: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    coverImage: initialData?.coverImage || '',
    category: initialData?.category || 'Company News',
    published: initialData?.published || false,
    tags: initialData?.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast('Title and content are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/blog/${initialData._id}` : '/api/blog';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Post updated' : 'Post created', 'success');
        router.push('/admin/blog');
      } else {
        showToast(data.message || 'Save failed', 'error');
      }
    } catch (err) {
      showToast('Error saving post', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const resData = await res.json();
      if (resData.success) {
        setFormData(prev => ({ ...prev, coverImage: resData.url }));
        showToast('Image uploaded', 'success');
      }
    } catch (err) {
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link href="/admin/blog" className="flex items-center gap-2 text-zinc-500 hover:text-agro-green transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
            className="rounded-xl h-11 border-zinc-200 dark:border-white/10 font-bold"
          >
            {formData.published ? <Globe className="h-4 w-4 mr-2 text-agro-green" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {formData.published ? 'Published' : 'Draft'}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-glow-green text-white font-bold h-11 rounded-xl px-6 min-w-[120px]"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isEdit ? 'Update Post' : 'Save Post'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-white/10 shadow-sm">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Article Title</Label>
              <Input
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: The Future of Broiler Growth in Bhutan"
                className="h-14 rounded-2xl border-zinc-200 dark:border-white/10 focus:border-agro-green focus:ring-agro-green/20 text-xl font-display font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Article Content</Label>
              <BlogEditor 
                content={formData.content} 
                onChange={content => setFormData(p => ({ ...p, content }))} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-white/10 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg mb-2">Metadata</h3>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Excerpt</Label>
              <Textarea
                value={formData.excerpt}
                onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                placeholder="Short summary for the blog card..."
                className="rounded-2xl border-zinc-200 dark:border-white/10 min-h-[100px] resize-none text-sm"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Cover Image</Label>
              <div 
                className="relative h-40 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-agro-green/50"
                onClick={() => document.getElementById('cover-image-upload')?.click()}
              >
                {formData.coverImage ? (
                  <>
                    <img src={formData.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin text-agro-green mx-auto" /> : <ImageIcon className="h-6 w-6 text-zinc-300 mx-auto mb-2" />}
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Click to Upload Cover</p>
                  </div>
                )}
                <input 
                  type="file" 
                  id="cover-image-upload" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Category</Label>
              <select
                value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value as any }))}
                className="w-full h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 text-sm focus:outline-none focus:border-agro-green"
              >
                <option value="Company News">Company News</option>
                <option value="Expert Advice">Expert Advice</option>
                <option value="Farming Tips">Farming Tips</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tags (comma separated)</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  value={formData.tags}
                  onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                  placeholder="farming, news, bhutan"
                  className="pl-9 h-11 rounded-xl border-zinc-200 dark:border-white/10 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-agro-green/10 rounded-3xl p-6 border border-agro-green/20">
            <h4 className="font-display font-bold text-agro-green mb-2">Pro Tip</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Use a high-quality cover image (16:9 ratio) to make your post stand out on the frontend grid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
