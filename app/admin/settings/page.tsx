'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/shared/Toast';
import { Settings, Save, Globe, Phone, Share2, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUploader from '@/components/admin/ImageUploader';

export default function SettingsAdmin() {
  const [data, setData] = useState({ 
    siteName: '', theme: 'light', logo: '', copyright: '',
    contactInfo: { address: '', phone: '', email: '', workingHours: '' },
    socialLinks: { facebook: '', instagram: '', whatsapp: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.settings) setData(d.settings);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) showToast('Settings saved successfully', 'success');
      else showToast('Failed to save settings', 'error');
    } catch (e) {
      showToast('Error saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold">Global Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage system-wide configuration and metadata.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-zinc-200 dark:border-white/10 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Globe className="h-4 w-4" /> General Info</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Site Name</label>
              <Input value={data.siteName || ''} onChange={e => setData({...data, siteName: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-500 uppercase">Default Theme</label>
               <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.theme || 'light'} onChange={e => setData({...data, theme: e.target.value})}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
               </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Site Logo</label>
              <ImageUploader
                images={data.logo ? [data.logo] : []}
                onChange={(imgs) => setData({ ...data, logo: imgs[0] || '' })}
                maxFiles={1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Copyright Text</label>
              <Input 
                value={data.copyright || ''} 
                onChange={e => setData({...data, copyright: e.target.value})} 
                placeholder="© 2026 IKPL Group. All rights reserved." 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-white/10 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Information</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">HQ Address</label>
              <Input value={data.contactInfo?.address || ''} onChange={e => setData({...data, contactInfo: {...data.contactInfo, address: e.target.value}})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Master Phone</label>
              <Input value={data.contactInfo?.phone || ''} onChange={e => setData({...data, contactInfo: {...data.contactInfo, phone: e.target.value}})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Support Email</label>
              <Input value={data.contactInfo?.email || ''} onChange={e => setData({...data, contactInfo: {...data.contactInfo, email: e.target.value}})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Working Hours</label>
              <Input value={data.contactInfo?.workingHours || ''} placeholder="e.g. Mon – Fri: 8AM – 6PM" onChange={e => setData({...data, contactInfo: {...data.contactInfo, workingHours: e.target.value}})} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-white/10 shadow-sm md:col-span-2">
          <CardContent className="p-6 space-y-4">
             <h3 className="font-bold flex items-center gap-2"><Share2 className="h-4 w-4" /> Social Links</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Facebook URL</label>
                  <Input value={data.socialLinks?.facebook || ''} onChange={e => setData({...data, socialLinks: {...data.socialLinks, facebook: e.target.value}})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Instagram URL</label>
                  <Input value={data.socialLinks?.instagram || ''} onChange={e => setData({...data, socialLinks: {...data.socialLinks, instagram: e.target.value}})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">WhatsApp Number</label>
                  <Input value={data.socialLinks?.whatsapp || ''} onChange={e => setData({...data, socialLinks: {...data.socialLinks, whatsapp: e.target.value}})} />
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="btn-glow-green text-white font-bold h-12 px-8 rounded-xl shadow-lg gap-2">
           {saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Global Settings</>}
        </Button>
      </div>
    </div>
  );
}
