import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Vote } from '../../types';
import { Clock, CheckCircle, XCircle, BarChart3, Trash2, Plus, X, Edit, Power, Eye } from 'lucide-react';

export default function VotesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', voteType: 'FREE_VOTE', startsAt: '', endsAt: '', options: ['', ''] });
  const [createError, setCreateError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['votes', page],
    queryFn: async () => {
      const { data } = await api.get('/votes', { params: { page, limit: 20 } });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/votes', { 
      ...body, 
      options: body.options.filter((o: string) => o).map((t: string) => ({ text: t })), 
      startsAt: new Date(body.startsAt).toISOString(), 
      endsAt: new Date(body.endsAt).toISOString(),
      isLive: true, // Automatically set to live when created
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['votes'] }); setShowCreate(false); setForm({ title: '', description: '', voteType: 'FREE_VOTE', startsAt: '', endsAt: '', options: ['', ''] }); setCreateError(''); },
    onError: (err: any) => { setCreateError(err?.response?.data?.message || 'Failed to create vote'); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isLive }: { id: string; isLive: boolean }) => api.put(`/votes/${id}`, { isLive: !isLive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['votes'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/votes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['votes'] }),
  });

  const addOption = () => { if (form.options.length < 10) setForm({ ...form, options: [...form.options, ''] }); };
  const updateOption = (i: number, v: string) => { const opts = [...form.options]; opts[i] = v; setForm({ ...form, options: opts }); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Votes</h1>
          <p className="text-gray-500 mt-1">Manage KSKA voting polls</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all">
          <Plus size={18} /> Create Vote
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Vote</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {createError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{createError}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Vote title..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} placeholder="Describe the vote..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select value={form.voteType} onChange={e => setForm({ ...form, voteType: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="FREE_VOTE">Free Vote</option>
                  <option value="PAID_VOTE">Paid Vote</option>
                  <option value="PREMIUM_MEMBER_VOTE">Premium Member Vote</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Options</label>
                  <button onClick={addOption} className="text-indigo-600 text-sm font-medium hover:text-indigo-700">+ Add option</button>
                </div>
                {form.options.map((opt, i) => (
                  <input key={i} type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2" placeholder={`Option ${i + 1}`} />
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title || form.options.filter(o => o).length < 2}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50">Create Vote</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Votes</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ends</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2"><div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>Loading...</div>
                </td></tr>
              ) : data?.data?.map((vote: Vote) => (
                <tr key={vote.id} className="border-t border-gray-100 hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4"><span className="font-semibold text-sm text-gray-900">{vote.title}</span></td>
                  <td className="px-6 py-4"><span className="text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">{vote.voteType}</span></td>
                  <td className="px-6 py-4">{vote.isActive ? <span className="text-xs text-green-700 flex items-center gap-1.5 font-medium bg-green-50 px-3 py-1.5 rounded-full border border-green-200 w-fit"><CheckCircle size={14} /> Active</span> : <span className="text-xs text-gray-600 flex items-center gap-1.5 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 w-fit"><XCircle size={14} /> Ended</span>}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md"><span className="text-white font-bold text-sm">{vote.totalVotes}</span></div><span className="text-xs text-gray-500">votes</span></div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-600"><Clock size={16} className="text-orange-500" />{new Date(vote.endsAt).toLocaleDateString()}</div></td>
                  <td className="px-6 py-4"><div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/votes/${vote.id}`)}
                      className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-all" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => toggleMutation.mutate({ id: vote.id, isLive: vote.isActive })}
                      className={`p-2 rounded-xl transition-all ${vote.isActive ? 'hover:bg-green-50 text-green-600' : 'hover:bg-indigo-50 text-indigo-600'}`} title={vote.isActive ? 'Deactivate' : 'Activate'}>
                      <Power size={16} />
                    </button>
                    <button onClick={() => { if (confirm('Delete vote?')) deleteMutation.mutate(vote.id); }}
                      className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-all"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.meta && (
          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm font-medium text-gray-600">Total: <span className="text-indigo-600 font-bold">{data.meta.total}</span> votes</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-indigo-300 transition-all">← Prev</button>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold">{page} / {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.meta.totalPages} className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-indigo-300 transition-all">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
