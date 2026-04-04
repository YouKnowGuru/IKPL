'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/shared/Toast';
import { FileText, Save, Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// All content keys supported by the CMS API
const CMS_TABS = [
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'about', label: 'About Us' },
  { key: 'footer', label: 'Footer Text' },
  { key: 'hero', label: 'Hero Section' },
  { key: 'contact', label: 'Contact Info' },
] as const;

type CmsKey = (typeof CMS_TABS)[number]['key'];

interface ContentEntry {
  title: string;
  value: string;
}

export default function ContentAdmin() {
  const [content, setContent] = useState<Record<CmsKey, ContentEntry>>({
    privacy: { title: '', value: '' },
    terms: { title: '', value: '' },
    about: { title: '', value: '' },
    footer: { title: '', value: '' },
    hero: { title: '', value: '' },
    contact: { title: '', value: '' },
  });
  const [activeTab, setActiveTab] = useState<CmsKey>('privacy');
  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // ── Load ALL existing content on mount ───────────────────────────────────
  const loadAllContent = useCallback(async () => {
    setLoadingInit(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const updated = { ...content };
      for (const item of data.contents ?? []) {
        if (item.key in updated) {
          (updated as any)[item.key] = { title: item.title ?? '', value: item.value ?? '' };
        }
      }
      setContent(updated);
    } catch (err: any) {
      showToast('Failed to load CMS content: ' + err.message, 'error');
    } finally {
      setLoadingInit(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAllContent();
  }, [loadAllContent]);

  // ── Save active tab to the real API ─────────────────────────────────────
  const handleSave = async () => {
    const entry = content[activeTab];
    if (!entry.title.trim()) {
      showToast('Please enter a title before saving', 'error');
      return;
    }
    if (!entry.value.trim()) {
      showToast('Content cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: activeTab, title: entry.title, value: entry.value }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast(`${CMS_TABS.find(t => t.key === activeTab)?.label} saved successfully`, 'success');
    } catch (err: any) {
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field: 'title' | 'value', val: string) => {
    setContent(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: val },
    }));
  };

  const activeLabel = CMS_TABS.find(t => t.key === activeTab)?.label ?? '';

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">CMS Content</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage dynamic text across the application. Changes are saved to the database instantly.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAllContent}
          disabled={loadingInit}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loadingInit ? 'animate-spin' : ''}`} />
          Reload
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        {CMS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-agro-green text-white shadow-md'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadingInit ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2 rounded-xl" />
          <Skeleton className="h-[360px] w-full rounded-2xl" />
        </div>
      ) : (
        <Card className="border-zinc-200 dark:border-white/10 shadow-sm">
          <CardContent className="p-0">
            {/* Card header */}
            <div className="bg-zinc-50 dark:bg-white/5 px-6 py-4 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-zinc-400" />
                <h2 className="font-bold">{activeLabel}</h2>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 btn-glow-green text-white font-bold h-9"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>

            {/* Editor body */}
            <div className="p-4 space-y-4 bg-white dark:bg-zinc-900">
              {/* Title field */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={content[activeTab].title}
                  onChange={e => setField('title', e.target.value)}
                  placeholder={`e.g. ${activeLabel}`}
                  className="w-full h-10 px-3 bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-agro-green focus:ring-1 focus:ring-agro-green text-sm"
                />
              </div>

              {/* Content / body field */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Content (HTML supported)
                </label>
                <textarea
                  value={content[activeTab].value}
                  onChange={e => setField('value', e.target.value)}
                  className="w-full h-[350px] p-4 bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-agro-green focus:ring-1 focus:ring-agro-green resize-none text-sm font-mono"
                  placeholder={`Write the ${activeLabel} HTML content here…`}
                />
              </div>

              <p className="text-xs text-zinc-400">
                💡 Tip: You can use HTML tags like{' '}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">&lt;h2&gt;</code>,{' '}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">&lt;p&gt;</code>,{' '}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">&lt;ul&gt;</code> for
                rich formatting.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
