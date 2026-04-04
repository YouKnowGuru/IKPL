import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TeamMember } from '@/models';
import { requireAuth } from '@/lib/auth';

// GET /api/team - Public: get all team members
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const team = await TeamMember.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/team - Admin: add new team member
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { name, photo, title, description, order } = body;

    if (!name || !photo || !title || !description) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const member = await TeamMember.create({ name, photo, title, description, order: order || 0 });
    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
