import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    // Debug log (remove in production)
    console.log(`Resetting password for ${email}: Input[${otp}], Stored[${user.otp}]`);

    if (!user.otp || String(user.otp).trim() !== String(otp).trim()) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return NextResponse.json({ success: false, message: 'OTP has expired' }, { status: 400 });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Optionally login the user after successful reset
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
