import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Partner } from '@/models';
import { requireAuth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/partners/[id] - Admin: update partner
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const { name, photo, title, description, order } = body;

    const partner = await Partner.findByIdAndUpdate(
      id,
      { name, photo, title, description, order: order || 0 },
      { new: true }
    );

    if (!partner) {
      return NextResponse.json({ success: false, message: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/partners/[id] - Admin: delete partner
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    const partner = await Partner.findByIdAndDelete(id);

    if (!partner) {
      return NextResponse.json({ success: false, message: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Partner deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
