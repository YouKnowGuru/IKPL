import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Category } from '@/models';
import { requireAuth } from '@/lib/auth';

// GET /api/categories – public
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/categories – super_admin only
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { name, parentId } = await request.json();
    if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await Category.create({ name, slug, parentId: parentId || null });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ success: false, message: 'Category already exists' }, { status: 400 });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
