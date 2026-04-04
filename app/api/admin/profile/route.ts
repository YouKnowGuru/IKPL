import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { requireAdmin, generateToken, setAuthCookie } from '@/lib/auth';

// GET /api/admin/profile
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    await connectDB();
    
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }
}

// PATCH /api/admin/profile
export async function PATCH(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    await connectDB();
    
    const body = await request.json();
    const { name, email, password } = body;

    const user = await User.findById(payload.userId).select('+password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 });
      }
      user.email = email;
    }
    
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
      }
      user.password = password;
    }

    await user.save();

    // Generate a new token if email or role might have changed (though role isn't editable here)
    const newToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      locationId: user.locationId?.toString() || null,
    });

    await setAuthCookie(newToken);

    const updatedUser = await User.findById(user._id).select('-password');
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
