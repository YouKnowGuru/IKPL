import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Location, User } from '@/models';
import { requireAuth } from '@/lib/auth';

// GET /api/locations/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const location = await Location.findById(id).populate('adminId', 'name email');
    if (!location) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, location });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/locations/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const body = await request.json();
    const location = await Location.findByIdAndUpdate(id, body, { new: true });
    if (!location) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    // If assigning a new adminId, update that user's locationId
    if (body.adminId) {
      await User.findByIdAndUpdate(body.adminId, { locationId: id, role: 'store_admin' });
    }

    return NextResponse.json({ success: true, location });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/locations/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    await Location.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Location deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
