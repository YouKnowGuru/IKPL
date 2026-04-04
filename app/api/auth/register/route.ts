import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { registerSchema } from '@/lib/validation';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { name, email, password } = result.data;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        // Resend OTP for unverified user
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otp = otp;
        existingUser.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await existingUser.save();
        
        try {
          await sendVerificationEmail(existingUser.email, otp);
        } catch (err) {
          console.error('Failed to resend email');
        }

        return NextResponse.json({
          success: true,
          message: 'Account exists but unverified. New OTP sent.',
          requiresVerification: true,
          email: existingUser.email,
        }, { status: 200 });
      }

      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer',
      otp,
      otpExpiry,
    });
    
    try {
      await sendVerificationEmail(user.email, otp);
    } catch (err) {
      console.error('Failed to send email snippet but user created', err);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      requiresVerification: true,
      email: user.email,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
