import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Post } from '../../types';
import { Search, Trash2, Eye, Heart, MessageCircle, Plus, X, Image } from 'lucide-react';

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: 'TEXT', title: '', content: '', hashtags: '' });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page, type],
    queryFn: async () => {
      const { data } = await api.get('/posts', { params: { page, limit: 20, type: type || undefined } });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      if (mediaFile) {
        const fd = new FormData();
        fd.append('type', body.type);
        fd.append('title', body.title);
        fd.append('content', body.content);
        fd.append('hashtags', body.hashtags);
        fd.append('media', mediaFile);
        return api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      return api.post('/posts', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShowCreate(false);
      setForm({ type: 'TEXT', title: '', content: '', hashtags: '' });
      setMediaFile(null);
    },
  });

  const typeColors: Record<string, string> = {
    TEXT: 'bg-gray-100 text-gray-700 border-gray-200', 
    IMAGE: 'bg-blue-100 text-blue-700 border-blue-200',
    VIDEO: 'bg-purple-100 text-purple-700 border-purple-200', 
    EVENT: 'bg-green-100 text-green-700 border-green-200',
    ANNOUNCEMENT: 'bg-red-100 text-red-700 border-red-200', 
    VOTE_POST: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-500 mt-1">Manage all community posts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus size={18} /> Create Post
        </button>
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter title..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  rows={4} placeholder="Write description..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image (optional)</label>
                <input type="file" accept="image/*" onChange={e => setMediaFile(e.target.files?.[0] || null)}
                  className="w-full text-sm border-2 border-gray-200 rounded-xl p-2 focus:outline-none" />
                {mediaFile && <p className="text-xs text-green-600 mt-1">✅ {mediaFile.name}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {createMutation.isPending ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search posts..."
              className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Post</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stats</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                    Loading posts...
                  </div>
                </td></tr>
              ) : data?.data?.map((post: Post) => (
                <tr key={post.id} className="border-t border-gray-100 hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-gray-900 truncate font-medium">{post.title || post.content || '(No content)'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {post.user?.fullName?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{post.user?.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Heart size={16} className="text-red-500" />
                        <span className="font-medium">{post._count.likes}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-sm">
                        <MessageCircle size={16} className="text-blue-500" />
                        <span className="font-medium">{post._count.comments}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-sm">
                        <Eye size={16} className="text-gray-400" />
                        <span className="font-medium">{post.viewCount}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { if (confirm('Delete post?')) deleteMutation.mutate(post.id); }}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.meta && (
          <div className="p-6 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Total: <span className="text-indigo-600">{data.meta.total}</span> posts</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors">
                Prev
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">{page} / {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.meta.totalPages}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
