import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Location } from '@/models';
import { requireAuth } from '@/lib/auth';

// GET /api/locations – active stores are public; inactive stores require admin auth
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let filter: any = { isActive: true }; // default: public sees active stores only

    if (all) {
      // Only admins can see inactive stores
      const payload = await requireAuth(request).catch(() => null);
      if (payload && (payload.role === 'super_admin' || payload.role === 'store_admin')) {
        filter = {}; // admins see everything
      }
      // non-admin or unauthenticated: silently fall back to active-only filter
    }

    const locations = await Location.find(filter)
      .populate('adminId', 'name email')
      .sort({ district: 1 });

    return NextResponse.json({ success: true, locations });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/locations – super_admin only
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const body = await request.json();
    const { name, district, address, contact, isActive } = body;

    if (!name || !district || !address)
      return NextResponse.json(
        { success: false, message: 'name, district and address are required' },
        { status: 400 }
      );

    const location = await Location.create({ name, district, address, contact, isActive });
    return NextResponse.json({ success: true, location }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
