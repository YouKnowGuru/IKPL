'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { register, verifyOtp, resendOtp } = useAuth();
  const { showToast } = useToast();

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOtp(email);
      showToast('A new OTP has been sent!', 'success');
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      showToast(error.message || 'Resend failed', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'details') {
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }

      setIsLoading(true);

      try {
        const res = await register(name, email, password, confirmPassword);
        if (res?.requiresVerification) {
          setStep('otp');
          showToast('OTP sent to your email', 'success');
        } else {
          showToast('Registration successful!', 'success');
        }
      } catch (error: any) {
        showToast(error.message || 'Registration failed', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle OTP verification
      setIsLoading(true);
      try {
        await verifyOtp(email, otp);
        showToast('Email verified successfully!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Verification failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-[440px] bg-white/5 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl overflow-hidden group animate-in fade-in slide-in-from-bottom-8 duration-700">

      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-agro-green via-agro-orange to-transparent opacity-50" />
      
      <CardHeader className="space-y-1.5 p-6 md:p-8 pb-3">
        <div className="flex justify-center mb-1">
          <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-agro-green/20">
            <Sparkles className="h-2.5 w-2.5" />
            Join the Network
          </div>
        </div>
        <CardTitle className="text-2xl font-display font-bold text-center text-white">
          {step === 'details' ? (
            <>Create <span className="gradient-text-animate">Account</span></>
          ) : (
            <>Verify <span className="gradient-text-animate">Email</span></>
          )}
        </CardTitle>
        <CardDescription className="text-center text-zinc-400 text-xs leading-relaxed">
          {step === 'details' 
            ? 'Sign up for premium nutrition and fodder pickups.' 
            : `Enter the 6-digit code sent to ${email}`}
        </CardDescription>
      </CardHeader>

      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3.5 p-6 md:p-8 pt-3">
          {step === 'details' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5 group/input">
                  <Label htmlFor="name" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-10 pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 group/input">
                  <Label htmlFor="email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-10 pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 group/input">
                <Label htmlFor="password" title="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="h-10 pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 group/input">
                <Label htmlFor="confirmPassword" title="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirm Password</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-10 pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 px-1 pt-2">
                <input type="checkbox" id="terms" required className="w-3 h-3 rounded border-white/10 bg-white/5 text-agro-green focus:ring-agro-green/20" />
                <label htmlFor="terms" className="text-[10px] text-zinc-500 font-medium leading-none">
                  I agree to the <Link href="/terms" className="text-agro-green hover:underline">Terms of Service</Link>, <Link href="/privacy" className="text-agro-green hover:underline">Privacy Policy</Link> and exploring <Link href="/about" className="text-agro-green hover:underline">Our Team</Link>
                </label>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-1.5 group/input">
                <Label htmlFor="otp" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">One-Time Password</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={6}
                    className="h-12 pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all text-lg tracking-[0.5em] text-center font-bold"
                  />
                </div>
              </div>
              <p className="text-[10px] text-center text-zinc-500">
                Didn't receive the code?{' '}
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`font-bold ${resendTimer > 0 ? 'text-zinc-600' : 'text-agro-green hover:underline'}`}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </p>
              <p className="text-[10px] text-center text-zinc-500 mt-2">
                <button 
                  type="button" 
                  onClick={() => setStep('details')}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  Change Email
                </button>
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-5 p-6 md:p-8 pt-0">
          <Button
            type="submit"
            className="w-full btn-glow-green h-11 text-white font-bold rounded-xl border-0 shadow-lg group/btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-xs">{step === 'details' ? 'Creating...' : 'Verifying...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                <span>{step === 'details' ? 'Join Now' : 'Verify Account'}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>

          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-[#0f0f15]/80 backdrop-blur-sm px-4 text-zinc-500">Already a Member?</span>
            </div>
          </div>
          
          <p className="text-sm text-center text-zinc-400">
            Sign in to your account.{' '}
            <Link href="/login" className="text-agro-green font-bold hover:text-agro-green/80 transition-colors underline-offset-4 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
