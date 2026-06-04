import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Ticket } from '../../types';
import { MapPin, Calendar, TicketIcon, Trash2, Plus, X, Edit, Users } from 'lucide-react';

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ title: '', description: '', price: 0, quantity: 100, eventDate: '', location: '' });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', page],
    queryFn: async () => {
      const { data } = await api.get('/tickets', { params: { page, limit: 20 } });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/tickets', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); setShowCreate(false); setForm({ title: '', description: '', price: 0, quantity: 100, eventDate: '', location: '' }); setCoverImage(null); setCreateError(''); },
    onError: (err: any) => setCreateError(err?.response?.data?.message || 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => api.put(`/tickets/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); setShowEdit(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tickets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const openEdit = (ticket: Ticket) => {
    setShowEdit(ticket);
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    SOLD_OUT: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Tickets</h1>
          <p className="text-gray-500 mt-1">Manage all event tickets</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all">
          <Plus size={18} /> Create Ticket
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Ticket</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {createError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{createError}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                <input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)}
                  className="w-full text-sm border-2 border-gray-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {coverImage && <p className="text-xs text-green-600 mt-1">✅ {coverImage.name}</p>}
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Event title..." /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} placeholder="Event description..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Price (ETB)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="100" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
                <input type="datetime-local" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Event location..." /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title || !form.eventDate}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Ticket</h2>
              <button onClick={() => setShowEdit(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input type="text" defaultValue={showEdit.title} onChange={e => setShowEdit({ ...showEdit, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea defaultValue={showEdit.description} onChange={e => setShowEdit({ ...showEdit, description: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Price (ETB)</label>
                  <input type="number" defaultValue={showEdit.price} onChange={e => setShowEdit({ ...showEdit, price: +e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input type="number" defaultValue={showEdit.quantity} onChange={e => setShowEdit({ ...showEdit, quantity: +e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input type="text" defaultValue={showEdit.location} onChange={e => setShowEdit({ ...showEdit, location: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEdit(null)} className="flex-1 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={() => updateMutation.mutate({ id: showEdit.id, title: showEdit.title, description: showEdit.description, price: showEdit.price, quantity: showEdit.quantity, location: showEdit.location })}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700">Save</button>
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Creator</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Available</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400"><div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" /></td></tr>
              ) : data?.data?.map((ticket: Ticket) => (
                <tr key={ticket.id} className="border-t border-gray-100 hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4"><div><p className="font-semibold text-sm text-gray-900">{ticket.title}</p>
                    {ticket.location && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} className="text-orange-500" />{ticket.location}</p>}</div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">{ticket.creator?.fullName?.charAt(0) || '?'}</div><span className="text-sm font-medium text-gray-700">{ticket.creator?.fullName}</span></div></td>
                  <td className="px-6 py-4"><span className="text-sm font-bold text-gray-900">{ticket.price > 0 ? `ETB ${ticket.price}` : <span className="text-green-600">Free</span>}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]"><div className={`h-2 rounded-full ${(ticket.soldCount / ticket.quantity) > 0.8 ? 'bg-red-500' : (ticket.soldCount / ticket.quantity) > 0.5 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${(ticket.soldCount / ticket.quantity) * 100}%` }} /></div><span className="text-xs font-medium text-gray-600">{ticket.soldCount}/{ticket.quantity}</span></div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-600"><Calendar size={16} className="text-indigo-500" />{new Date(ticket.eventDate).toLocaleDateString()}</div></td>
                  <td className="px-6 py-4"><span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statusColors[ticket.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{ticket.status}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(ticket)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-all"><Edit size={16} /></button>
                    <button onClick={() => { if (confirm('Delete ticket?')) deleteMutation.mutate(ticket.id); }} className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-all"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.meta && (
          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm font-medium text-gray-600">Total: <span className="text-indigo-600 font-bold">{data.meta.total}</span> tickets</span>
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
