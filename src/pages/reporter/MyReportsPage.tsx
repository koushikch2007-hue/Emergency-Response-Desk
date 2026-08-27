import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Filter, Loader2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Incident } from '../../types';
import { fetchMyReports } from '../../lib/api';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await fetchMyReports(user);
        setIncidents(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [user]);

  const filtered = incidents.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.reference_code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <EmergencyBanner />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Track My Reports</h1>
          <p className="text-xs text-slate-400">View real-time operational status updates for your submitted emergency complaints</p>
        </div>

        <Link
          to="/report"
          className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Emergency Report</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by reference code (INC-...) or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Report Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-xs font-semibold">Loading your emergency reports...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Reports Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not submitted any reports matching the search filters.
          </p>
          <Link
            to="/report"
            className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
          >
            Submit an Emergency Complaint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <IncidentCard key={item.id} incident={item} viewMode="reporter" />
          ))}
        </div>
      )}
    </div>
  );
};
