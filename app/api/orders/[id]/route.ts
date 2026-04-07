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

// DELETE /api/orders/[id] - Permanently delete order (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAuth(request);

    // Strictly restrict to Super Admin
    if (payload.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    // 1. Fetch order first to identify items + status for inventory restoration
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // 2. Restore inventory if the order was NOT already cancelled
    // (If it was cancelled, stock was already restored during the PUT update)
    if (order.status !== 'cancelled') {
      try {
        for (const item of order.items) {
          await Inventory.findOneAndUpdate(
            { productId: item.productId, locationId: order.locationId },
            { $inc: { stock: item.quantity } }
          );
        }
      } catch (inventoryError) {
        console.error('Inventory restoration failed during delete:', inventoryError);
        // We continue with decompression to ensure the order is still removed
      }
    }

    // 3. Perform hard delete
    await Order.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Order permanently deleted and inventory synchronized',
    });
  } catch (error: any) {
    console.error('Delete order error:', error);
    if (error.message === 'Authentication required') {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

