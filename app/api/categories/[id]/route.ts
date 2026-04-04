import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Category } from '@/models';
import { requireAuth } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { name, parentId } = await request.json();
    const slug = name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug, parentId: parentId || null },
      { new: true }
    );
    if (!category) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
