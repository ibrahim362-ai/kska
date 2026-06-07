import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, X, Edit, Trash2, Eye, Calendar, Award, TrendingUp, Users, Gift } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  imageUrl?: string;
  points: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  maxResponses?: number;
  totalResponses: number;
  acceptCount: number;
  rejectCount: number;
  skipCount: number;
  creator: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ChallengeResponse {
  id: string;
  action: 'ACCEPT' | 'REJECT' | 'SKIP';
  content?: string;
  mediaUrl?: string;
  pointsAwarded: boolean;
  awardedAt?: string;
  awardedBy?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatar?: string;
    phone?: string;
    icons?: number;
  };
}

export default function ChallengesPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Challenge | null>(null);
  const [showDetail, setShowDetail] = useState<Challenge | null>(null);
  const [showResponses, setShowResponses] = useState<Challenge | null>(null);
  const [showAcceptors, setShowAcceptors] = useState<Challenge | null>(null);
  const [responsesPage, setResponsesPage] = useState(1);
  const [acceptorsPage, setAcceptorsPage] = useState(1);
  const [addPointsUser, setAddPointsUser] = useState<{id: string, responseId: string, name: string, currentPoints: number, pointsToAward: number} | null>(null);
  const [pointsForm, setPointsForm] = useState({ amount: '', reason: '' });
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'GENERAL',
    points: 10,
    startsAt: '',
    endsAt: '',
    maxResponses: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['challenges', page],
    queryFn: async () => {
      const { data } = await api.get('/challenges/admin/all', { params: { page, limit: 20 } });
      return data.data;
    },
  });

  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ['challenge-responses', showResponses?.id, responsesPage],
    queryFn: async () => {
      if (!showResponses?.id) return null;
      const { data } = await api.get(`/challenges/${showResponses.id}/responses`, {
        params: { page: responsesPage, limit: 50 },
      });
      return data.data;
    },
    enabled: !!showResponses,
  });

  const { data: acceptorsData, isLoading: acceptorsLoading } = useQuery({
    queryKey: ['challenge-acceptors', showAcceptors?.id, acceptorsPage],
    queryFn: async () => {
      if (!showAcceptors?.id) return null;
      const { data } = await api.get(`/challenges/${showAcceptors.id}/acceptors`, {
        params: { page: acceptorsPage, limit: 50 },
      });
      
      return data.data;
    },
    enabled: !!showAcceptors,
  });

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      const { data } = await api.post('/challenges', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setShowCreate(false);
      setForm({
        title: '',
        description: '',
        type: 'GENERAL',
        points: 10,
        startsAt: '',
        endsAt: '',
        maxResponses: '',
      });
      setCoverImage(null);
      setCreateError('');
    },
    onError: (err: any) => setCreateError(err?.response?.data?.message || 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => api.put(`/challenges/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setShowEdit(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/challenges/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges'] }),
  });

  const addPointsMutation = useMutation({
    mutationFn: async (responseId: string) => {
      const { data: result } = await api.post(`/challenges/responses/${responseId}/award`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-acceptors'] });
      setAddPointsUser(null);
      setPointsForm({ amount: '', reason: '' });
    },
  });

  const openEdit = (challenge: Challenge) => {
    setShowEdit(challenge);
    setForm({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      points: challenge.points,
      startsAt: challenge.startsAt,
      endsAt: challenge.endsAt,
      maxResponses: challenge.maxResponses?.toString() || '',
    });
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    INACTIVE: 'bg-gray-50 text-gray-700 border-gray-200',
    EXPIRED: 'bg-red-50 text-red-700 border-red-200',
  };

  const getStatus = (challenge: Challenge) => {
    const now = new Date();
    const starts = new Date(challenge.startsAt);
    const ends = new Date(challenge.endsAt);
    
    if (now > ends) return 'EXPIRED';
    if (!challenge.isActive) return 'INACTIVE';
    return 'ACTIVE';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Challenges</h1>
          <p className="text-gray-500 mt-1">Create and manage challenges for users</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-emerald-700 hover:to-green-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={18} /> Create Challenge
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Challenge</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                  {createError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Challenge title..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder="Challenge description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Points Award
                  </label>
                  <input
                    type="number"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: +e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="SPECIAL">Special</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Starts At *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ends At *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Responses (optional)
                </label>
                <input
                  type="number"
                  value={form.maxResponses}
                  onChange={(e) => setForm({ ...form, maxResponses: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    createMutation.mutate({
                      title: form.title,
                      description: form.description,
                      type: form.type,
                      points: parseInt(form.points.toString()),
                      startsAt: form.startsAt,
                      endsAt: form.endsAt,
                      ...(form.maxResponses && { maxResponses: parseInt(form.maxResponses) }),
                    });
                  }}
                  disabled={
                    createMutation.isPending || !form.title || !form.startsAt || !form.endsAt
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-green-700 disabled:opacity-50"
                >
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
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Challenge Details</h2>
              <button
                onClick={() => setShowDetail(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-3xl font-bold text-gray-900">{showDetail.title}</h3>
                  <span
                    className={`text-sm px-4 py-2 rounded-full font-bold border ${
                      statusColors[getStatus(showDetail)] ||
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {getStatus(showDetail)}
                  </span>
                </div>
                {showDetail.description && (
                  <p className="text-gray-600 mt-2 leading-relaxed">{showDetail.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                  <div className="text-sm font-semibold text-amber-700 mb-1 flex items-center gap-2">
                    <Award size={16} />
                    Points Award
                  </div>
                  <div className="text-3xl font-bold text-amber-900">{showDetail.points}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm font-semibold text-blue-700 mb-1">Challenge Type</div>
                  <div className="text-lg font-bold text-blue-900">{showDetail.type}</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-2">
                    <Calendar size={16} />
                    Starts
                  </div>
                  <div className="text-sm font-bold text-green-900">
                    {new Date(showDetail.startsAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="text-sm font-semibold text-purple-700 mb-1 flex items-center gap-2">
                    <Calendar size={16} />
                    Ends
                  </div>
                  <div className="text-sm font-bold text-purple-900">
                    {new Date(showDetail.endsAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{showDetail.acceptCount}</div>
                  <div className="text-xs text-green-700 font-medium">Accepted</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{showDetail.rejectCount}</div>
                  <div className="text-xs text-red-700 font-medium">Rejected</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{showDetail.skipCount}</div>
                  <div className="text-xs text-orange-700 font-medium">Skipped</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-3">Created By</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {showDetail.creator?.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{showDetail.creator?.fullName}</div>
                    <div className="text-sm text-gray-500">@{showDetail.creator?.username}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowResponses(showDetail);
                  setResponsesPage(1);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
              >
                <Users size={18} />
                All Responses ({showDetail.totalResponses})
              </button>
              <button
                onClick={() => {
                  setShowAcceptors(showDetail);
                  setAcceptorsPage(1);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Gift size={18} />
                Acceptors ({showDetail.acceptCount})
              </button>
              <button
                onClick={() => {
                  setShowDetail(null);
                  openEdit(showDetail);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responses Modal */}
      {showResponses && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Challenge Responses</h2>
                <p className="text-sm text-gray-500 mt-1">{showResponses.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowResponses(null);
                  setResponsesPage(1);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {responsesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-500 mt-4">Loading responses...</p>
                </div>
              ) : responsesData?.responses?.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No responses yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {responsesData?.responses?.map((response: ChallengeResponse) => (
                    <div
                      key={response.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0">
                          {response.user?.fullName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900">
                                {response.user?.fullName}
                              </h3>
                              <p className="text-sm text-gray-500">@{response.user?.username}</p>
                            </div>
                            <span
                              className={`text-xs px-3 py-1.5 rounded-full font-bold border flex-shrink-0 ${
                                response.action === 'ACCEPT'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : response.action === 'REJECT'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}
                            >
                              {response.action}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 rounded-lg p-2">
                              <span className="text-gray-500 text-xs">Email:</span>
                              <p className="font-medium text-gray-900 truncate">
                                {response.user?.email || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <span className="text-gray-500 text-xs">Phone:</span>
                              <p className="font-medium text-gray-900">
                                {response.user?.phone || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {response.content && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <span className="text-xs font-semibold text-blue-700 mb-1 block">
                                Response Content:
                              </span>
                              <p className="text-sm text-gray-700">{response.content}</p>
                            </div>
                          )}
                          {response.mediaUrl && (
                            <div className="mt-3">
                              <img
                                src={response.mediaUrl}
                                alt="Response media"
                                className="rounded-lg max-h-40 object-cover border border-gray-200"
                              />
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-400">
                            {new Date(response.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {responsesData?.pagination && responsesData.pagination.totalPages > 1 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Total:{' '}
                  <span className="text-emerald-600 font-bold">
                    {responsesData.pagination.total}
                  </span>{' '}
                  responses
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setResponsesPage((p) => Math.max(1, p - 1))}
                    disabled={responsesPage === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-emerald-300 transition-all"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold">
                    {responsesPage} / {responsesData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setResponsesPage((p) => p + 1)}
                    disabled={responsesPage >= responsesData.pagination.totalPages}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-emerald-300 transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acceptors Modal - Only users who accepted */}
      {showAcceptors && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Gift className="text-emerald-600" size={24} />
                  Challenge Acceptors
                </h2>
                <p className="text-sm text-gray-600 mt-1">{showAcceptors.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowAcceptors(null);
                  setAcceptorsPage(1);
                }}
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {acceptorsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-500 mt-4">Loading acceptors...</p>
                </div>
              ) : acceptorsData?.responses?.length === 0 ? (
                <div className="text-center py-12">
                  <Gift size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No one accepted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {acceptorsData?.responses?.map((response: ChallengeResponse) => (
                    <div
                      key={response.id}
                      className={`border-2 rounded-xl p-4 hover:shadow-md transition-all ${
                        response.pointsAwarded
                          ? 'border-yellow-300 bg-yellow-50/50'
                          : 'border-green-200 bg-green-50/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0 ${
                          response.pointsAwarded
                            ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                            : 'bg-gradient-to-br from-emerald-500 to-green-600'
                        }`}>
                          {response.user?.fullName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-gray-900">
                                  {response.user?.fullName}
                                </h3>
                                {response.pointsAwarded && (
                                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
                                    <Gift size={12} />
                                    Points Awarded
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">@{response.user?.username}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className={`border rounded-lg px-3 py-1.5 flex items-center gap-1.5 ${
                                response.pointsAwarded
                                  ? 'bg-yellow-100 border-yellow-300'
                                  : 'bg-amber-100 border-amber-300'
                              }`}>
                                <Award size={16} className={response.pointsAwarded ? 'text-yellow-600' : 'text-amber-600'} />
                                <span className={`font-bold ${
                                  response.pointsAwarded ? 'text-yellow-900' : 'text-amber-900'
                                }`}>
                                  {response.user?.icons || 0} points
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setAddPointsUser({
                                    id: response.user.id,
                                    responseId: response.id,
                                    name: response.user.fullName,
                                    currentPoints: response.user.icons || 0,
                                    pointsToAward: showAcceptors.points,
                                  });
                                }}
                                disabled={response.pointsAwarded}
                                className={`text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 shadow-md ${
                                  response.pointsAwarded
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-60'
                                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                                }`}
                                title={response.pointsAwarded ? 'Points already awarded' : 'Award challenge points'}
                              >
                                <Gift size={16} />
                                {response.pointsAwarded ? 'Awarded' : 'Award Points'}
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                              <span className="text-gray-500 text-xs font-medium">Email:</span>
                              <p className="font-semibold text-gray-900 truncate">
                                {response.user?.email || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                              <span className="text-gray-500 text-xs font-medium">Phone:</span>
                              <p className="font-semibold text-gray-900">
                                {response.user?.phone || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {response.content && (
                            <div className="bg-white border border-green-200 rounded-lg p-3 mb-2">
                              <span className="text-xs font-bold text-green-700 mb-1 block">
                                💬 Response Content:
                              </span>
                              <p className="text-sm text-gray-700">{response.content}</p>
                            </div>
                          )}
                          {response.mediaUrl && (
                            <div className="mb-2">
                              <img
                                src={response.mediaUrl}
                                alt="Response media"
                                className="rounded-lg max-h-40 object-cover border-2 border-green-200"
                              />
                            </div>
                          )}
                          <div className="text-xs text-gray-400 flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(response.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {acceptorsData?.pagination && acceptorsData.pagination.totalPages > 1 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Total:{' '}
                  <span className="text-emerald-600 font-bold">
                    {acceptorsData.pagination.total}
                  </span>{' '}
                  acceptors
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAcceptorsPage((p) => Math.max(1, p - 1))}
                    disabled={acceptorsPage === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-emerald-300 transition-all"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold">
                    {acceptorsPage} / {acceptorsData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setAcceptorsPage((p) => p + 1)}
                    disabled={acceptorsPage >= acceptorsData.pagination.totalPages}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-emerald-300 transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Award Points Confirmation Modal */}
      {addPointsUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Gift className="text-emerald-600" size={24} />
                Award Challenge Points
              </h2>
              <button
                onClick={() => {
                  setAddPointsUser(null);
                  setPointsForm({ amount: '', reason: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                  {addPointsUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{addPointsUser.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Award size={14} className="text-amber-600" />
                    <span className="font-semibold text-gray-700">
                      Current: {addPointsUser.currentPoints} points
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-emerald-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Points to Award:</span>
                  <span className="text-2xl font-bold text-emerald-600">+{addPointsUser.pointsToAward}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">New Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {addPointsUser.currentPoints + addPointsUser.pointsToAward} points
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                This will award <span className="font-bold">{addPointsUser.pointsToAward} points</span> to this user for completing the challenge. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAddPointsUser(null);
                  setPointsForm({ amount: '', reason: '' });
                }}
                className="flex-1 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (addPointsUser.responseId) {
                    addPointsMutation.mutate(addPointsUser.responseId);
                  }
                }}
                disabled={addPointsMutation.isPending}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addPointsMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Awarding...
                  </>
                ) : (
                  <>
                    <Gift size={16} />
                    Award Points
                  </>
                )}
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
              <h2 className="text-xl font-bold text-gray-900">Edit Challenge</h2>
              <button
                onClick={() => setShowEdit(null)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: +e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="SPECIAL">Special</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEdit(null)}
                  className="flex-1 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      id: showEdit.id,
                      title: form.title,
                      description: form.description,
                      points: form.points,
                      type: form.type,
                    })
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-green-700"
                >
                  Save
                </button>
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Challenge
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Creator
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Points
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Responses
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : data?.challenges?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No challenges yet. Create one to get started!
                  </td>
                </tr>
              ) : (
                data?.challenges?.map((challenge: Challenge) => (
                  <tr
                    key={challenge.id}
                    className="border-t border-gray-100 hover:bg-emerald-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{challenge.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {challenge.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                          {challenge.creator?.fullName?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {challenge.creator?.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-amber-500" />
                        <span className="text-sm font-bold text-gray-900">{challenge.points}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-green-600">{challenge.acceptCount}</span>
                          <span className="text-gray-500">accepted</span>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{
                              width: `${
                                challenge.totalResponses > 0
                                  ? (challenge.acceptCount / challenge.totalResponses) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                          statusColors[getStatus(challenge)] ||
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {getStatus(challenge)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowDetail(challenge)}
                          className="p-2 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-all group/btn"
                          title="View Details"
                        >
                          <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => openEdit(challenge)}
                          className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this challenge?'))
                              deleteMutation.mutate(challenge.id);
                          }}
                          className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data?.pagination && (
          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm font-medium text-gray-600">
              Total:{' '}
              <span className="text-emerald-600 font-bold">{data.pagination.total}</span> challenges
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-emerald-300 transition-all"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold">
                {page} / {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-emerald-300 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
