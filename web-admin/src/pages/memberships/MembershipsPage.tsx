import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Membership } from '../../types';
import { Crown, Plus, CheckCircle } from 'lucide-react';

export default function MembershipsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', planType: 'FREE', price: 0, duration: 30, badgeIcon: '', extraVotes: 0, priorityTicket: false, leaderboardBoost: 1.0 });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['memberships'],
    queryFn: async () => {
      const { data } = await api.get('/memberships');
      return data.data as Membership[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/memberships', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['memberships'] }); setShowForm(false); },
  });

  const planIcons: Record<string, string> = { FREE: '⚪', SILVER: '🥈', GOLD: '🥇', VIP: '💎' };
  const planGradients: Record<string, string> = {
    FREE: 'from-gray-400 to-gray-500',
    SILVER: 'from-gray-300 to-gray-400',
    GOLD: 'from-yellow-400 to-amber-500',
    VIP: 'from-purple-500 to-pink-600'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-500 mt-1">Manage subscription tiers and benefits</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
          <Plus size={18} /> New Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">Create New Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Plan Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
            <select value={form.planType} onChange={e => setForm({...form, planType: e.target.value})}
              className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              {['FREE','SILVER','GOLD','VIP'].map(t => <option key={t} value={t}>{planIcons[t]} {t}</option>)}
            </select>
            <input type="number" placeholder="Price (ETB)" value={form.price} onChange={e => setForm({...form, price: +e.target.value})}
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
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={12} className="text-green-600" />
                </div>
                <span>{plan.leaderboardBoost}x boost</span>
              </div>
            </div>
            {!plan.isActive && (
              <div className="mt-3 bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg font-medium text-center">
                Inactive
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
