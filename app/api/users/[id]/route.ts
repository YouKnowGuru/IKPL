import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Location } from '@/models';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// PUT /api/users/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;
    if (body.locationId !== undefined) {
      updateData.locationId = body.locationId || null;
    }
    
    // Only update password if provided
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // If assigned to a location, update that location's adminId
    if (user.role === 'store_admin' && user.locationId) {
      await Location.findByIdAndUpdate(user.locationId, { adminId: user._id });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Prevent super_admin from deleting themselves
    if (payload.userId === id) {
       return NextResponse.json({ success: false, message: 'Cannot delete yourself' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Unassign admin from location if applicable
    if (user.locationId) {
       await Location.updateOne({ adminId: user._id }, { $unset: { adminId: "" } });
    }

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
