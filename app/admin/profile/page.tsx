'use client';

import { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Shield, Save, Loader2, 
  CheckCircle, AlertCircle, Key, UserCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/shared/Toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AdminProfilePage() {
  const { user: authUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      setProfileData({
        name: authUser.name || '',
        email: authUser.email || '',
      });
      setLoading(false);
    }
  }, [authUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Profile updated successfully', 'success');
        await refreshUser();
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('A network error occurred', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Password updated successfully', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.message || 'Failed to update password', 'error');
      }
    } catch (err) {
      showToast('A network error occurred', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-agro-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-agro-green/20 mb-3">
          <Shield className="h-3.5 w-3.5" />
          Account Security
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
          My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          Manage your administrative credentials and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Information */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-agro-green/10 rounded-2xl flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-agro-green" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Personal Info</h2>
              <p className="text-zinc-400 text-xs text-xs">Public administrative details</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                  className="pl-11 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-transparent focus:ring-agro-green/20"
                  placeholder="Your Name"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))}
                  className="pl-11 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-transparent focus:ring-agro-green/20"
                  placeholder="indrakausilaprivatelimitedcomp@gmail.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isUpdatingProfile}
                className="w-full h-12 rounded-2xl bg-agro-green text-white font-bold btn-glow-green border-0"
              >
                {isUpdatingProfile ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Password Update */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-agro-orange/10 rounded-2xl flex items-center justify-center">
              <Key className="h-5 w-5 text-agro-orange" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Security</h2>
              <p className="text-zinc-400 text-xs">Update your login password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                  className="pl-11 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-transparent focus:ring-agro-green/20"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="pl-11 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-transparent focus:ring-agro-green/20"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isUpdatingPassword}
                className="w-full h-12 rounded-2xl bg-zinc-950 text-white font-bold hover:bg-zinc-800 border-0"
              >
                {isUpdatingPassword ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                ) : (
                  <><Key className="h-4 w-4 mr-2" /> Update Password</>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

      </div>

      {/* Account Info Nudge */}
      <div className="p-6 rounded-[2rem] bg-agro-green/5 border border-agro-green/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-agro-green/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-agro-green" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-agro-green">Session Security</h4>
          <p className="text-xs text-zinc-500 leading-relaxed mt-1">
            Changing your email or password will renew your authentication session. You may be asked to log in again on other devices to ensure your account remains secure.
          </p>
        </div>
      </div>

    </div>
  );
}
