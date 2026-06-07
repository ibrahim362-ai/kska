import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Membership } from '../../types';
import { Crown, Plus, CheckCircle, Users, Search, Filter, Calendar, Award } from 'lucide-react';

interface UserMembership {
  id: string;
  userId: string;
  membershipId: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  autoRenew: boolean;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatar?: string;
    icons: number;
  };
  membership: Membership;
}

export default function MembershipsPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'members'>('plans');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', planType: 'FREE', level: 0, price: 0, pointsReward: 0, duration: 30, badgeIcon: '', extraVotes: 0, priorityTicket: false, leaderboardBoost: 1.0 });
  
  // Members tab state
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<string>('ALL'); // ALL, FREE, SILVER, GOLD, VIP, VVIP
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, ACTIVE, EXPIRED
  const [memberPage, setMemberPage] = useState(1);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['memberships'],
    queryFn: async () => {
      const { data } = await api.get('/memberships');
      return data.data as Membership[];
    },
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['user-memberships', memberPage, memberFilter, statusFilter],
    queryFn: async () => {
      const { data } = await api.get('/memberships/users', {
        params: {
          page: memberPage,
          limit: 20,
          ...(memberFilter !== 'ALL' && { planType: memberFilter }),
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
        },
      });
      return data.data;
    },
    enabled: activeTab === 'members',
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/memberships', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['memberships'] }); setShowForm(false); },
  });

  const planIcons: Record<string, string> = { FREE: '⚪', SILVER: '🥈', GOLD: '🥇', VIP: '💎', VVIP: '👑' };
  const planGradients: Record<string, string> = {
    FREE: 'from-gray-400 to-gray-500',
    SILVER: 'from-gray-300 to-gray-400',
    GOLD: 'from-yellow-400 to-amber-500',
    VIP: 'from-purple-500 to-pink-600',
    VVIP: 'from-yellow-500 via-orange-500 to-red-500'
  };

  // Filter members by search locally
  const filteredMembers = membersData?.userMemberships?.filter((um: UserMembership) => {
    if (!memberSearch) return true;
    const search = memberSearch.toLowerCase();
    return (
      um.user.fullName.toLowerCase().includes(search) ||
      um.user.username.toLowerCase().includes(search) ||
      um.user.email.toLowerCase().includes(search)
    );
  }) || [];

  const getStatusColor = (expiresAt: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-700 border-gray-300';
    const now = new Date();
    const expires = new Date(expiresAt);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'bg-red-100 text-red-700 border-red-300';
    if (daysLeft <= 7) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getStatusText = (expiresAt: string, isActive: boolean) => {
    if (!isActive) return 'Inactive';
    const now = new Date();
    const expires = new Date(expiresAt);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires Today';
    if (daysLeft === 1) return '1 day left';
    if (daysLeft <= 7) return `${daysLeft} days left`;
    return 'Active';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-500 mt-1">Manage subscription tiers and member users</p>
        </div>
        {activeTab === 'plans' && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
            <Plus size={18} /> New Plan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'plans'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <Crown size={16} />
            Plans
          </span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'members'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users size={16} />
            Members
          </span>
        </button>
      </div>

      {/* Plans Tab Content */}
      {activeTab === 'plans' && (
        <>
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Create New Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Plan Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                <select value={form.planType} onChange={e => setForm({...form, planType: e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  {['FREE','SILVER','GOLD','VIP','VVIP'].map(t => <option key={t} value={t}>{planIcons[t]} {t}</option>)}
                </select>
                <input type="number" placeholder="Level (0-4)" value={form.level} onChange={e => setForm({...form, level: +e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                <input type="number" placeholder="Price (ETB)" value={form.price} onChange={e => setForm({...form, price: +e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                <input type="number" placeholder="Points Reward" value={form.pointsReward} onChange={e => setForm({...form, pointsReward: +e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                <input type="number" placeholder="Duration (days)" value={form.duration} onChange={e => setForm({...form, duration: +e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                <input type="number" placeholder="Extra Votes" value={form.extraVotes} onChange={e => setForm({...form, extraVotes: +e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                <input type="number" step="0.1" placeholder="Boost (1.0 = 100%)" value={form.leaderboardBoost} onChange={e => setForm({...form, leaderboardBoost: +e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
              <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 text-sm font-medium disabled:opacity-50 transition-all">
                {createMutation.isPending ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                  Loading plans...
                </div>
              </div>
            ) : data?.map((plan: Membership) => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  !plan.isActive ? 'opacity-50 grayscale' : 'border-gray-200 hover:border-indigo-300'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{planIcons[plan.planType] || '⭐'}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${planGradients[plan.planType] || 'from-gray-400 to-gray-500'}`}>
                    {plan.planType}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md">
                    Level {plan.level || 0}
                  </span>
                  {plan.pointsReward > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md flex items-center gap-1">
                      <span>⭐</span>
                      +{plan.pointsReward} pts
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {plan.price > 0 ? (
                      <span>
                        <span className="text-sm text-gray-500">ETB</span> {plan.price}
                      </span>
                    ) : (
                      <span className="text-green-600">Free</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{plan.duration} days access</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={12} className="text-green-600" />
                    </div>
                    <span>+{plan.extraVotes} extra votes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={12} className="text-green-600" />
                    </div>
                    <span>{plan.priorityTicket ? 'Priority tickets' : 'Standard tickets'}</span>
                  </div>
                  {plan.leaderboardBoost > 1.0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-green-600" />
                      </div>
                      <span>{plan.leaderboardBoost}x leaderboard boost</span>
                    </div>
                  )}
                  {plan.vipSeat && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-purple-600" />
                      </div>
                      <span>VIP Seat access</span>
                    </div>
                  )}
                  {plan.challengeAccess && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-blue-600" />
                      </div>
                      <span>Challenge access</span>
                    </div>
                  )}
                  {plan.communityAccess && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-indigo-600" />
                      </div>
                      <span>Community group</span>
                    </div>
                  )}
                </div>
                {!plan.isActive && (
                  <div className="mt-3 bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg font-medium text-center">
                    Inactive
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Members Tab Content */}
      {activeTab === 'members' && (
        <>
          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search by name, username, or email..."
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Plan Filter */}
              <div>
                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={memberFilter}
                    onChange={(e) => {
                      setMemberFilter(e.target.value);
                      setMemberPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="ALL">All Plans</option>
                    <option value="FREE">⚪ FREE</option>
                    <option value="SILVER">🥈 SILVER</option>
                    <option value="GOLD">🥇 GOLD</option>
                    <option value="VIP">💎 VIP</option>
                    <option value="VVIP">👑 VVIP</option>
                  </select>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setMemberPage(1);
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">✓ Active</option>
                  <option value="EXPIRED">✗ Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Icons
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {membersLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                          Loading members...
                        </div>
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <Users size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>No members found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((um: UserMembership) => (
                      <tr
                        key={um.id}
                        className="border-t border-gray-100 hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md bg-gradient-to-br ${planGradients[um.membership.planType]}`}>
                              {um.user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{um.user.fullName}</p>
                              <p className="text-xs text-gray-500">@{um.user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{planIcons[um.membership.planType]}</span>
                            <div>
                              <p className="font-bold text-sm text-gray-900">{um.membership.planType}</p>
                              <p className="text-xs text-gray-500">Level {um.membership.level}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Award size={16} className="text-amber-500" />
                            <span className="font-bold text-sm text-gray-900">{um.user.icons}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>{new Date(um.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(um.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${getStatusColor(um.expiresAt, um.isActive)}`}
                          >
                            {getStatusText(um.expiresAt, um.isActive)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {membersData?.pagination && membersData.pagination.totalPages > 1 && (
              <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-medium text-gray-600">
                  Total:{' '}
                  <span className="text-indigo-600 font-bold">{membersData.pagination.total}</span>{' '}
                  members
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                    disabled={memberPage === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-indigo-300 transition-all"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold">
                    {memberPage} / {membersData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setMemberPage((p) => p + 1)}
                    disabled={memberPage >= membersData.pagination.totalPages}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-indigo-300 transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
