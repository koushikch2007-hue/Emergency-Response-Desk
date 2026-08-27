import React, { useState, useEffect } from 'react';
import { Users, Building2, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchTeam } from '../../lib/api';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchTeam(user);
        setTeam(data.team);
        setDepartments(data.departments);
      } catch (err) {
        console.error('Failed to fetch team data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <EmergencyBanner />

      <div>
        <h1 className="text-3xl font-black text-white flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-500" />
          <span>Active Authority Roster & Responder Departments</span>
        </h1>
        <p className="text-xs text-slate-400">View active operational units, assigned departments, and dispatcher workload</p>
      </div>

      {/* Responder Departments Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Active Response Departments</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <span key={d} className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl">
              🏢 {d}
            </span>
          ))}
        </div>
      </div>

      {/* Authority Team Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{member.full_name}</h4>
                <span className="text-[10px] text-blue-400 font-semibold uppercase">{member.role}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
              <p className="text-slate-400 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{member.department || 'General Dispatch'}</span>
              </p>
              <p className="text-slate-400 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{member.email}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Workload:</span>
              <span className="font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                {member.active_incidents_assigned} Incidents
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
