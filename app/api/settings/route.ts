import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Setting } from '@/models';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const settings = await Setting.findOne();
    return NextResponse.json({ success: true, settings: settings || {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    
    // There should ideally be only one setting document
    const settings = await Setting.findOneAndUpdate(
      {},
      body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
