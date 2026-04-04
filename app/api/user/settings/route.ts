import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models';

export async function PUT(req: Request) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    // We must re-fetch the user WITH the password field active for validation
    const userDoc = await User.findById(currentUser._id).select('+password');
    if (!userDoc) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (type === 'profile') {
      const { name } = body;
      
      if (!name || name.length < 2) {
        return NextResponse.json({ success: false, message: 'Invalid name' }, { status: 400 });
      }

      userDoc.name = name;
      await userDoc.save();

      return NextResponse.json({ success: true, message: 'Profile updated' });
    }

    if (type === 'password') {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
      }

      // Verify current password
      const isMatch = await userDoc.comparePassword(currentPassword);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 401 });
      }

      // Automatically hashed via pre-save hook in User model
      userDoc.password = newPassword;
      await userDoc.save();

      return NextResponse.json({ success: true, message: 'Password updated' });
    }

    return NextResponse.json({ success: false, message: 'Invalid update type' }, { status: 400 });

  } catch (error: any) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}
