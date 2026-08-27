import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, FileText, ArrowRight, Activity } from 'lucide-react';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';

export const AdminOverviewPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <EmergencyBanner />

      <div>
        <h1 className="text-3xl font-black text-white flex items-center space-x-3">
          <Shield className="w-8 h-8 text-purple-400" />
          <span>System Administration Command Hub</span>
        </h1>
        <p className="text-xs text-slate-400">Manage user authorization roles, department assignments, and security audit logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 space-y-4 shadow-xl transition group"
        >
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30 w-fit">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">User & Role Management</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Promote users to authority/admin roles, assign responder departments, and manage active system status.
            </p>
          </div>
          <div className="text-xs font-bold text-purple-400 flex items-center space-x-1 pt-2">
            <span>Open User Management</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/audit-log"
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 space-y-4 shadow-xl transition group"
        >
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 w-fit">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition">System Security Audit Log</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Inspect immutable audit records for incident creation, status transitions, priority overrides, and user role modifications.
            </p>
          </div>
          <div className="text-xs font-bold text-blue-400 flex items-center space-x-1 pt-2">
            <span>Inspect Audit Log</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};
