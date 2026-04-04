import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Partner } from '@/models';
import { requireAuth } from '@/lib/auth';

// GET /api/partners - Public: get all partners
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const partners = await Partner.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, partners });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/partners - Admin: add new partner
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { name, photo, title, description, order } = body;

    if (!name || !photo) {
      return NextResponse.json({ success: false, message: 'Missing required name or photo' }, { status: 400 });
    }

    const partner = await Partner.create({ name, photo, title: title || '', description: description || '', order: order || 0 });
    return NextResponse.json({ success: true, partner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
