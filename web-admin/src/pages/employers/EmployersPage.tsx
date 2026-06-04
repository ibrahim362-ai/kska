import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { User } from '../../types';
import { Search, Trash2, X, UserPlus, Copy, Eye, EyeOff, Pencil, Check, Key } from 'lucide-react';

function generateUsername(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 8);
  const id = crypto.randomUUID().split('-')[0];
  return `${base}_${id}`;
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function EmployersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<User | null>(null);
  const [showEdit, setShowEdit] = useState<User | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [savedPasswords, setSavedPasswords] = useState<Record<string, string>>({});
  const [copiedPass, setCopiedPass] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ fullName: '', email: '' });
  const [generated, setGenerated] = useState<{ username: string; password: string; copied: boolean } | null>(null);
  const [createMsg, setCreateMsg] = useState('');
  const [editForm, setEditForm] = useState({ fullName: '', email: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['employers', page, search],
    queryFn: async () => {
      const { data } = await api.get('/users', { params: { page, limit: 20, role: 'EMPLOYER', search: search || undefined } });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employers'] }),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/auth/admin-register', body),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      setShowCreate(false);
      setCreateMsg('');
      const created = res.data.data as User;
      setSavedPasswords(prev => ({ ...prev, [created.id]: variables.password }));
      setShowDetail(created);
      setCopiedPass(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create employer';
      setCreateMsg(msg);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => api.put(`/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      setShowEdit(null);
    },
  });

  const resetPassMutation = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/reset-password`),
    onSuccess: (res, id) => {
      setSavedPasswords(prev => ({ ...prev, [id]: res.data.data.password }));
      setCopiedPass(false);
    },
  });

  const handleResetPass = () => {
    if (showDetail) resetPassMutation.mutate(showDetail.id);
  };

  const handleGenerate = () => {
    if (!form.fullName) return;
    const username = generateUsername(form.fullName);
    const password = generatePassword();
    setGenerated({ username, password, copied: false });
  };

  const handleCopy = (text: string, key: 'username' | 'password') => {
    navigator.clipboard.writeText(text);
    setGenerated(prev => prev ? { ...prev, copied: true } : null);
  };

  const handleCreate = () => {
    if (!generated || !form.fullName || !form.email) return;
    createMutation.mutate({
      fullName: form.fullName,
      email: form.email,
      username: generated.username,
      password: generated.password,
      role: 'EMPLOYER',
    });
  };

  const openEdit = (employer: User) => {
    setEditForm({ fullName: employer.fullName, email: employer.email });
    setShowEdit(employer);
  };

  const handleEdit = () => {
    if (!showEdit) return;
    editMutation.mutate({ id: showEdit.id, ...editForm });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employers</h1>
          <p className="text-gray-500 mt-1">Manage employer accounts and credentials</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setForm({ fullName: '', email: '' }); setGenerated(null); setCreateMsg(''); }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          <UserPlus size={18} /> New Employer
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">New Employer</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input type="text" value={form.fullName} onChange={e => { setForm({ ...form, fullName: e.target.value }); setGenerated(null); }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="employer@example.com" />
              </div>

              {!generated ? (
                <button onClick={handleGenerate} disabled={!form.fullName}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                  🔐 Generate Credentials
                </button>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-5 space-y-4 border-2 border-indigo-100">
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    ✨ Auto-generated credentials
                  </p>
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border-2 border-gray-200 shadow-sm">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Username</p>
                      <p className="text-sm font-mono font-bold text-gray-900 mt-1">{generated.username}</p>
                    </div>
                    <button onClick={() => handleCopy(generated.username, 'username')}
                      className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors">
                      <Copy size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border-2 border-gray-200 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Password</p>
                      <p className="text-sm font-mono font-bold text-gray-900 mt-1">{showPass ? generated.password : '••••••••••'}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => setShowPass(!showPass)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button onClick={() => handleCopy(generated.password, 'password')}
                        className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors">
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                  {generated.copied && (
                    <p className="text-xs text-green-600 flex items-center gap-1.5 font-semibold bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <Check size={14} /> Copied to clipboard!
                    </p>
                  )}
                  {createMsg && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 font-medium">{createMsg}</p>}
                  <button onClick={handleCreate} disabled={!form.fullName || !form.email || createMutation.isPending}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                    {createMutation.isPending ? 'Creating...' : '✓ Create Employer Account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Employer Details</h2>
              <button onClick={() => { setShowDetail(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Full Name</p>
                <p className="text-sm font-bold text-gray-900">{showDetail.fullName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Email</p>
                <p className="text-sm font-mono font-medium text-gray-900">{showDetail.email}</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-100">
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-2">Username</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono font-bold text-indigo-900">{showDetail.username}</p>
                  <button onClick={() => navigator.clipboard.writeText(showDetail.username)}
                    className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Key size={14} /> Password
                </p>
                {savedPasswords[showDetail.id] ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border-2 border-green-300 shadow-sm">
                      <p className="text-sm font-mono font-bold text-green-900">{savedPasswords[showDetail.id]}</p>
                      <button onClick={() => { navigator.clipboard.writeText(savedPasswords[showDetail.id]); setCopiedPass(true); }}
                        className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors">
                        <Copy size={16} />
                      </button>
                    </div>
                    {copiedPass && (
                      <p className="text-xs text-green-600 flex items-center gap-1.5 font-semibold">
                        <Check size={14} /> Copied to clipboard!
                      </p>
                    )}
                    <button
                      onClick={handleResetPass}
                      disabled={resetPassMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <Key size={16} />
                      {resetPassMutation.isPending ? 'Generating...' : 'Generate New Password'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleResetPass}
                    disabled={resetPassMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Key size={16} />
                    {resetPassMutation.isPending ? 'Generating...' : 'Generate New Password'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Employer</h2>
              <button onClick={() => setShowEdit(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input type="text" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
              <button onClick={handleEdit} disabled={editMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                {editMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, email or username..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                    Loading employers...
                  </div>
                </td></tr>
              ) : data?.data?.map((employer: User) => (
                <tr key={employer.id} className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                        {employer.fullName.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{employer.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 font-medium">{employer.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1.5 rounded-lg">
                      @{employer.username}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(employer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setShowDetail(employer)}
                        className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-all" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openEdit(employer)}
                        className="p-2 rounded-xl hover:bg-green-50 text-green-600 transition-all" title="Edit">
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete employer permanently?')) deleteMutation.mutate(employer.id); }}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-all" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.meta && (
          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm font-medium text-gray-600">
              Total: <span className="text-indigo-600 font-bold">{data.meta.total}</span> employers
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
