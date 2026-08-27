import React, { useState, useEffect } from 'react';
import { FileText, Filter, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuditLogItem } from '../../types';
import { fetchAuditLogs } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';

export const AuditLogPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await fetchAuditLogs(user);
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <EmergencyBanner />

      <div>
        <h1 className="text-3xl font-black text-white flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-400" />
          <span>System Security Audit Log</span>
        </h1>
        <p className="text-xs text-slate-400">Immutable audit record of incident creations, status updates, priority overrides, and user authorization events</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-xs font-semibold">Loading security audit log entries...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor Role</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition font-mono">
                    <td className="p-4 text-slate-400 whitespace-nowrap">{formatDate(log.created_at)}</td>
                    <td className="p-4">
                      <span className="font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{log.actor_role || 'system'}</td>
                    <td className="p-4">{log.target_entity}</td>
                    <td className="p-4 text-[11px] text-slate-300">
                      {log.metadata ? JSON.stringify(log.metadata) : 'N/A'}
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
