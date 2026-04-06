import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order, Inventory } from '@/models';
import { requireAuth } from '@/lib/auth';
import { sendOrderPlacedEmail } from '@/lib/mail';
import { z } from 'zod';

// ── Validation schema (pickup-only platform) ─────────────────────────────────
const orderItemSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  locationId: z.string().min(1, 'Pickup location is required'),
  notes: z.string().max(500).optional(),
});

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const status = searchParams.get('status');
    const locationId = searchParams.get('locationId');

    const query: any = {};
    if (status) query.status = status;

    if (payload.role === 'super_admin') {
      if (locationId) query.locationId = locationId;
    } else if (payload.role === 'store_admin') {
      // Store admin is ALWAYS scoped to their own store
      query.locationId = payload.locationId;
    } else {
      // Customer sees only their own orders
      query.userId = payload.userId;
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email')
        .populate('items.productId', 'name images price')
        .populate('locationId', 'name district address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Invalid or expired token')
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/orders – customer places order
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await connectDB();

    // ── Validate input ────────────────────────────────────────────────────────
    const body = await request.json();
    const result = createOrderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { items, locationId, notes } = result.data;

    // ── Atomic inventory deduction with rollback ──────────────────────────────
    let totalPrice = 0;
    const orderItems: { productId: any; quantity: number; price: number }[] = [];
    // Track what we've already deducted so we can rollback on partial failure
    const deducted: Array<{ productId: string; locationId: string; quantity: number }> = [];

    try {
      for (const item of items) {
        // 1. Read current inventory + product info for validation messages
        const invCheck = await Inventory.findOne({
          productId: item.productId,
          locationId,
        }).populate('productId', 'name price status');

        if (!invCheck) {
          throw Object.assign(
            new Error('Product not available at the selected store'),
            { isValidation: true }
          );
        }

        const product = invCheck.productId as any;
        if (product.status === 'inactive') {
          throw Object.assign(
            new Error(`${product.name} is currently unavailable`),
            { isValidation: true }
          );
        }

        // 2. Atomically deduct stock — the $gte guard prevents overselling
        const updated = await Inventory.findOneAndUpdate(
          {
            productId: item.productId,
            locationId,
            stock: { $gte: item.quantity }, // ← atomic check + deduct
          },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updated) {
          // Stock was insufficient (race condition caught at DB level)
          throw Object.assign(
            new Error(
              `Insufficient stock for ${product.name}. Available: ${invCheck.stock} bag(s)`
            ),
            { isValidation: true }
          );
        }

        deducted.push({ productId: item.productId, locationId, quantity: item.quantity });
        const itemPrice = product.price || 0;
        orderItems.push({ productId: product._id, quantity: item.quantity, price: itemPrice });
        totalPrice += itemPrice * item.quantity;
      }
    } catch (err: any) {
      // Rollback all previously deducted stock before returning the error
      if (deducted.length > 0) {
        await Promise.allSettled(
          deducted.map((d) =>
            Inventory.findOneAndUpdate(
              { productId: d.productId, locationId: d.locationId },
              { $inc: { stock: d.quantity } }
            )
          )
        );
      }
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.isValidation ? 400 : 500 }
      );
    }

    // ── Create order ─────────────────────────────────────────────────────────
    const order = await Order.create({
      userId: payload.userId,
      items: orderItems,
      locationId,
      totalPrice,
      notes: notes || '',
    });

    await order.populate([
      { path: 'userId', select: 'name email' },
      { path: 'locationId', select: 'name district address' },
      { path: 'items.productId', select: 'name images price' },
    ]);

    try {
      const userEmail = (order.userId as any).email;
      if (userEmail) {
        await sendOrderPlacedEmail(userEmail, order);
      }
    } catch (err) {
      console.error('Failed to send order placement email', err);
    }

    return NextResponse.json(
      { success: true, message: 'Order placed successfully', order },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Invalid or expired token')
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
