'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/shared/Toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Inbox, Send, Trash2, Mail, CheckCircle, Clock, 
  MapPin, Loader2, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  const { showToast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact?limit=100', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch {
      showToast('Error loading messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (msg: any) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      // Mark as read
      try {
        await fetch(`/api/contact/${msg._id}`, { method: 'PATCH' });
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
      } catch (e) {}
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/contact/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage: replyText })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('Reply dispatched successfully!', 'success');
        setMessages(prev => prev.map(m => m._id === selectedMessage._id ? { ...m, replied: true, replyMessage: replyText, read: true } : m));
        setSelectedMessage({ ...selectedMessage, replied: true, replyMessage: replyText });
        setReplyText('');
      } else {
        showToast(data.message || 'Error sending reply', 'error');
      }
    } catch {
      showToast('Network error while replying', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this message permanently?')) return;
    
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Message deleted', 'success');
        setMessages(prev => prev.filter(m => m._id !== id));
        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }
      }
    } catch {
      showToast('Error deleting message', 'error');
    }
  };

  // Split UI if a message is selected on mobile
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden animate-in fade-in bg-zinc-50 dark:bg-zinc-950">
      
      {/* ── Inbox Sidebar ────────────────────────────────────────── */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-zinc-200 dark:border-white/10 flex flex-col h-full bg-white dark:bg-zinc-900 ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg inline-flex items-center gap-2">
            <Inbox className="h-5 w-5 text-agro-green" /> 
            Inbox
          </h2>
          <Button variant="ghost" size="icon" onClick={fetchMessages} disabled={loading} className="text-zinc-500 hover:text-agro-green">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 space-y-3">
              <Mail className="h-10 w-10 mx-auto opacity-20" />
              <p className="text-sm">No messages found in your inbox.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              {messages.map((msg) => (
                <div 
                  key={msg._id} 
                  onClick={() => handleSelect(msg)}
                  className={`p-4 cursor-pointer transition-colors relative group ${
                    selectedMessage?._id === msg._id 
                      ? 'bg-agro-green/5 dark:bg-agro-green/10' 
                      : 'hover:bg-zinc-50 dark:hover:bg-white/5'
                  }`}
                >
                  {!msg.read && (
                    <div className="absolute top-4 left-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <div className="pl-3 pr-6">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm truncate pr-2 ${!msg.read ? 'font-bold text-zinc-900 dark:text-white' : 'font-semibold text-zinc-700 dark:text-zinc-300'}`}>
                        {msg.name}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">
                        {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className={`text-xs truncate mb-2 ${!msg.read ? 'text-zinc-800 dark:text-zinc-200 font-medium' : 'text-zinc-500'}`}>
                      {msg.subject}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {msg.replied ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-agro-green bg-agro-green/10 px-2 py-0.5 rounded-full">
                            <CheckCircle className="h-3 w-3" /> Replied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                        {isSuperAdmin && msg.locationId && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full max-w-[100px] truncate">
                            <MapPin className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{msg.locationId.name}</span>
                          </span>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => handleDelete(msg._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Message Detail View ──────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 ${!selectedMessage ? 'hidden md:flex' : 'flex'}`}>
        {!selectedMessage ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400 flex-col gap-4">
            <Mail className="h-16 w-16 opacity-20" />
            <p>Select a message to read and reply</p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex-shrink-0 flex gap-4 items-start">
              <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-zinc-500" onClick={() => setSelectedMessage(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-1">
                  {selectedMessage.subject}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{selectedMessage.name}</span>
                  <a href={`mailto:${selectedMessage.email}`} className="text-agro-green hover:underline">{selectedMessage.email}</a>
                  <span className="text-xs">{format(new Date(selectedMessage.createdAt), 'MMMM d, yyyy \at h:mm a')}</span>
                  {selectedMessage.locationId && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-zinc-100 dark:bg-white/10 px-2.5 py-1 rounded-lg">
                      <MapPin className="h-3 w-3" /> {selectedMessage.locationId.name} Route
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Original Message Bubble */}
              <div className="max-w-3xl">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl rounded-tl-sm shadow-sm whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Reply Bubble (if exists) */}
              {selectedMessage.replied && (
                <div className="max-w-3xl ml-auto flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 px-1">
                    Your Reply via Email
                  </span>
                  <div className="bg-agro-green text-white p-5 rounded-2xl rounded-tr-sm shadow-md whitespace-pre-wrap text-sm leading-relaxed w-full">
                    {selectedMessage.replyMessage}
                  </div>
                </div>
              )}
            </div>

            {/* Reply Composer */}
            {!selectedMessage.replied && (
              <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10 flex-shrink-0">
                <div className="max-w-4xl">
                  <Label htmlFor="reply" className="sr-only">Reply Message</Label>
                  <Textarea
                    id="reply"
                    placeholder="Type your response here. This will be sent directly to the customer's email..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-white/10 rounded-xl resize-none mb-4 text-sm"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Pressing send will instantly dispatch an email from <strong className="text-zinc-700 dark:text-zinc-300">support@ikpl.com</strong>
                    </p>
                    <Button 
                      onClick={handleReply} 
                      disabled={isReplying || !replyText.trim()}
                      className="btn-glow-green text-white font-bold rounded-xl h-10 px-6"
                    >
                      {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Send Reply</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
