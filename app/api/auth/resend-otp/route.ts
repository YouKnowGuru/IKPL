import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, type } = await request.json(); // type can be 'verification' or 'reset'

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    try {
      if (type === 'reset') {
        await sendPasswordResetEmail(user.email, otp);
      } else {
        await sendVerificationEmail(user.email, otp);
      }
    } catch (err) {
      console.error('Failed to resend OTP email', err);
    }

    return NextResponse.json({
      success: true,
      message: 'A new OTP has been sent to your email',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
