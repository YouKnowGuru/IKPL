import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product, Inventory } from '@/models';
import { requireAuth } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id).populate('categoryId', 'name slug').lean() as any;
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    const { searchParams } = new URL(_req.url);
    const locationId = searchParams.get('locationId');

    let stock = 0;
    let inventoryByLocation = [];
    
    // Always fetch all inventory for detailed view
    const allInv = await Inventory.find({ productId: id }).populate('locationId', 'name district address').lean();
    inventoryByLocation = allInv.map((i: any) => ({
      locationId: i.locationId?._id,
      name: i.locationId?.name,
      district: i.locationId?.district,
      stock: i.stock || 0
    }));

    if (locationId) {
      const inv = allInv.find((i: any) => i.locationId?._id.toString() === locationId);
      stock = (inv as any)?.stock || 0;
    } else {
      stock = allInv.reduce((sum: number, i: any) => sum + (i.stock || 0), 0);
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        stock,
        inventoryByLocation,
        image: product.images && product.images.length > 0 ? product.images[0] : null
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const body = await request.json();
    const product = await Product.findByIdAndUpdate(id, body, { new: true }).populate('categoryId', 'name slug');
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
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
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
