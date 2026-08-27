import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren,
  AlertOctagon,
  Clock,
  CheckCircle2,
  ListFilter,
  BarChart3,
  Users,
  Shield,
  Loader2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { fetchAnalytics, fetchIncidentQueue } from '../../lib/api';
import { Incident } from '../../types';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [queue, setQueue] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const analyticsData = await fetchAnalytics(user);
        const queueData = await fetchIncidentQueue({ limit: '6' }, user);
        setMetrics(analyticsData);
        setQueue(queueData.incidents);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (loading || !metrics) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
        <p className="text-xs font-semibold">Loading authority operational metrics...</p>
      </div>
    );
  }

  const { totalOpen, criticalCount, highCount, awaitingAck, assignedToMe, resolvedLast7Days, avgAckTimeMinutes } =
    metrics.metrics;

  const COLORS = ['#dc2626', '#ea580c', '#d97706', '#2563eb', '#10b981', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <EmergencyBanner />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-500" />
            <span>Authority Operational Command</span>
          </h1>
          <p className="text-xs text-slate-400">Real-time emergency triage metrics and priority queue monitoring</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/authority/incidents"
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <ListFilter className="w-4 h-4" />
            <span>Open Full Incident Queue</span>
          </Link>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Open</span>
          <span className="text-2xl font-black text-white">{totalOpen}</span>
        </div>

        <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block flex items-center space-x-1">
            <Siren className="w-3.5 h-3.5 text-red-400" />
            <span>Critical</span>
          </span>
          <span className="text-2xl font-black text-red-400">{criticalCount}</span>
        </div>

        <div className="bg-orange-950/40 border border-orange-500/40 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider block flex items-center space-x-1">
            <AlertOctagon className="w-3.5 h-3.5 text-orange-400" />
            <span>High Priority</span>
          </span>
          <span className="text-2xl font-black text-orange-400">{highCount}</span>
        </div>

        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Awaiting Ack</span>
          <span className="text-2xl font-black text-amber-400">{awaitingAck}</span>
        </div>

        <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">Assigned to Me</span>
          <span className="text-2xl font-black text-blue-400">{assignedToMe}</span>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolved (7d)</span>
          </span>
          <span className="text-2xl font-black text-emerald-400">{resolvedLast7Days}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Avg Ack Time</span>
          </span>
          <span className="text-2xl font-black text-purple-300">{avgAckTimeMinutes}m</span>
        </div>
      </div>

      {/* Visual Analytics Preview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-red-400" />
              <span>Category Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Live Aggregation</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.categoryDistribution}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Priority Level Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Active Queue</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.priorityDistribution} dataKey="count" nameKey="priority" cx="50%" cy="50%" outerRadius={70} label>
                  {metrics.priorityDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Siren className="w-5 h-5 text-red-500 animate-pulse" />
            <span>High-Priority Operational Queue</span>
          </h2>
          <Link to="/authority/incidents" className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1">
            <span>View All Queue ({totalOpen})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {queue.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} viewMode="authority" />
          ))}
        </div>
      </div>
    </div>
  );
};
