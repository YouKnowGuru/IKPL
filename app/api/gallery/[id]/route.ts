import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Gallery } from '@/models';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { caption, category, order, isActive } = body;

    const item = await Gallery.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Gallery item not found' }, { status: 404 });
    }

    if (caption !== undefined) item.caption = caption;
    if (category) item.category = category;
    if (order !== undefined) item.order = order;
    if (isActive !== undefined) item.isActive = isActive;

    await item.save();
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const item = await Gallery.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Gallery item removed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
