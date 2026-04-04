import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order, Product, User } from '@/models';
import { requireAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/stats
 * Platform-wide stats for the super admin dashboard.
 * Fixed: correct populate field names (userId, items.productId) and
 * removed the invalid `stock` query against the Product collection.
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    await connectDB();

    // Basic counts
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
    ]);

    // Total revenue from non-cancelled orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue ?? 0;

    // Recent orders – using correct field names: userId, items.productId
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Low stock: query Inventory collection (Product has no stock field)
    const { Inventory } = await import('@/models');
    const lowStockInventory = await Inventory.find({ stock: { $lt: 10 } })
      .populate('productId', 'name price')
      .populate('locationId', 'name district')
      .sort({ stock: 1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
        lowStockInventory,
        monthlyRevenue,
        ordersByStatus,
      },
    });
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Admin access required' ||
      error.message === 'Invalid or expired token'
    ) {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
