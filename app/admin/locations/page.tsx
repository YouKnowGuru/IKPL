'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/shared/Toast';
import { Package, Plus, Search, MapPin, Store, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function LocationsAdmin() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for adding a new location
  const [isAdding, setIsAdding] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', district: '', address: '', contact: '', isActive: true });
  
  // State for editing an existing location
  const [editLocId, setEditLocId] = useState<string | null>(null);
  const [editLoc, setEditLoc] = useState({ name: '', district: '', address: '', contact: '', isActive: true });

  const { showToast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations?all=true');
      const data = await res.json();
      if (data.success) setLocations(data.locations);
    } catch (error) {
      showToast('Failed to fetch stores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoc)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Store created', 'success');
        setIsAdding(false);
        setNewLoc({ name: '', district: '', address: '', contact: '', isActive: true });
        fetchLocations();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error creating store', 'error');
    }
  };

  const handleStartEdit = (loc: any) => {
    setEditLocId(loc._id);
    setEditLoc({
      name: loc.name,
      district: loc.district,
      address: loc.address,
      contact: loc.contact || '',
      isActive: loc.isActive
    });
    setIsAdding(false); // Close add form if open
  };

  const handleUpdate = async () => {
    if (!editLocId) return;
    try {
      const res = await fetch(`/api/locations/${editLocId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editLoc)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Store updated', 'success');
        setEditLocId(null);
        fetchLocations();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error updating store', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store location? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Store deleted successfully', 'success');
        fetchLocations();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error deleting store', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
             <h1 className="text-3xl font-display font-bold">Stores & Locations</h1>
             <p className="text-zinc-500 text-sm mt-1">Manage the 20 pickup districts across Bhutan.</p>
          </div>
          <Button onClick={() => { setIsAdding(!isAdding); setEditLocId(null); }} className="btn-glow-green text-white font-bold rounded-xl gap-2">
             <Plus className="h-4 w-4" /> Add Store
          </Button>
       </div>

       {isAdding && (
          <Card className="border-agro-green/20 shadow-lg shadow-agro-green/5">
             <CardContent className="p-6">
                <h3 className="font-bold mb-4 font-display">New Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input placeholder="Store Name (e.g. Thimphu Main Feed)" value={newLoc.name} onChange={e => setNewLoc({ ...newLoc, name: e.target.value })} />
                   <Input placeholder="District (e.g. Thimphu)" value={newLoc.district} onChange={e => setNewLoc({ ...newLoc, district: e.target.value })} />
                   <Input placeholder="Address" value={newLoc.address} onChange={e => setNewLoc({ ...newLoc, address: e.target.value })} />
                   <Input placeholder="Contact Phone" value={newLoc.contact} onChange={e => setNewLoc({ ...newLoc, contact: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 mt-4 ml-1">
                   <input type="checkbox" id="isActive" checked={newLoc.isActive} onChange={e => setNewLoc({ ...newLoc, isActive: e.target.checked })} className="accent-agro-green h-4 w-4 rounded" />
                   <label htmlFor="isActive" className="text-sm font-medium">Store is Active</label>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                   <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                   <Button onClick={handleCreate}>Save Store</Button>
                </div>
             </CardContent>
          </Card>
       )}

       {editLocId && (
          <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5">
             <CardContent className="p-6">
                <h3 className="font-bold mb-4 font-display text-blue-600">Edit Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs text-zinc-500 mb-1 block">Store Name</label>
                     <Input placeholder="Store Name" value={editLoc.name} onChange={e => setEditLoc({ ...editLoc, name: e.target.value })} />
                   </div>
                   <div>
                     <label className="text-xs text-zinc-500 mb-1 block">District</label>
                     <Input placeholder="District" value={editLoc.district} onChange={e => setEditLoc({ ...editLoc, district: e.target.value })} />
                   </div>
                   <div>
                     <label className="text-xs text-zinc-500 mb-1 block">Address</label>
                     <Input placeholder="Address" value={editLoc.address} onChange={e => setEditLoc({ ...editLoc, address: e.target.value })} />
                   </div>
                   <div>
                     <label className="text-xs text-zinc-500 mb-1 block">Contact Phone</label>
                     <Input placeholder="Contact Phone" value={editLoc.contact} onChange={e => setEditLoc({ ...editLoc, contact: e.target.value })} />
                   </div>
                </div>
                <div className="flex items-center gap-2 mt-4 ml-1">
                   <input type="checkbox" id="editIsActive" checked={editLoc.isActive} onChange={e => setEditLoc({ ...editLoc, isActive: e.target.checked })} className="accent-agro-green h-4 w-4 rounded" />
                   <label htmlFor="editIsActive" className="text-sm font-medium">Store is Active</label>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                   <Button variant="outline" onClick={() => setEditLocId(null)}>Cancel</Button>
                   <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">Update Store</Button>
                </div>
             </CardContent>
          </Card>
       )}

       {loading ? (
          <div className="space-y-4">
             <Skeleton className="h-24 w-full rounded-2xl" />
             <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
       ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             {locations.map((loc) => (
                <div key={loc._id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl shadow-sm hover:border-agro-green/30 transition-all flex justify-between items-start gap-4">
                   <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-agro-green/10 text-agro-green flex items-center justify-center flex-shrink-0">
                         <Store className="h-6 w-6" />
                      </div>
                      <div>
                         <h3 className="font-bold font-display text-lg flex items-center gap-2">
                            {loc.name}
                            {!loc.isActive && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
                         </h3>
                         <div className="flex items-center gap-1 text-zinc-500 text-xs mt-1 font-medium">
                            <MapPin className="h-3 w-3" /> {loc.district} • {loc.address}
                         </div>
                         {loc.contact && <p className="text-xs text-zinc-400 mt-1">📞 {loc.contact}</p>}
                         
                         {/* Display Store Admin details clearly */}
                         {loc.adminId && (
                           <div className="mt-3 p-2 bg-zinc-50 dark:bg-black/20 rounded-lg border border-zinc-100 dark:border-white/5 inline-block">
                             <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Store Admin:</p>
                             <p className="text-xs text-agro-green font-medium">{loc.adminId.name} ({loc.adminId.email})</p>
                           </div>
                         )}
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2 text-xs">
                      {!loc.adminId && (
                         <span className="text-zinc-400 px-2 py-1 bg-zinc-100 dark:bg-white/5 rounded-md mb-2">No Admin</span>
                      )}
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:border-blue-200" onClick={() => handleStartEdit(loc)}>
                           <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-200" onClick={() => handleDelete(loc._id)}>
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       )}
    </div>
  );
}
