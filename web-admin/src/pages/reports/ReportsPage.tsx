import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Report } from '../../types';
import { Flag, Check, X } from 'lucide-react';

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reports', page],
    queryFn: async () => {
      const { data } = await api.get('/posts/reports/list', { params: { page, limit: 20 } });
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/posts/reports/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  const reportStatusColors: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    RESOLVED: 'bg-green-50 text-green-700 border-green-200',
    DISMISSED: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Review and manage content reports</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
          <Flag size={18} className="text-red-600" />
          <span className="text-sm font-medium text-gray-700">{data?.meta?.total || 0} Reports</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Reporter</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Post Content</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                    Loading reports...
                  </div>
                </td></tr>
              ) : data?.data?.map((report: Report) => (
                <tr key={report.id} className="border-t border-gray-100 hover:bg-red-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-md group-hover:scale-110 transition-transform">
                        {report.reporter?.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{report.reporter?.fullName}</p>
                        <p className="text-xs text-gray-500">@{report.reporter?.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Flag size={16} className="text-red-500" />
                      <span className="text-sm font-medium text-gray-700">{report.reason}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">
                      {report.post?.content || <span className="text-gray-400 italic">No content</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${reportStatusColors[report.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {report.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => updateMutation.mutate({ id: report.id, status: 'RESOLVED' })}
                          className="p-2 rounded-xl hover:bg-green-50 text-green-600 transition-all"
                          title="Resolve">
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => updateMutation.mutate({ id: report.id, status: 'DISMISSED' })}
                          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all"
                          title="Dismiss">
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.meta && (
          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm font-medium text-gray-600">
              Total: <span className="text-indigo-600 font-bold">{data.meta.total}</span> reports
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-indigo-300 transition-all">
                ← Prev
              </button>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold">{page} / {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.meta.totalPages}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-indigo-300 transition-all">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
