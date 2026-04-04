import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order, Product, User } from '@/models';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// ── Shared aggregation helpers ────────────────────────────────────────────────
//
// FINANCIAL LOGIC:
//   Revenue       = SUM(amountPaid) for all non-cancelled orders
//                   (captures cash from full-pay, advance, and settled credits)
//   Credit        = SUM(totalPrice - amountPaid) where paymentStatus = 'credit'
//                   (money promised but not yet received)
//   AdvanceRcvd   = SUM(amountPaid) where paymentStatus = 'partial'
//                   (advance money already in hand for pending orders)
//   AdvanceRem    = SUM(totalPrice - amountPaid) where paymentStatus = 'partial'
//                   (remaining balance still to collect on advance orders)

function buildRevenueAgg(extraMatch: object = {}) {
  return Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, ...extraMatch } },
    { $group: { _id: null, total: { $sum: { $ifNull: ['$amountPaid', 0] } } } },
  ]);
}

function buildCreditAgg(extraMatch: object = {}) {
  return Order.aggregate([
    { $match: { paymentStatus: 'credit', status: { $ne: 'cancelled' }, ...extraMatch } },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $subtract: [
              { $ifNull: ['$totalPrice', 0] },
              { $ifNull: ['$amountPaid', 0] },
            ],
          },
        },
      },
    },
  ]);
}

function buildAdvanceRcvdAgg(extraMatch: object = {}) {
  return Order.aggregate([
    { $match: { paymentStatus: 'partial', ...extraMatch } },
    { $group: { _id: null, total: { $sum: { $ifNull: ['$amountPaid', 0] } } } },
  ]);
}

function buildAdvanceRemAgg(extraMatch: object = {}) {
  return Order.aggregate([
    { $match: { paymentStatus: 'partial', ...extraMatch } },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $subtract: [
              { $ifNull: ['$totalPrice', 0] },
              { $ifNull: ['$amountPaid', 0] },
            ],
          },
        },
      },
    },
  ]);
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await connectDB();

    if (payload.role === 'super_admin') {
      // Platform-wide stats
      const [orders, pending, products, customers, blogs] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'ready_for_pickup'] } }),
        Product.countDocuments({ status: 'active' }),
        User.countDocuments({ role: 'customer' }),
        mongoose.model('Blog').countDocuments(),
      ]);

      const [revenueRes, creditRes, advRcvdRes, advRemRes] = await Promise.all([
        buildRevenueAgg(),
        buildCreditAgg(),
        buildAdvanceRcvdAgg(),
        buildAdvanceRemAgg(),
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          orders,
          pending,
          products,
          customers,
          blogs,
          revenue: revenueRes[0]?.total ?? 0,
          totalCredit: creditRes[0]?.total ?? 0,
          totalAdvanceReceived: advRcvdRes[0]?.total ?? 0,
          totalAdvanceRemaining: advRemRes[0]?.total ?? 0,
        },
      });

    } else if (payload.role === 'store_admin') {
      if (!payload.locationId) {
        return NextResponse.json(
          { success: false, message: 'Store admin has no assigned location' },
          { status: 400 }
        );
      }

      const locationObjectId = new mongoose.Types.ObjectId(payload.locationId);
      const scopeMatch = { locationId: locationObjectId };

      const [orders, pending] = await Promise.all([
        Order.countDocuments(scopeMatch),
        Order.countDocuments({
          ...scopeMatch,
          status: { $in: ['pending', 'confirmed', 'ready_for_pickup'] },
        }),
      ]);

      const [revenueRes, creditRes, advRcvdRes, advRemRes] = await Promise.all([
        buildRevenueAgg(scopeMatch),
        buildCreditAgg(scopeMatch),
        buildAdvanceRcvdAgg(scopeMatch),
        buildAdvanceRemAgg(scopeMatch),
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          orders,
          pending,
          revenue: revenueRes[0]?.total ?? 0,
          totalCredit: creditRes[0]?.total ?? 0,
          totalAdvanceReceived: advRcvdRes[0]?.total ?? 0,
          totalAdvanceRemaining: advRemRes[0]?.total ?? 0,
        },
      });

    } else {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Invalid or expired token')
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
