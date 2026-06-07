import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Check, X, Search, RotateCcw, Filter, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Refund {
  id: string;
  userId: string;
  purchaseId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
  };
  purchase: {
    id: string;
    ticketId: string;
    ticket: {
      id: string;
      title: string;
      price: number;
    };
  };
}

export default function RefundsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showDetailModal, setShowDetailModal] = useState<Refund | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['refunds', page, statusFilter],
    queryFn: async () => {
      const { data } = await api.get('/tickets/refunds/list', { 
        params: { 
          page, 
          limit: 20,
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
        } 
      });
      return data;
    },
  });

  const processMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/tickets/${id}/refund`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      setShowDetailModal(null);
    },
  });

  // Filter refunds by search locally
  const filteredRefunds = data?.data?.filter((refund: Refund) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      refund.user.fullName.toLowerCase().includes(search) ||
      refund.user.email.toLowerCase().includes(search) ||
      refund.purchase.ticket.title.toLowerCase().includes(search) ||
      refund.reason.toLowerCase().includes(search)
    );
  }) || [];

  // Calculate stats
  const stats = {
    total: data?.data?.length || 0,
    pending: data?.data?.filter((r: Refund) => r.status === 'PENDING').length || 0,
    approved: data?.data?.filter((r: Refund) => r.status === 'APPROVED').length || 0,
    rejected: data?.data?.filter((r: Refund) => r.status === 'REJECTED').length || 0,
    totalAmount: data?.data?.reduce((sum: number, r: Refund) => sum + r.amount, 0) || 0,
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };

  const statusIcons: Record<string, any> = {
    PENDING: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw size={28} className="text-orange-600" />
            Refund Requests
          </h1>
          <p className="text-gray-500 mt-1">Review and process ticket refund requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Requests</span>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <RotateCcw size={20} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pending</span>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Approved</span>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Rejected</span>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Amount</span>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">ETB {stats.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user name, email, ticket, or reason..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">⏳ Pending</option>
                <option value="APPROVED">✓ Approved</option>
                <option value="REJECTED">✗ Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Refunds Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                      Loading refund requests...
                    </div>
                  </td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <RotateCcw size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No refund requests found</p>
                    {searchQuery && <p className="text-sm mt-1">Try adjusting your search</p>}
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((refund: Refund) => {
                  const StatusIcon = statusIcons[refund.status];
                  return (
                    <tr key={refund.id} className="border-t border-gray-100 hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {refund.user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{refund.user.fullName}</p>
                            <p className="text-xs text-gray-500">@{refund.user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{refund.purchase.ticket.title}</p>
                          <p className="text-xs text-gray-500">Original: ETB {refund.purchase.ticket.price}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={16} className="text-green-600" />
                          <span className="font-bold text-sm text-gray-900">ETB {refund.amount.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={refund.reason}>
                          {refund.reason}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border flex items-center gap-1.5 w-fit ${statusColors[refund.status]}`}>
                          <StatusIcon size={12} />
                          {refund.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{new Date(refund.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowDetailModal(refund)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {refund.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => processMutation.mutate({ id: refund.id, status: 'APPROVED' })}
                                className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                title="Approve"
                                disabled={processMutation.isPending}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => processMutation.mutate({ id: refund.id, status: 'REJECTED' })}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                title="Reject"
                                disabled={processMutation.isPending}
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm font-medium text-gray-600">
              Total: <span className="text-orange-600 font-bold">{data.meta.total}</span> refund requests
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-orange-300 transition-all"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-sm font-bold">
                {page} / {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.meta.totalPages}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-white hover:border-orange-300 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <RotateCcw size={24} className="text-orange-600" />
                  Refund Request Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">Review and process this request</p>
              </div>
              <button
                onClick={() => setShowDetailModal(null)}
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                {(() => {
                  const StatusIcon = statusIcons[showDetailModal.status];
                  return (
                    <span className={`text-sm px-6 py-3 rounded-full font-bold border-2 flex items-center gap-2 ${statusColors[showDetailModal.status]}`}>
                      <StatusIcon size={20} />
                      {showDetailModal.status}
                    </span>
                  );
                })()}
              </div>

              {/* User Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">👤</span>
                  </div>
                  User Information
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {showDetailModal.user.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{showDetailModal.user.fullName}</p>
                    <p className="text-sm text-gray-600">@{showDetailModal.user.username}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Email:</span> {showDetailModal.user.email}
                </p>
              </div>

              {/* Ticket Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🎫</span>
                  </div>
                  Ticket Information
                </h3>
                <p className="font-bold text-gray-900 mb-2">{showDetailModal.purchase.ticket.title}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="font-bold text-gray-900">ETB {showDetailModal.purchase.ticket.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Refund Amount */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-600" />
                  Refund Amount
                </h3>
                <p className="text-3xl font-bold text-green-600">ETB {showDetailModal.amount.toFixed(2)}</p>
              </div>

              {/* Reason */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  Refund Reason
                </h3>
                <p className="text-gray-700 leading-relaxed">{showDetailModal.reason}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Requested At</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(showDetailModal.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(showDetailModal.updatedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {showDetailModal.status === 'PENDING' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowDetailModal(null)}
                  className="flex-1 border-2 border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => processMutation.mutate({ id: showDetailModal.id, status: 'REJECTED' })}
                  disabled={processMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-red-700 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  {processMutation.isPending ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => processMutation.mutate({ id: showDetailModal.id, status: 'APPROVED' })}
                  disabled={processMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {processMutation.isPending ? 'Processing...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
