'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  Utensils, 
  Store,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import type { AnalyticsResponse } from '@/lib/googleSheets';
import { m } from 'framer-motion';

interface AnalyticsDashboardProps {
  data: AnalyticsResponse;
}

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#F43F5E'];

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  if (!data || !data.success || !data.metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <AlertCircle className="w-10 h-10 mb-2 text-slate-400" />
        <p>No analytics data available.</p>
        <p className="text-sm mt-1">{data?.error || 'Try refreshing the page'}</p>
      </div>
    );
  }

  const metrics = data.metrics || { totalRevenue: '0', totalOrders: 0, averageOrderValue: '0' };
  const topDishes = data.topDishes || [];
  const topRestaurants = data.topRestaurants || [];
  const topUsers = data.topUsers || [];
  const peakTimes = data.peakTimes || [];
  const revenueChart = data.revenueChart || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Revenue" 
          value={`₹${parseFloat(metrics.totalRevenue).toLocaleString()}`} 
          icon={IndianRupee}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <StatsCard 
          title="Total Orders" 
          value={metrics.totalOrders.toString()} 
          icon={ShoppingBag}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatsCard 
          title="Avg. Order Value" 
          value={`₹${parseFloat(metrics.averageOrderValue).toLocaleString()}`} 
          icon={TrendingUp}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatsCard 
          title="Active Users" 
          value={topUsers.length.toString()} 
          icon={Users}
          color="text-purple-600"
          bg="bg-purple-50"
          subtext="In this period"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
          Revenue Trend (Last 30 Days)
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 12, fill: '#64748b'}} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#64748b'}} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₹${value}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#F97316" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Dishes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-blue-500" />
            Most Ordered Dishes
          </h2>
          <div className="space-y-4">
            {topDishes.map((dish, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 truncate pr-4">{dish.name}</span>
                  <span className="font-bold text-slate-900">{dish.count} orders</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <m.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(dish.count / topDishes[0].count) * 100}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Store className="w-5 h-5 mr-2 text-emerald-500" />
            Top Performing Restaurants
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRestaurants} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{fontSize: 11, fill: '#64748b'}} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Peak Ordering Times */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-500" />
            Peak Ordering Times
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakTimes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-pink-500" />
            Loyal Customers (Top 5)
          </h2>
          <div className="space-y-4">
            {topUsers.slice(0, 5).map((user, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-xs text-slate-500 shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600 text-sm">₹{user.spend.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{user.count} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, bg, subtext }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {subtext && <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-500 font-medium">{subtext}</span>}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
