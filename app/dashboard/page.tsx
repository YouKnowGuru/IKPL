import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Order } from '@/models';
import Link from 'next/link';
import { ArrowRight, Package, TrendingUp, Truck } from 'lucide-react';
import OverviewChart from './_components/OverviewChart';

export const metadata = {
  title: 'My Dashboard',
};

export default async function DashboardPage() {
  await connectDB();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  // Fetch user orders
  const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });

  // Calculate KPIs
  const totalOrders = orders.length;
  // 'completed' is the final status (not 'delivered' — this is a pickup-only platform)
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  // Get most recent 3 orders
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-3xl tracking-tight text-zinc-900 dark:text-white">
          Welcome back, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-zinc-500 mt-1">Here is what is happening with your farm feeds today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 p-6 shadow-md hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-500 text-sm">Total Spent (Lifetime)</h3>
            <div className="h-10 w-10 rounded-full bg-agro-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-agro-green" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-zinc-900 dark:text-white">
            {totalSpent > 0 ? `Nu. ${totalSpent.toLocaleString()}` : 'Order History'}
          </p>
          <div className="h-1 w-full bg-zinc-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-agro-green w-3/4 rounded-full" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 p-6 shadow-md hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-500 text-sm">Pending Pickups</h3>
            <div className="h-10 w-10 rounded-full bg-agro-orange/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5 text-agro-orange" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-zinc-900 dark:text-white">
            {activeOrders}
          </p>
          {activeOrders > 0 ? (
            <p className="text-xs text-agro-orange font-bold mt-2 bg-agro-orange/10 w-fit px-2 py-1 rounded inline-block">
              {activeOrders} Ready for pickup
            </p>
          ) : (
            <p className="text-xs text-zinc-400 mt-2">All picked up</p>
          )}
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 p-6 shadow-md hover:shadow-xl transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-500 text-sm">Total Orders</h3>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-zinc-900 dark:text-white">
            {totalOrders}
          </p>
          <p className="text-xs text-zinc-400 mt-2">Across all time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
        
        {/* Analytics Chart */}
        <div className="xl:col-span-2 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Expenditure Overview</h2>
          </div>
          {/* Recharts Client Component */}
          <OverviewChart orders={JSON.parse(JSON.stringify(orders))} />
        </div>

        {/* Recent Orders Widget */}
        <div className="xl:col-span-1 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/30 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Recent Activity</h2>
            <Link href="/dashboard/orders" className="text-sm font-bold text-agro-green hover:underline">
              View All
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-4 flex-1">
              {recentOrders.map((order) => (
                <div key={order._id.toString()} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-default">
                  <div className="h-10 w-10 rounded-full bg-agro-green/15 flex items-center justify-center flex-shrink-0 border border-agro-green/30">
                    <Package className="h-4 w-4 text-agro-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      Order #{order._id.toString().slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {order.totalPrice > 0 ? (
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        Nu. {order.totalPrice.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-agro-green uppercase">Pickup</p>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-agro-orange">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-xl">
              <Package className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">No orders yet</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Start your farming journey by exploring our premium feeds.</p>
              <Link href="/products" className="mt-4 px-4 py-2 bg-agro-green text-white font-bold text-xs rounded-lg hover:bg-agro-green/90 transition-all flex items-center gap-1 group">
                Shop Feeds <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
