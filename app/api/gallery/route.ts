import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Gallery } from '@/models';
import { requireAuth } from '@/lib/auth';

// GET /api/gallery – Public list of active gallery items
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    const query: any = {};
    if (!isAdmin) {
      query.isActive = true;
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const items = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/gallery – Super Admin only
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { imageUrl, caption, category, order } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, message: 'Image URL is required' }, { status: 400 });
    }

    const item = await Gallery.create({
      imageUrl,
      caption: caption || '',
      category: category || 'General',
      order: order || 0,
      isActive: true,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
