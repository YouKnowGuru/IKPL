import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order, Inventory } from '@/models';
import { requireAuth } from '@/lib/auth';
import { sendOrderCompletionEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);
    await connectDB();
    
    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name images price')
      .populate('locationId', 'name district address');
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns this order or is admin
    if (payload.role === 'customer' && order.userId._id.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    if (payload.role === 'store_admin' && order.locationId._id.toString() !== payload.locationId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    if (error.message === 'Authentication required') {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update order status & payment (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);

    if (payload.role === 'customer') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { status, paymentStatus, paidAmount, paymentMethod } = body;

    const validStatuses = ['pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing status' },
        { status: 400 }
      );
    }

    // Verify existence and store admin scope before updating
    const existing = await Order.findById(id).select('locationId status items');
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    if (payload.role === 'store_admin' && existing.locationId.toString() !== payload.locationId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Prevent store_admin from changing the status of an already completed order
    if (payload.role === 'store_admin' && existing.status === 'completed' && status !== 'completed') {
      return NextResponse.json(
        { success: false, message: 'Store admins cannot change the status of an already completed order.' },
        { status: 403 }
      );
    }

    // Build $set — always persist all provided payment fields
    const updateFields: Record<string, any> = { status };
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (paidAmount !== undefined && paidAmount !== null) {
      updateFields.amountPaid = Number(paidAmount);
    }
    if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod;

    // Direct MongoDB $set — bypasses all Mongoose schema-caching issues
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('items.productId', 'name images price')
      .populate('locationId', 'name district address');

    if (!order) {
      return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
    }

    // Restore stock if the order has just been cancelled
    if (status === 'cancelled' && existing.status !== 'cancelled') {
      try {
        for (const item of existing.items) {
          await Inventory.findOneAndUpdate(
            { productId: item.productId, locationId: existing.locationId },
            { $inc: { stock: item.quantity } }
          );
        }
      } catch (err) {
        console.error('Failed to restore inventory on cancel', err);
      }
    }

    // Send completion email when pickup is marked complete
    if (status === 'completed') {
      try {
        const userEmail = (order.userId as any).email;
        if (userEmail) await sendOrderCompletionEmail(userEmail, order);
      } catch (err) {
        console.error('Failed to send completion email', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully', order });
  } catch (error: any) {
    console.error('Update order error:', error);
    if (error.message === 'Authentication required') {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

