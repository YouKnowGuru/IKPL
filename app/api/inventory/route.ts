import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Inventory } from '@/models';
import { requireAuth } from '@/lib/auth';

// GET /api/inventory
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await connectDB();
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    let query: any = {};

    if (payload.role === 'super_admin') {
      if (locationId) query.locationId = locationId;
      if (searchParams.get('productId')) query.productId = searchParams.get('productId');
    } else if (payload.role === 'store_admin') {
      query.locationId = payload.locationId;
      if (searchParams.get('productId')) query.productId = searchParams.get('productId');
    } else {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const items = await Inventory.find(query)
      .populate('productId', 'name images price status')
      .populate('locationId', 'name district')
      .sort({ 'productId.name': 1 });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    if (error.message === 'Authentication required')
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/inventory – update stock
export async function PUT(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await connectDB();
    const { productId, locationId, stock } = await request.json();

    if (payload.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: only Super Admins can manually edit stock' }, { status: 403 });
    }

    const item = await Inventory.findOneAndUpdate(
      { productId, locationId },
      { stock },
      { upsert: true, new: true }
    ).populate('productId', 'name').populate('locationId', 'name district');

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/inventory – create entry (super_admin)
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { productId, locationId, stock } = await request.json();
    const item = await Inventory.findOneAndUpdate(
      { productId, locationId },
      { stock },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
