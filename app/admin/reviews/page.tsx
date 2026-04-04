'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/shared/Toast';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ?pending=true to get all reviews including unapproved ones
      const res = await fetch('/api/reviews?pending=true&limit=100');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      showToast('Failed to fetch reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Review ${approved ? 'approved' : 'rejected'}`, 'success');
        fetchData();
      } else {
        showToast(data.message || 'Error updating review', 'error');
      }
    } catch (e) {
      showToast('Error updating review', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review? Action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review deleted successfully', 'success');
        fetchData();
      } else {
        showToast(data.message || 'Error deleting review', 'error');
      }
    } catch (e) {
      showToast('Error deleting review', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-display font-bold">Review Management</h1>
             <p className="text-zinc-500 text-sm mt-1">Approve or reject customer product reviews.</p>
          </div>
       </div>

       {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
       ) : reviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
               <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
               <p>No reviews found.</p>
            </CardContent>
          </Card>
       ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
                      <tr>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Product / User</th>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Review</th>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Status</th>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Date</th>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                      {reviews.map(r => (
                         <tr key={r._id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 align-top">
                               <p className="font-bold text-sm text-agro-green line-clamp-1">{r.product?.name || "Deleted Product"}</p>
                               <p className="text-zinc-500 text-xs mt-1">By {r.user?.name || "Deleted User"}</p>
                            </td>
                            <td className="px-6 py-4 max-w-xs align-top">
                               <div className="flex gap-0.5 mb-1">
                                 {[...Array(5)].map((_, s) => (
                                   <Star key={s} className={`h-3 w-3 ${s < r.rating ? "text-amber-500 fill-amber-500" : "text-zinc-300 dark:text-zinc-700"}`} />
                                 ))}
                               </div>
                               <p className="text-zinc-600 dark:text-zinc-400 text-xs italic line-clamp-2">"{r.comment}"</p>
                            </td>
                            <td className="px-6 py-4 align-top">
                               <Badge variant="outline" className={r.approved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                                  {r.approved ? 'Approved' : 'Pending'}
                               </Badge>
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-500 align-top whitespace-nowrap">
                               {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 flex justify-end gap-2 align-top">
                               {!r.approved ? (
                                  <Button variant="outline" size="icon" title="Approve" className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:border-emerald-200" onClick={() => handleUpdateStatus(r._id, true)}>
                                     <CheckCircle className="h-4 w-4" />
                                  </Button>
                               ) : (
                                  <Button variant="outline" size="icon" title="Reject / Draft" className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:border-amber-200" onClick={() => handleUpdateStatus(r._id, false)}>
                                     <XCircle className="h-4 w-4" />
                                  </Button>
                               )}
                               <Button variant="outline" size="icon" title="Delete" className="h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-200" onClick={() => handleDelete(r._id)}>
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       )}
    </div>
  );
}
