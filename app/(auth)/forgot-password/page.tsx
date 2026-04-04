'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck, KeyRound } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { forgotPassword, resetPassword, resendOtp } = useAuth();
  const { showToast } = useToast();

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOtp(email, 'reset');
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
    setIsLoading(true);

    if (step === 'request') {
      try {
        await forgotPassword(email);
        setStep('reset');
        showToast('OTP sent to your email', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to send OTP', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        setIsLoading(false);
        return;
      }

      try {
        await resetPassword(email, otp, password);
        showToast('Password reset successfully! You can now log in.', 'success');
      } catch (error: any) {
        showToast(error.message || 'Reset failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-[400px] bg-white/5 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl overflow-hidden group animate-in fade-in zoom-in duration-500">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-agro-green via-agro-orange to-transparent opacity-50" />
      
      <CardHeader className="space-y-1.5 p-6 md:p-8 pb-3">
        <div className="flex justify-center mb-1">
          <div className="inline-flex items-center gap-2 bg-agro-orange/10 text-agro-orange text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-agro-orange/20">
            <KeyRound className="h-2.5 w-2.5" />
            Security Center
          </div>
        </div>
        <CardTitle className="text-2xl font-display font-bold text-center text-white">
          {step === 'request' ? (
            <>Forgot <span className="gradient-text-animate">Password?</span></>
          ) : (
            <>Reset <span className="gradient-text-animate">Password</span></>
          )}
        </CardTitle>
        <CardDescription className="text-center text-zinc-400 text-xs leading-relaxed">
          {step === 'request' 
            ? "No worries, it happens. Enter your email and we'll send you an OTP." 
            : `Enter the code sent to ${email} and your new password.`}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-6 md:p-8 pt-3">
          {step === 'request' ? (
            <div className="space-y-1.5 group/input">
              <Label htmlFor="email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all font-medium text-xs"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 group/input">
                <Label htmlFor="otp" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">One-Time Password</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={6}
                    className="h-10 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all font-bold tracking-[0.3em] text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5 group/input">
                <Label htmlFor="password" title="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="h-10 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5 group/input">
                <Label htmlFor="confirmPassword" title="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirm New Password</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within/input:text-agro-green transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-10 pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-agro-green/50 focus:ring-agro-green/20 transition-all text-xs"
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
                Wrong email?{' '}
                <button type="button" onClick={() => setStep('request')} className="text-zinc-500 hover:text-white transition-colors">Go Back</button>
              </p>
            </>
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
                <span className="text-xs">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                <span>{step === 'request' ? 'Request OTP' : 'Reset Password'}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-[#0f0f15]/80 backdrop-blur-sm px-4 text-zinc-500">Remember it?</span>
            </div>
          </div>
          
          <p className="text-sm text-center text-zinc-400">
            Back to safe harbor.{' '}
            <Link href="/login" className="text-agro-green font-bold hover:text-agro-green/80 transition-colors underline-offset-4 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
