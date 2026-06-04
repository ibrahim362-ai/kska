import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Ban, CheckCircle, Trash2, MoreVertical, KeyRound, ShieldCheck, UserCog } from 'lucide-react';
import api from '../../services/api';
import type { User } from '../../types';
import { DataTable } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { showSuccess, showError, showPromise } from '../../components/Toast';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionMenuUser, setActionMenuUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ban' | 'unban' | 'delete' | 'reset-password' | 'change-role';
    user: User;
    role?: string;
    reason?: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, roleFilter, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.isBanned = statusFilter === 'BANNED';
      const { data } = await api.get('/users', { params });
      return data;
    },
  });

  const banMutation = useMutation({
    mutationFn: ({ id, isBanned, reason }: { id: string; isBanned: boolean; reason?: string }) =>
      api.put(`/users/${id}/ban`, { isBanned, banReason: reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess(vars.isBanned ? 'User banned' : 'User unbanned');
    },
    onError: (err: any) => showError(err.response?.data?.message || 'Action failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User deleted');
    },
    onError: (err: any) => showError(err.response?.data?.message || 'Delete failed'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/reset-password`),
    onSuccess: (res) => {
      showSuccess(`Password reset to: ${res.data?.data?.newPassword || 'check email'}`);
    },
    onError: (err: any) => showError(err.response?.data?.message || 'Reset failed'),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}`, { isVerified: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User verified');
    },
    onError: (err: any) => showError(err.response?.data?.message || 'Verify failed'),
  });

  const columns: ColumnDef<User, any>[] = [
    {
      id: 'user',
      header: 'User',
      accessorKey: 'fullName',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
            {row.original.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{row.original.fullName}</p>
            <p className="text-xs text-gray-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'username',
      header: 'Username',
      accessorKey: 'username',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700 font-mono bg-gray-100 px-2.5 py-1 rounded-lg">
          @{getValue() as string}
        </span>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      cell: ({ getValue }) => {
        const role = getValue() as string;
        const colors: Record<string, string> = {
          SUPER_ADMIN: 'bg-red-50 text-red-700 border-red-200',
          ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
          EMPLOYER: 'bg-blue-50 text-blue-700 border-blue-200',
          USER: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return (
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${colors[role] || colors.USER}`}>
            {role}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { isBanned, isVerified } = row.original;
        return (
          <div className="flex flex-col gap-1">
            {isBanned ? (
              <span className="text-xs text-red-700 flex items-center gap-1 font-medium bg-red-50 px-2.5 py-1 rounded-full border border-red-200 w-fit">
                <Ban size={12} /> Banned
              </span>
            ) : (
              <span className="text-xs text-green-700 flex items-center gap-1 font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-200 w-fit">
                <CheckCircle size={12} /> Active
              </span>
            )}
            {isVerified && (
              <span className="text-xs text-blue-700 flex items-center gap-1 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 w-fit">
                <ShieldCheck size={12} /> Verified
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600">
          {new Date(getValue() as string).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          {!row.original.isVerified && (
            <button
              onClick={(e) => { e.stopPropagation(); verifyMutation.mutate(row.original.id); }}
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              title="Verify user"
            >
              <ShieldCheck size={16} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setActionMenuUser(row.original); }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="More actions"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage all platform users</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            {data?.meta?.total || 0} Users
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'USER', 'EMPLOYER', 'ADMIN', 'SUPER_ADMIN'] as const).map((r) => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleFilter === r
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {r}
          </button>
        ))}
        <div className="w-px bg-gray-300 mx-1" />
        {(['ALL', 'ACTIVE', 'BANNED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === s
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search by name, email, username..."
        searchKey="email"
        emptyTitle="No users found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      {/* Action menu (floating) */}
      {actionMenuUser && (
        <div className="fixed inset-0 z-40" onClick={() => setActionMenuUser(null)}>
          <div
            className="absolute right-4 top-20 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-56"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-900">{actionMenuUser.fullName}</p>
              <p className="text-xs text-gray-500">{actionMenuUser.email}</p>
            </div>
            <button
              onClick={() => { setConfirmAction({ type: 'reset-password', user: actionMenuUser }); setActionMenuUser(null); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <KeyRound size={14} /> Reset password
            </button>
            <button
              onClick={() => { setConfirmAction({ type: 'change-role', user: actionMenuUser }); setActionMenuUser(null); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <UserCog size={14} /> Change role
            </button>
            {actionMenuUser.isBanned ? (
              <button
                onClick={() => { setConfirmAction({ type: 'unban', user: actionMenuUser }); setActionMenuUser(null); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
              >
                <CheckCircle size={14} /> Unban user
              </button>
            ) : (
              <button
                onClick={() => { setConfirmAction({ type: 'ban', user: actionMenuUser }); setActionMenuUser(null); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600"
              >
                <Ban size={14} /> Ban user
              </button>
            )}
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => { setConfirmAction({ type: 'delete', user: actionMenuUser }); setActionMenuUser(null); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
            >
              <Trash2 size={14} /> Delete permanently
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmAction?.type === 'ban'}
        title="Ban this user?"
        message={
          <>
            <p>This will prevent <strong>{confirmAction?.user.fullName}</strong> from signing in.</p>
            <input
              type="text"
              placeholder="Reason (optional)"
              className="mt-3 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              onChange={(e) => confirmAction && (confirmAction.reason = e.target.value)}
            />
          </>
        }
        confirmText="Ban user"
        variant="danger"
        loading={banMutation.isPending}
        onConfirm={() => {
          if (confirmAction) {
            banMutation.mutate({ id: confirmAction.user.id, isBanned: true, reason: confirmAction.reason });
            setConfirmAction(null);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === 'unban'}
        title="Unban this user?"
        message={`This will restore ${confirmAction?.user.fullName}'s access to the platform.`}
        confirmText="Unban user"
        variant="info"
        loading={banMutation.isPending}
        onConfirm={() => {
          if (confirmAction) {
            banMutation.mutate({ id: confirmAction.user.id, isBanned: false });
            setConfirmAction(null);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === 'delete'}
        title="Delete this user permanently?"
        message={
          <>
            <p>This will <strong>permanently delete</strong> {confirmAction?.user.fullName} and all their data (posts, comments, votes, tickets).</p>
            <p className="mt-2 text-red-600 font-semibold">This cannot be undone.</p>
          </>
        }
        confirmText="Delete permanently"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (confirmAction) {
            deleteMutation.mutate(confirmAction.user.id);
            setConfirmAction(null);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === 'reset-password'}
        title="Reset password?"
        message={`A new random password will be generated for ${confirmAction?.user.fullName}. They'll need to use the "forgot password" flow to set a new one.`}
        confirmText="Reset password"
        variant="warning"
        loading={resetPasswordMutation.isPending}
        onConfirm={() => {
          if (confirmAction) {
            resetPasswordMutation.mutate(confirmAction.user.id);
            setConfirmAction(null);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === 'change-role'}
        title="Change user role?"
        message={
          <div className="space-y-2">
            <p>Current role: <strong>{confirmAction?.user.role}</strong></p>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              defaultValue={confirmAction?.user.role}
              onChange={(e) => {
                if (confirmAction) {
                  setConfirmAction({ ...confirmAction, role: e.target.value });
                }
              }}
            >
              <option value="USER">USER</option>
              <option value="EMPLOYER">EMPLOYER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <p className="text-xs text-amber-600 mt-2">⚠️ Be careful — ADMIN can manage all data.</p>
          </div>
        }
        confirmText="Change role"
        variant="warning"
        loading={false}
        onConfirm={async () => {
          if (confirmAction && confirmAction.role) {
            try {
              await showPromise(
                api.put(`/users/${confirmAction.user.id}`, { role: confirmAction.role }).then(() => null),
                {
                  loading: 'Updating role...',
                  success: 'Role updated',
                  error: 'Failed to update role',
                }
              );
              queryClient.invalidateQueries({ queryKey: ['users'] });
            } catch (err: any) {
              // toast handled by promise
            }
            setConfirmAction(null);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
