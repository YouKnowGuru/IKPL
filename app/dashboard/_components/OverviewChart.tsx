'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export default function OverviewChart({ orders }: { orders: any[] }) {
  // Aggregate orders by month
  const monthlyData = () => {
    const data: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months with 0
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      data[months[d.getMonth()]] = 0;
    }

    orders.forEach((order) => {
      const d = new Date(order.createdAt);
      const monthStr = months[d.getMonth()];
      if (data[monthStr] !== undefined) {
        data[monthStr] += order.totalPrice;
      }
    });

    return Object.entries(data).map(([name, total]) => ({
      name,
      total,
    }));
  };

  const chartData = monthlyData();
  const hasData = chartData.some((d) => d.total > 0);

  // If no data, show simulated "Market Price Trends" to keep the dashboard advanced
  const simulatedData = [
    { name: 'Oct', total: 1200 },
    { name: 'Nov', total: 1800 },
    { name: 'Dec', total: 1500 },
    { name: 'Jan', total: 2400 },
    { name: 'Feb', total: 2100 },
    { name: 'Mar', total: 3200 },
  ];

  const finalData = hasData ? chartData : simulatedData;

  return (
    <div className="h-[300px] w-full">
      {!hasData && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-agro-orange uppercase tracking-widest bg-agro-orange/10 px-3 py-1 rounded-full">
            Simulated Global Feed Market
          </span>
          <span className="text-xs text-zinc-500">Order feeds to see your personal stats</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={finalData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Nu ${value}`}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }}
            itemStyle={{ color: '#10b981' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTotal)"
            activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
