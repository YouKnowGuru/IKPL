'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/shared/Toast';
import { Users, Plus, ShieldCheck, MapPin, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', locationId: '' });

  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', role: 'customer', locationId: '' });

  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, lRes] = await Promise.all([
         fetch('/api/users'),
         fetch('/api/locations?all=true')
      ]);
      const uData = await uRes.json();
      const lData = await lRes.json();
      if (uData.success) setUsers(uData.users);
      if (lData.success) setLocations(lData.locations);
    } catch (error) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast('User created', 'success');
        setIsAdding(false);
        setForm({ name: '', email: '', password: '', role: 'customer', locationId: '' });
        fetchData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error creating user', 'error');
    }
  };

  const handleStartEdit = (user: any) => {
    setEditUserId(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      password: '', // Blank by default so password is not overwritten unless typed
      role: user.role,
      locationId: user.locationId?._id || ''
    });
    setIsAdding(false);
  };

  const handleUpdate = async () => {
    if (!editUserId) return;
    try {
      // Clean up body so we don't send empty passwords or locationId if not store admin
      const body: any = { ...editForm };
      if (!body.password) delete body.password;
      if (body.role !== 'store_admin') body.locationId = '';

      const res = await fetch(`/api/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        showToast('User updated', 'success');
        setEditUserId(null);
        fetchData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error updating user', 'error');
    }
  };

  const handleDelete = async (id: string, isSelf: boolean) => {
    if (isSelf) {
      showToast('You cannot delete your own account.', 'error');
      return;
    }
    if (!confirm('Are you sure you want to delete this user? Action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('User deleted successfully', 'success');
        fetchData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error deleting user', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-display font-bold">User Management</h1>
             <p className="text-zinc-500 text-sm mt-1">Manage customers and store administrators.</p>
          </div>
          <Button onClick={() => { setIsAdding(!isAdding); setEditUserId(null); }} className="btn-glow-green text-white font-bold rounded-xl gap-2">
             <Plus className="h-4 w-4" /> Add User
          </Button>
       </div>

       {isAdding && (
          <Card className="border-agro-green/20 shadow-lg shadow-agro-green/5">
             <CardContent className="p-6">
                <h3 className="font-bold mb-4 font-display">New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <Input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                   <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                   <Input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                   <select 
                     className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                     value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                   >
                     <option value="customer">Customer</option>
                     <option value="store_admin">Store Admin</option>
                     <option value="super_admin">Super Admin (HQ)</option>
                   </select>

                   {form.role === 'store_admin' && (
                     <select 
                       className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                       value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })}
                     >
                       <option value="">Select Store Location</option>
                       {locations.map(l => (
                         <option key={l._id} value={l._id}>{l.name} ({l.district})</option>
                       ))}
                     </select>
                   )}
                </div>
                <div className="flex justify-end gap-3 mt-4">
                   <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                   <Button onClick={handleCreate}>Create User</Button>
                </div>
             </CardContent>
          </Card>
       )}

       {editUserId && (
          <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5">
             <CardContent className="p-6">
                <h3 className="font-bold mb-4 font-display text-blue-600">Edit User</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <div>
                     <label className="text-xs text-zinc-500 block mb-1">Full Name</label>
                     <Input placeholder="Full Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                   </div>
                   <div>
                     <label className="text-xs text-zinc-500 block mb-1">Email</label>
                     <Input placeholder="Email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                   </div>
                   <div>
                     <label className="text-xs text-zinc-500 block mb-1">Reset Password (leave blank to keep current)</label>
                     <Input placeholder="New Password" type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
                   </div>
                   <div>
                     <label className="text-xs text-zinc-500 block mb-1">Role</label>
                     <select 
                       className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                       value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value, locationId: e.target.value !== 'store_admin' ? '' : editForm.locationId })}
                     >
                       <option value="customer">Customer</option>
                       <option value="store_admin">Store Admin</option>
                       <option value="super_admin">Super Admin (HQ)</option>
                     </select>
                   </div>

                   {editForm.role === 'store_admin' && (
                     <div>
                       <label className="text-xs text-zinc-500 block mb-1">Store Location Assignment</label>
                       <select 
                         className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                         value={editForm.locationId} onChange={e => setEditForm({ ...editForm, locationId: e.target.value })}
                       >
                         <option value="">Select Store Location</option>
                         {locations.map(l => (
                           <option key={l._id} value={l._id}>{l.name} ({l.district})</option>
                         ))}
                       </select>
                     </div>
                   )}
                </div>
                <div className="flex justify-end gap-3 mt-4">
                   <Button variant="outline" onClick={() => setEditUserId(null)}>Cancel</Button>
                   <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">Update User</Button>
                </div>
             </CardContent>
          </Card>
       )}

       {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
       ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
                      <tr>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">User</th>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Role</th>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Location</th>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Created</th>
                         <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                      {users.map(u => {
                         const isSelf = (currentUser as any)?._id === u._id;
                         return (
                         <tr key={u._id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                               <p className="font-bold">{u.name} {isSelf && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>}</p>
                               <p className="text-zinc-500 text-xs">{u.email}</p>
                            </td>
                            <td className="px-6 py-4">
                               <Badge variant={u.role === 'customer' ? 'secondary' : 'default'} className={u.role === 'super_admin' ? 'bg-purple-500' : u.role==='store_admin' ? 'bg-agro-green' : ''}>
                                  {u.role.replace('_', ' ').toUpperCase()}
                               </Badge>
                            </td>
                            <td className="px-6 py-4">
                               {u.locationId ? (
                                  <span className="text-xs flex items-center gap-1 font-medium"><MapPin className="h-3 w-3 text-agro-green" /> {u.locationId.name}</span>
                               ) : '-'}
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-500">
                               {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 flex justify-end gap-2">
                               <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:border-blue-200" onClick={() => handleStartEdit(u)}>
                                  <Edit className="h-4 w-4" />
                               </Button>
                               <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-200" onClick={() => handleDelete(u._id, isSelf)} disabled={isSelf}>
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </td>
                         </tr>
                      )})}
                   </tbody>
                </table>
             </div>
          </div>
       )}
    </div>
  );
}
