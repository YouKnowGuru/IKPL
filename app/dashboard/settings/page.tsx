'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { User, Mail, ShieldAlert, KeyRound, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  });

  const pwForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    // Fetch current user data
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          profileForm.reset({ name: data.user.name, email: data.user.email });
        }
        setLoading(false);
      });
  }, [profileForm]);

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', ...values }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', ...values }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      toast.success('Password updated automatically. Please log in again.');
      pwForm.reset();
      
      // Force re-login if password changed
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error: any) {
      toast.error(error.message || 'Invalid current password');
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-agro-green" /></div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2 text-zinc-900 dark:text-white">Account Settings</h1>
        <p className="text-zinc-500">Manage your profile, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-white/5">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Personal Information</h2>
          </div>
          
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Full Name</Label>
              <Input 
                id="name"
                {...profileForm.register('name')} 
                className="h-12 bg-zinc-50 dark:bg-white/5 rounded-xl border-zinc-200 dark:border-white/10"
              />
              {profileForm.formState.errors.name && <p className="text-red-500 text-xs">{profileForm.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Email Address (Login ID)</Label>
              <Input 
                id="email"
                {...profileForm.register('email')} 
                disabled
                className="h-12 bg-zinc-100 dark:bg-white/10 text-zinc-400 cursor-not-allowed rounded-xl border-zinc-200 dark:border-white/10"
                title="Email cannot be changed directly"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={profileForm.formState.isSubmitting}
              className="w-full h-12 mt-4 rounded-xl bg-agro-green hover:bg-agro-green/90 font-bold"
            >
              {profileForm.formState.isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="mr-2 h-4 w-4" /> Save Profile Details</>}
            </Button>
          </form>
        </div>

        {/* Security Card */}
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldAlert className="h-48 w-48 text-agro-orange" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-white/5">
              <div className="h-10 w-10 rounded-full bg-agro-orange/10 flex items-center justify-center text-agro-orange">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold">Security & Password</h2>
            </div>

            <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Current Password</Label>
                <Input 
                  type="password"
                  {...pwForm.register('currentPassword')} 
                  className="h-12 bg-zinc-50 dark:bg-white/5 rounded-xl border-zinc-200 dark:border-white/10"
                />
                {pwForm.formState.errors.currentPassword && <p className="text-red-500 text-xs">{pwForm.formState.errors.currentPassword.message}</p>}
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">New Password</Label>
                <Input 
                  type="password"
                  {...pwForm.register('newPassword')} 
                  className="h-12 bg-zinc-50 dark:bg-white/5 rounded-xl border-zinc-200 dark:border-white/10 shadow-inner"
                />
                {pwForm.formState.errors.newPassword && <p className="text-red-500 text-xs">{pwForm.formState.errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Confirm New Password</Label>
                <Input 
                  type="password"
                  {...pwForm.register('confirmPassword')} 
                  className="h-12 bg-zinc-50 dark:bg-white/5 rounded-xl border-zinc-200 dark:border-white/10"
                />
                {pwForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs">{pwForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <Button 
                type="submit" 
                variant="outline"
                disabled={pwForm.formState.isSubmitting}
                className="w-full h-12 mt-4 rounded-xl border-agro-orange/50 text-agro-orange hover:bg-agro-orange hover:text-white font-bold transition-all"
              >
                {pwForm.formState.isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Secure Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
