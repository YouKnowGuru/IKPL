import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const orders = await Order.find().select('status totalPrice paymentStatus amountPaid userId');
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
