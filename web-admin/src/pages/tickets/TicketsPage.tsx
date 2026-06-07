import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Ticket } from '../../types';
import { MapPin, Calendar, TicketIcon, Trash2, Plus, X, Edit, Users, Eye, ExternalLink } from 'lucide-react';

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Ticket | null>(null);
  const [showDetail, setShowDetail] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    price: 0, 
    quantity: 100, 
    eventDate: '', 
    location: '',
    hasVipOption: false,
    vipPrice: 0,
    vipPoints: 30,
    discount: 0,
    familyTicket: false,
    maxFamilyMembers: 5,
    pointsReward: 0
  });
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
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['tickets'] }); 
      setShowCreate(false); 
      setForm({ 
        title: '', 
        description: '', 
        price: 0, 
        quantity: 100, 
        eventDate: '', 
        location: '',
        hasVipOption: false,
        vipPrice: 0,
        vipPoints: 30,
        discount: 0,
        familyTicket: false,
        maxFamilyMembers: 5,
        pointsReward: 0
      }); 
      setCoverImage(null); 
      setCreateError(''); 
    },
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
              
              {/* VIP Option */}
              <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/30">
                <div className="flex items-center gap-2 mb-3">
                  <input 
                    type="checkbox" 
                    checked={form.hasVipOption} 
                    onChange={e => setForm({ ...form, hasVipOption: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label className="text-sm font-semibold text-purple-700">Enable VIP Ticket Option</label>
                </div>
                {form.hasVipOption && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-purple-700 mb-1">VIP Price (ETB)</label>
                      <input type="number" value={form.vipPrice} onChange={e => setForm({ ...form, vipPrice: +e.target.value })}
                        className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-purple-700 mb-1">VIP Points Reward</label>
                      <input type="number" value={form.vipPoints} onChange={e => setForm({ ...form, vipPoints: +e.target.value })}
                        className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="30" />
                    </div>
                  </div>
                )}
              </div>

              {/* Family Ticket */}
              <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
                <div className="flex items-center gap-2 mb-3">
                  <input 
                    type="checkbox" 
                    checked={form.familyTicket} 
                    onChange={e => setForm({ ...form, familyTicket: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-semibold text-blue-700">Family Ticket (multiple members)</label>
                </div>
                {form.familyTicket && (
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Max Family Members</label>
                    <input type="number" value={form.maxFamilyMembers} onChange={e => setForm({ ...form, maxFamilyMembers: +e.target.value })}
                      className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5" />
                  </div>
                )}
              </div>

              {/* Discount & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                  <input type="number" min="0" max="100" value={form.discount} onChange={e => setForm({ ...form, discount: +e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Points Reward (Regular)</label>
                  <input type="number" value={form.pointsReward} onChange={e => setForm({ ...form, pointsReward: +e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button 
                  onClick={() => {
                    const formData = new FormData();
                    formData.append('title', form.title);
                    if (form.description) formData.append('description', form.description);
                    formData.append('price', form.price.toString());
                    formData.append('quantity', form.quantity.toString());
                    formData.append('eventDate', form.eventDate);
                    if (form.location) formData.append('location', form.location);
                    
                    // VIP options
                    formData.append('hasVipOption', form.hasVipOption.toString());
                    if (form.hasVipOption) {
                      formData.append('vipPrice', form.vipPrice.toString());
                      formData.append('vipPoints', form.vipPoints.toString());
                    }
                    
                    // Family ticket
                    formData.append('familyTicket', form.familyTicket.toString());
                    if (form.familyTicket) {
                      formData.append('maxFamilyMembers', form.maxFamilyMembers.toString());
                    }
                    
                    // Discount and points
                    formData.append('discount', form.discount.toString());
                    formData.append('pointsReward', form.pointsReward.toString());
                    
                    if (coverImage) formData.append('coverImage', coverImage);
                    createMutation.mutate(formData);
                  }} 
                  disabled={createMutation.isPending || !form.title || !form.eventDate}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50">
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
              <button onClick={() => setShowDetail(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Cover Image */}
              {showDetail.coverImage && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img 
                    src={showDetail.coverImage} 
                    alt={showDetail.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Title & Status */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-3xl font-bold text-gray-900">{showDetail.title}</h3>
                  <span className={`text-sm px-4 py-2 rounded-full font-bold border ${statusColors[showDetail.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {showDetail.status}
                  </span>
                </div>
                {showDetail.description && (
                  <p className="text-gray-600 mt-2 leading-relaxed">{showDetail.description}</p>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Price */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="text-sm font-semibold text-green-700 mb-1">Regular Price</div>
                  <div className="text-2xl font-bold text-green-900">
                    {showDetail.price > 0 ? `ETB ${showDetail.price.toFixed(2)}` : 'FREE'}
                  </div>
                  {showDetail.discount > 0 && (
                    <div className="mt-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
                      {showDetail.discount}% OFF
                    </div>
                  )}
                </div>

                {/* VIP Price */}
                {showDetail.hasVipOption && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <div className="text-sm font-semibold text-purple-700 mb-1">VIP Price</div>
                    <div className="text-2xl font-bold text-purple-900">
                      ETB {(showDetail.vipPrice || showDetail.price).toFixed(2)}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-purple-600">
                      +{showDetail.vipPoints} points reward
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm font-semibold text-blue-700 mb-1">Availability</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {showDetail.quantity - showDetail.soldCount} / {showDetail.quantity}
                  </div>
                  <div className="mt-2">
                    <div className="bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(showDetail.soldCount / showDetail.quantity) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">
                      {Math.round((showDetail.soldCount / showDetail.quantity) * 100)}% sold
                    </div>
                  </div>
                </div>

                {/* Points Reward */}
                {showDetail.pointsReward > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                    <div className="text-sm font-semibold text-amber-700 mb-1">Points Reward</div>
                    <div className="text-2xl font-bold text-amber-900">
                      +{showDetail.pointsReward} points
                    </div>
                    <div className="mt-1 text-xs text-amber-600">
                      For regular purchase
                    </div>
                  </div>
                )}

                {/* Event Date */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="text-sm font-semibold text-purple-700 mb-1 flex items-center gap-2">
                    <Calendar size={16} />
                    Event Date
                  </div>
                  <div className="text-lg font-bold text-purple-900">
                    {new Date(showDetail.eventDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                {/* Location */}
                {showDetail.location && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                    <div className="text-sm font-semibold text-orange-700 mb-1 flex items-center gap-2">
                      <MapPin size={16} />
                      Location
                    </div>
                    <div className="text-lg font-bold text-orange-900">
                      {showDetail.location}
                    </div>
                  </div>
                )}
              </div>

              {/* Special Features */}
              {(showDetail.familyTicket || showDetail.hasVipOption) && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200 mb-6">
                  <div className="text-sm font-semibold text-indigo-700 mb-3">Special Features</div>
                  <div className="flex flex-wrap gap-2">
                    {showDetail.hasVipOption && (
                      <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                        ⭐ VIP Option Available
                      </span>
                    )}
                    {showDetail.familyTicket && (
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                        👨‍👩‍👧‍👦 Family Ticket (max {showDetail.maxFamilyMembers} members)
                      </span>
                    )}
                    {showDetail.discount > 0 && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                        🎉 {showDetail.discount}% Discount
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Creator Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-3">Created By</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {showDetail.creator?.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{showDetail.creator?.fullName}</div>
                    <div className="text-sm text-gray-500">@{showDetail.creator?.username}</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-indigo-600">{showDetail.soldCount}</div>
                  <div className="text-xs text-gray-600 font-medium">Sold</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{showDetail.quantity - showDetail.soldCount}</div>
                  <div className="text-xs text-gray-600 font-medium">Available</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-orange-600">ETB {(showDetail.soldCount * showDetail.price).toFixed(0)}</div>
                  <div className="text-xs text-gray-600 font-medium">Revenue</div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button 
                onClick={() => { setShowDetail(null); openEdit(showDetail); }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit Ticket
              </button>
              <button 
                onClick={() => setShowDetail(null)}
                className="flex-1 border-2 border-gray-300 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all"
              >
                Close
              </button>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Cover Image Thumbnail */}
                      {ticket.coverImage ? (
                        <img 
                          src={ticket.coverImage} 
                          alt={ticket.title}
                          className="w-16 h-16 rounded-lg object-cover shadow-md border-2 border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23e5e7eb" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24"%3E🎫%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-md border-2 border-indigo-200">
                          <TicketIcon size={24} className="text-indigo-600" />
                        </div>
                      )}
                      {/* Title & Location */}
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{ticket.title}</p>
                        {ticket.location && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} className="text-orange-500" />{ticket.location}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">{ticket.creator?.fullName?.charAt(0) || '?'}</div><span className="text-sm font-medium text-gray-700">{ticket.creator?.fullName}</span></div></td>
                  <td className="px-6 py-4"><span className="text-sm font-bold text-gray-900">{ticket.price > 0 ? `ETB ${ticket.price}` : <span className="text-green-600">Free</span>}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]"><div className={`h-2 rounded-full ${(ticket.soldCount / ticket.quantity) > 0.8 ? 'bg-red-500' : (ticket.soldCount / ticket.quantity) > 0.5 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${(ticket.soldCount / ticket.quantity) * 100}%` }} /></div><span className="text-xs font-medium text-gray-600">{ticket.soldCount}/{ticket.quantity}</span></div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-600"><Calendar size={16} className="text-indigo-500" />{new Date(ticket.eventDate).toLocaleDateString()}</div></td>
                  <td className="px-6 py-4"><span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statusColors[ticket.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{ticket.status}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setShowDetail(ticket)} 
                      className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-all group/btn"
                      title="View Details"
                    >
                      <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button onClick={() => openEdit(ticket)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-all" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => { if (confirm('Delete ticket?')) deleteMutation.mutate(ticket.id); }} className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-all" title="Delete">
                      <Trash2 size={16} />
                    </button>
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
