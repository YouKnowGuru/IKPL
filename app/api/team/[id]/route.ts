import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TeamMember } from '@/models';
import { requireAuth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/team/[id] - Admin: update team member
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

    const member = await TeamMember.findByIdAndUpdate(
      id,
      { name, photo, title, description, order: order || 0 },
      { new: true }
    );

    if (!member) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/team/[id] - Admin: delete team member
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    const member = await TeamMember.findByIdAndDelete(id);

    if (!member) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
