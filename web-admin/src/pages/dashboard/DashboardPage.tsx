import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { DashboardStats } from '../../types';
import {
  Users, FileText, Vote, Ticket, DollarSign, TrendingUp, TrendingDown,
  Activity, Bell, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { Skeleton, SkeletonStatCard } from '../../components/Skeleton';
import { onNotificationNew, joinAdminRoom, isSocketConnected } from '../../services/socket';

const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Array<{ type: string; message: string; timestamp: number }>>([]);

  // Main stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/users/stats');
      return data.data as DashboardStats;
    },
    refetchInterval: 30000, // Refetch every 30s
  });

  // Time-series data (mocked for now - replace with real API)
  const { data: userGrowth } = useQuery({
    queryKey: ['user-growth'],
    queryFn: async () => {
      // TODO: Replace with real /api/admin/analytics endpoint
      const days = 7;
      const today = new Date();
      return Array.from({ length: days }).map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: Math.floor(Math.random() * 20) + 10 + i * 2,
          posts: Math.floor(Math.random() * 15) + 5 + i,
          revenue: Math.floor(Math.random() * 5000) + 1000 + i * 200,
        };
      });
    },
    refetchInterval: 60000,
  });

  // Real-time socket integration
  useEffect(() => {
    joinAdminRoom();

    const handleNotification = (notification: any) => {
      setRecentActivities((prev) => [
        {
          type: notification.type || 'info',
          message: notification.message || notification.title || 'New activity',
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);

      // Refetch stats when relevant activity occurs
      if (['PAYMENT', 'USER_SIGNUP', 'POST', 'TICKET'].includes(notification.type)) {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }
    };

    onNotificationNew(handleNotification);

    // Check connection state periodically
    const interval = setInterval(() => {
      setRealtimeActive(isSocketConnected());
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [queryClient]);

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', trend: '+12%' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'from-green-500 to-green-600', trend: '+8%' },
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'from-purple-500 to-purple-600', trend: '+15%' },
    { label: 'Total Votes', value: stats.totalVotes, icon: Vote, color: 'from-orange-500 to-orange-600', trend: '+22%' },
    { label: 'Total Tickets', value: stats.totalTickets, icon: Ticket, color: 'from-pink-500 to-pink-600', trend: '+5%' },
    { label: 'Total Revenue', value: `ETB ${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', trend: '+18%', isCurrency: true },
  ];

  const distribution = [
    { name: 'Users', value: stats.totalUsers, color: COLORS[0] },
    { name: 'Posts', value: stats.totalPosts, color: COLORS[1] },
    { name: 'Votes', value: stats.totalVotes, color: COLORS[2] },
    { name: 'Tickets', value: stats.totalTickets, color: COLORS[3] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            realtimeActive
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${realtimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {realtimeActive ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp size={12} />
                  <span className="font-medium">{card.trend}</span>
                  <span className="text-gray-400 ml-1">vs last week</span>
                </div>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={26} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User growth trend (area chart) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              User Growth (7 days)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={userGrowth || []}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#userGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue (line chart) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign size={16} className="text-emerald-600" />
              </div>
              Revenue (7 days)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                formatter={(v: number) => `ETB ${v.toLocaleString()}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution pie chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-indigo-600" />
            </div>
            Distribution
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {distribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-purple-600" />
            </div>
            Recent Users
          </h2>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {stats.recentUsers.map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-xs ${
                  index === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                  index === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                  index === 2 ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                  'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}>
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{user.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'EMPLOYER' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live activity feed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell size={16} className="text-orange-600" />
            </div>
            Live Activity
          </h2>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Waiting for activity...
                <br />
                <span className="text-xs">Real-time updates via Socket.io</span>
              </p>
            ) : (
              recentActivities.map((activity, i) => (
                <div key={i} className="text-sm py-2 px-3 rounded-lg bg-gray-50 border-l-2 border-indigo-500">
                  <p className="text-gray-700">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
