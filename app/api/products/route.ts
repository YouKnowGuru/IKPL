import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product, Inventory, Category } from '@/models';
import { requireAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/products – public
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const locationId = searchParams.get('locationId');

    const query: any = {};
    
    if (category) {
      // If it's a valid ObjectId, use it directly. Otherwise, find by slug.
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categoryId = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.categoryId = cat._id;
        } else {
          // If category not found, return empty results
          return NextResponse.json({ success: true, products: [], total: 0, pages: 0 });
        }
      }
    }
    if (status) query.status = status;
    else query.status = 'active'; // public only sees active
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Attach stock if locationId provided
    let enriched: any[] = products;
    if (locationId) {
      const inventories = await Inventory.find({
        productId: { $in: products.map((p: any) => p._id) },
        locationId,
      }).lean();
      const stockMap: Record<string, number> = {};
      inventories.forEach((inv: any) => { stockMap[inv.productId.toString()] = inv.stock; });
      enriched = products.map((p: any) => ({ 
        ...p, 
        stock: stockMap[p._id.toString()] ?? 0,
        image: p.images && p.images.length > 0 ? p.images[0] : null
      }));
    } else {
      const allInventories = await Inventory.find({
        productId: { $in: products.map((p: any) => p._id) }
      }).lean();
      
      const totalStockMap: Record<string, number> = {};
      allInventories.forEach((inv: any) => {
        const pid = inv.productId.toString();
        totalStockMap[pid] = (totalStockMap[pid] || 0) + (inv.stock || 0);
      });

      enriched = products.map((p: any) => ({
        ...p,
        stock: totalStockMap[p._id.toString()] ?? 0,
        image: p.images && p.images.length > 0 ? p.images[0] : null
      }));
    }

    const total = await Product.countDocuments(query);
    return NextResponse.json({ success: true, products: enriched, total, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/products – super_admin only
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();
    const body = await request.json();
    const { name, categoryId, description, nutrients, price, images, status, unit } = body;

    if (!name || !categoryId || !price)
      return NextResponse.json({ success: false, message: 'name, categoryId and price are required' }, { status: 400 });

    const product = await Product.create({ name, categoryId, description, nutrients, price, images: images || [], status: status || 'active', unit: unit || 'bags' });
    await product.populate('categoryId', 'name slug');
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
