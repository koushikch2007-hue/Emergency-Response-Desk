import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Siren, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { fetchAnalytics } from '../../lib/api';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetchAnalytics(user);
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [user]);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
        <p className="text-xs font-semibold">Calculating operational response analytics...</p>
      </div>
    );
  }

  const { metrics, categoryDistribution, statusDistribution, priorityDistribution, submissionTrends } = data;
  const COLORS = ['#dc2626', '#ea580c', '#d97706', '#2563eb', '#10b981', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <EmergencyBanner />

      <div>
        <h1 className="text-3xl font-black text-white flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
          <span>Operational Response Analytics</span>
        </h1>
        <p className="text-xs text-slate-400">Aggregate performance metrics, triage distribution, and acknowledgment benchmarks</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Open Incidents</span>
          <span className="text-3xl font-black text-white">{metrics.totalOpen}</span>
        </div>

        <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-xs font-bold text-red-300 uppercase tracking-wider block">Critical Active</span>
          <span className="text-3xl font-black text-red-400">{metrics.criticalCount}</span>
        </div>

        <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">Avg Ack Speed</span>
          <span className="text-3xl font-black text-purple-300">{metrics.avgAckTimeMinutes} min</span>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">7-Day Resolutions</span>
          <span className="text-3xl font-black text-emerald-400">{metrics.resolvedLast7Days}</span>
        </div>
      </div>

      {/* Interactive Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Submission Trends Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Weekly Emergency Report Volume</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">7-Day Trend</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionTrends}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Incident Status Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Operational Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
