import React, { useState, useEffect } from 'react';
import { Users, Shield, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminUsers, updateUserRole } from '../../lib/api';
import { UserRole } from '../../types';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchAdminUsers(user);
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: UserRole, currentDept?: string) => {
    setActionLoading(true);
    setSuccessMsg(null);
    try {
      const updated = await updateUserRole(userId, { role: newRole, department: currentDept }, user);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setSuccessMsg(`User role updated to ${newRole.toUpperCase()}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeptChange = async (userId: string, currentRole: UserRole, newDept: string) => {
    setActionLoading(true);
    try {
      const updated = await updateUserRole(userId, { role: currentRole, department: newDept }, user);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update department.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <EmergencyBanner />

      <div>
        <h1 className="text-3xl font-black text-white flex items-center space-x-3">
          <Users className="w-8 h-8 text-purple-400" />
          <span>User Role & Authorization Management</span>
        </h1>
        <p className="text-xs text-slate-400">Assign authority and admin roles, manage responder departments, and control user access</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
          <p className="text-xs font-semibold">Loading system users...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{u.full_name || u.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole, u.department)}
                        disabled={actionLoading}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-100 capitalize focus:outline-none focus:border-purple-500"
                      >
                        <option value="reporter">Reporter</option>
                        <option value="authority">Authority</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="Department name..."
                        defaultValue={u.department || ''}
                        onBlur={(e) => handleDeptChange(u.id, u.role, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.is_active ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <span className="text-[10px] text-slate-500 font-mono">ID: {u.id.slice(0, 8)}...</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
