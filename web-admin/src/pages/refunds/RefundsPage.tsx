import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Check, X, Search, RotateCcw } from 'lucide-react';

export default function RefundsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['refunds', page],
    queryFn: async () => {
      const { data } = await api.get('/tickets/refunds/list', { params: { page, limit: 20 } });
      return data;
    },
  });

  const processMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/tickets/${id}/refund`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['refunds'] }),
  });

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700', APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700', DISMISSED: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <RotateCcw size={24} /> Refund Requests
      </h1>
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ticket</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Reason</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : data?.data?.map((refund: any) => (
                <tr key={refund.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{refund.user?.fullName}</td>
                  <td className="px-4 py-3 text-sm">{refund.purchase?.ticket?.title || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium">ETB {refund.amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{refund.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[refund.status] || 'bg-gray-100'}`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(refund.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {refund.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => processMutation.mutate({ id: refund.id, status: 'APPROVED' })}
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600"><Check size={16} /></button>
                        <button onClick={() => processMutation.mutate({ id: refund.id, status: 'REJECTED' })}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"><X size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.meta && (
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">Total: {data.meta.total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
              <span className="px-3 py-1 text-sm">{page} / {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.meta.totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
