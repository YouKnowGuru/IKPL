'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, Edit2, Trash2, Loader2, Handshake, 
  Image as ImageIcon, X, Save, ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function PartnerManagement() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners');
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners);
      }
    } catch (err) {
      showToast('Failed to load partners', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleEdit = (partner: any = null) => {
    setCurrentPartner(partner || { name: '', photo: '', title: '', description: '', order: 0 });
    setIsEditing(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from partners?`)) return;
    try {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Partner removed successfully', 'success');
        setPartners(prev => prev.filter(p => p._id !== id));
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Error deleting partner', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = !currentPartner._id;
      const url = isNew ? '/api/partners' : `/api/partners/${currentPartner._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPartner),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Partner ${isNew ? 'added' : 'updated'} successfully`, 'success');
        setIsEditing(false);
        fetchPartners();
      } else {
        showToast(data.message || 'Save failed', 'error');
      }
    } catch (err) {
      showToast('Error saving partner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPartner({ ...currentPartner, photo: data.url });
        showToast('Partner logo uploaded successfully', 'success');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('Error uploading logo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Partner Management</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-md">
            Manage your brand partners and collaborators shown on the home page.
          </p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => handleEdit()}
            className="btn-glow-green text-white font-bold h-12 rounded-2xl px-6 group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            Add Partner
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold">
              {currentPartner?._id ? 'Edit Partner' : 'Add New Partner'}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Partner Name</label>
                <Input 
                  required
                  value={currentPartner.name} 
                  onChange={e => setCurrentPartner({ ...currentPartner, name: e.target.value })}
                  placeholder="e.g. Royal Agri Corp"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Title (Optional)</label>
                <Input 
                  value={currentPartner.title} 
                  onChange={e => setCurrentPartner({ ...currentPartner, title: e.target.value })}
                  placeholder="e.g. Strategic Partner"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Display Order</label>
                <Input 
                  type="number"
                  value={currentPartner.order} 
                  onChange={e => setCurrentPartner({ ...currentPartner, order: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Partner Logo / Photo</label>
                <div className="relative h-40 w-40 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-white/10 group">
                  {currentPartner.photo ? (
                    <>
                      <img src={currentPartner.photo} alt="Preview" className="w-full h-full object-contain p-4" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer text-white text-xs font-bold flex flex-col items-center gap-2">
                          <ImageIcon className="h-6 w-6" />
                          Change Logo
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-agro-green transition-colors">
                      {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Plus className="h-8 w-8" />}
                      <span className="text-xs font-bold">Upload Logo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Description (Optional)</label>
                <Textarea 
                  value={currentPartner.description} 
                  onChange={e => setCurrentPartner({ ...currentPartner, description: e.target.value })}
                  placeholder="Short description of the partnership..."
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-white/5">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl h-12 px-6 font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading} className="btn-glow-green text-white font-bold h-12 px-8 rounded-xl">
                {saving ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-5 w-5 mr-2" /> Save Partner</>
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              placeholder="Search by name or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm focus:ring-agro-green/20"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
              <Loader2 className="h-10 w-10 text-agro-green animate-spin mb-4" />
              <p className="text-zinc-400 font-medium">Fetching partners...</p>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
              <Handshake className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl mb-1">No partners found</h3>
              <p className="text-zinc-400 text-sm mb-6">Start by adding your first partner.</p>
              <Button onClick={() => handleEdit()} variant="outline" className="rounded-xl font-bold">
                Add Partner
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPartners.map((partner) => (
                <div
                  key={partner._id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 rounded-3xl p-6 group hover:border-agro-green/30 transition-all card-hover flex flex-col items-center text-center"
                >
                  <div className="relative h-24 w-full mb-6">
                    <img
                      src={partner.photo || '/images/placeholder-logo.png'}
                      alt={partner.name}
                      className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(partner)}
                        className="h-8 w-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-white/10 hover:bg-agro-green hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(partner._id, partner.name)}
                        className="h-8 w-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-white/10 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg mb-1 group-hover:text-agro-green transition-colors">{partner.name}</h3>
                  {partner.title && <p className="text-agro-green text-[10px] font-bold uppercase tracking-widest mb-2">{partner.title}</p>}
                  {partner.description && <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2">{partner.description}</p>}
                  
                  <div className="mt-4 pt-4 border-t border-zinc-50 dark:border-white/5 w-full">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                      <ArrowUpDown className="h-3 w-3" /> Order: {partner.order}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
