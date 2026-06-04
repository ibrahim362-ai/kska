import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Payment, ManualPaymentProof } from '../../types';
import { DollarSign, Check, X, Image as ImageIcon, FileText, ExternalLink, Eye, X as XIcon } from 'lucide-react';

type Tab = 'transactions' | 'proofs';

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>('proofs');
  const [page, setPage] = useState(1);
  const [proofStatus, setProofStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [reviewModal, setReviewModal] = useState<ManualPaymentProof | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [imageModal, setImageModal] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // ---------- Transactions tab ----------
  const transactionsQuery = useQuery({
    queryKey: ['payments', page],
    queryFn: async () => {
      const { data } = await api.get('/payments', { params: { page, limit: 20 } });
      return data;
    },
    enabled: tab === 'transactions',
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/payments/${id}/confirm`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });

  // ---------- Proofs tab ----------
  const proofsQuery = useQuery({
    queryKey: ['manual-proofs', proofStatus, page],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (proofStatus !== 'ALL') params.status = proofStatus;
      const { data } = await api.get('/manual-payments/proofs', { params });
      return data;
    },
    enabled: tab === 'proofs',
  });

  const reviewMutation = useMutation({
    mutationFn: ({ proofId, decision, rejectionReason }: {
      proofId: string;
      decision: 'APPROVED' | 'REJECTED';
      rejectionReason?: string;
    }) => api.put(`/manual-payments/proofs/${proofId}/review`, { decision, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-proofs'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setReviewModal(null);
      setRejectionReason('');
    },
  });

  const handleReview = (proof: ManualPaymentProof, decision: 'APPROVED' | 'REJECTED') => {
    if (decision === 'REJECTED' && !rejectionReason.trim()) {
      setReviewModal(proof);
      return;
    }
    reviewMutation.mutate({ proofId: proof.id, decision, rejectionReason });
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Transaction history & manual payment approvals</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
          <DollarSign size={18} className="text-emerald-600" />
          <span className="text-sm font-medium text-gray-700">
            {tab === 'proofs' ? proofsQuery.data?.meta?.total || 0 : transactionsQuery.data?.meta?.total || 0} {tab === 'proofs' ? 'Proofs' : 'Payments'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setTab('proofs'); setPage(1); }}
          className={`px-4 py-2 text-sm font-semibold transition-all ${
            tab === 'proofs'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manual Payment Proofs
        </button>
        <button
          onClick={() => { setTab('transactions'); setPage(1); }}
          className={`px-4 py-2 text-sm font-semibold transition-all ${
            tab === 'transactions'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Transactions
        </button>
      </div>

      {tab === 'proofs' && (
        <>
          {/* Status filter */}
          <div className="flex gap-2">
            {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setProofStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  proofStatus === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Receipt</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Sender</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proofsQuery.isLoading ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
                  ) : proofsQuery.data?.data?.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">No proofs found</td></tr>
                  ) : proofsQuery.data?.data?.map((proof: ManualPaymentProof) => (
                    <tr key={proof.id} className="border-t border-gray-100 hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setImageModal(proof.receiptUrl)}
                          className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-indigo-500 transition-all"
                          title="View receipt"
                        >
                          <img
                            src={proof.receiptUrl}
                            alt="Receipt"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>';
                            }}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-700">{proof.user?.fullName}</div>
                        <div className="text-xs text-gray-500">{proof.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-600">{proof.payment.reference}</div>
                        <div className="text-sm font-bold text-emerald-600">
                          {proof.payment.currency} {proof.payment.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{proof.senderName}</div>
                        {proof.senderPhone && (
                          <div className="text-xs text-gray-500">{proof.senderPhone}</div>
                        )}
                        {proof.transactionRef && (
                          <div className="text-xs text-gray-500 font-mono">Ref: {proof.transactionRef}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statusColors[proof.status]}`}>
                          {proof.status}
                        </span>
                        {proof.rejectionReason && (
                          <div className="text-xs text-red-600 mt-1 max-w-[150px] truncate" title={proof.rejectionReason}>
                            {proof.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(proof.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {proof.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReview(proof, 'APPROVED')}
                              disabled={reviewMutation.isPending}
                              className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all text-xs font-semibold border border-green-200 disabled:opacity-50"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => setReviewModal(proof)}
                              disabled={reviewMutation.isPending}
                              className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-all text-xs font-semibold border border-red-200 disabled:opacity-50"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {proofsQuery.data?.meta && proofsQuery.data.meta.totalPages > 1 && (
              <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-medium text-gray-600">
                  Page {proofsQuery.data.meta.page} of {proofsQuery.data.meta.totalPages}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50">
                    ← Prev
                  </button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= proofsQuery.data.meta.totalPages}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'transactions' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Reference</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Method</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactionsQuery.isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
                ) : transactionsQuery.data?.data?.map((payment: Payment) => (
                  <tr key={payment.id} className="border-t border-gray-100 hover:bg-indigo-50/30">
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{payment.reference}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{payment.user?.fullName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-blue-700">{payment.method}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${statusColors[payment.status]}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection reason modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Reject Payment Proof</h3>
              <button onClick={() => { setReviewModal(null); setRejectionReason(''); }}>
                <XIcon size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Please provide a reason. The user will see this in their email.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Receipt is unclear, amount doesn't match, account number invalid..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-200"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setReviewModal(null); setRejectionReason(''); }}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(reviewModal, 'REJECTED')}
                disabled={!rejectionReason.trim() || reviewMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setImageModal(null)}>
          <button
            onClick={() => setImageModal(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <XIcon size={24} />
          </button>
          <img src={imageModal} alt="Receipt full view" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
