import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Location } from '@/models';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    const query: any = {};
    if (role) query.role = role;

    const users = await User.find(query).populate('locationId', 'name district').select('-password');
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { name, email, password, role, locationId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 });
    }

    const newUser = await User.create({
      name,
      email,
      password, // Pre-save hook will hash this
      role,
      locationId: (role === 'store_admin' && locationId) ? locationId : null,
    });

    if (role === 'store_admin' && locationId) {
       await Location.findByIdAndUpdate(locationId, { adminId: newUser._id });
    }

    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json({ success: true, user: userObj }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
