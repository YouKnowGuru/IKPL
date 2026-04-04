'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, Edit2, Trash2, Loader2, User, 
  Image as ImageIcon, X, Save, ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function TeamManagement() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success) {
        setTeam(data.team);
      }
    } catch (err) {
      showToast('Failed to load team members', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleEdit = (member: any = null) => {
    setCurrentMember(member || { name: '', photo: '', title: '', description: '', order: 0 });
    setIsEditing(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the team?`)) return;
    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Member removed from team', 'success');
        setTeam(prev => prev.filter(m => m._id !== id));
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Error deleting member', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = !currentMember._id;
      const url = isNew ? '/api/team' : `/api/team/${currentMember._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMember),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Member ${isNew ? 'added' : 'updated'} successfully`, 'success');
        setIsEditing(false);
        fetchTeam();
      } else {
        showToast(data.message || 'Save failed', 'error');
      }
    } catch (err) {
      showToast('Error saving member', 'error');
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
        setCurrentMember({ ...currentMember, photo: data.url });
        showToast('Photo uploaded successfully', 'success');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('Error uploading photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredTeam = team.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Team Management</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-md">
            Add and manage your team members who appear on the home page.
          </p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => handleEdit()}
            className="btn-glow-green text-white font-bold h-12 rounded-2xl px-6 group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            Add Team Member
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold">
              {currentMember?._id ? 'Edit Team Member' : 'Add New Team Member'}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Name</label>
                <Input 
                  required
                  value={currentMember.name} 
                  onChange={e => setCurrentMember({ ...currentMember, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Job Title</label>
                <Input 
                  required
                  value={currentMember.title} 
                  onChange={e => setCurrentMember({ ...currentMember, title: e.target.value })}
                  placeholder="e.g. Founder & CEO"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Display Order</label>
                <Input 
                  type="number"
                  value={currentMember.order} 
                  onChange={e => setCurrentMember({ ...currentMember, order: parseInt(e.target.value) })}
                  className="h-12 rounded-xl"
                />
                <p className="text-[10px] text-zinc-400 ml-1">Lower numbers appear first.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Member Photo</label>
                <div className="relative h-40 w-40 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-white/10 group">
                  {currentMember.photo ? (
                    <>
                      <img src={currentMember.photo} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer text-white text-xs font-bold flex flex-col items-center gap-2">
                          <ImageIcon className="h-6 w-6" />
                          Change Photo
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-agro-green transition-colors">
                      {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Plus className="h-8 w-8" />}
                      <span className="text-xs font-bold">Upload Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Description / Bio</label>
                <Textarea 
                  required
                  value={currentMember.description} 
                  onChange={e => setCurrentMember({ ...currentMember, description: e.target.value })}
                  placeholder="Tell something about this team member..."
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
                  <><Save className="h-5 w-5 mr-2" /> Save Member</>
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
              <p className="text-zinc-400 font-medium">Fetching team members...</p>
            </div>
          ) : filteredTeam.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
              <User className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl mb-1">No team members found</h3>
              <p className="text-zinc-400 text-sm mb-6">Start by adding your first team member.</p>
              <Button onClick={() => handleEdit()} variant="outline" className="rounded-xl font-bold">
                Add Team Member
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeam.map((member) => (
                <div
                  key={member._id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 rounded-3xl overflow-hidden group hover:border-agro-green/30 transition-all card-hover flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={member.photo || '/images/placeholder-team.jpg'}
                      alt={member.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button 
                        size="icon" 
                        onClick={() => handleEdit(member)}
                        className="h-10 w-10 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-white shadow-lg backdrop-blur-sm border-0 hover:bg-agro-green hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        onClick={() => handleDelete(member._id, member.name)}
                        className="h-10 w-10 rounded-full bg-white/90 dark:bg-zinc-800/90 text-red-600 shadow-lg backdrop-blur-sm border-0 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <div className="bg-agro-green/20 backdrop-blur-md border border-white/20 text-agro-green text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3" /> Order: {member.order}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-xl mb-1 group-hover:text-agro-green transition-colors">{member.name}</h3>
                    <p className="text-agro-green text-xs font-bold uppercase tracking-widest mb-4">{member.title}</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">{member.description}</p>
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
