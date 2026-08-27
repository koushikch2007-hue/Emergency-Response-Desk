import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Map,
  List,
  RefreshCw,
  Loader2,
  Siren,
  Building2,
  HeartPulse,
  UserX,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Incident } from '../../types';
import { fetchIncidentQueue } from '../../lib/api';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { IncidentMap } from '../../components/common/IncidentMap';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';

export const IncidentQueuePage: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [hasPhotos, setHasPhotos] = useState(false);
  const [isInjuredOnly, setIsInjuredOnly] = useState(false);
  const [isTrappedOnly, setIsTrappedOnly] = useState(false);
  const [isLifeThreatOnly, setIsLifeThreatOnly] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;
      if (search.trim()) params.search = search.trim();
      if (hasPhotos) params.has_photos = 'true';
      if (isInjuredOnly) params.is_injured = 'true';
      if (isTrappedOnly) params.is_trapped = 'true';
      if (isLifeThreatOnly) params.is_life_threatening = 'true';

      const data = await fetchIncidentQueue(params, user);
      setIncidents(data.incidents);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [
    user,
    statusFilter,
    categoryFilter,
    priorityFilter,
    departmentFilter,
    hasPhotos,
    isInjuredOnly,
    isTrappedOnly,
    isLifeThreatOnly,
  ]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <EmergencyBanner />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Prioritized Incident Queue</h1>
          <p className="text-xs text-slate-400">Filter, search, and manage open emergency complaints with deterministic triage ordering</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* List / Map View Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                viewMode === 'list' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                viewMode === 'map' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>GIS Map View</span>
            </button>
          </div>

          <button
            onClick={loadQueue}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search reference code, title, description, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadQueue()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">🚨 Critical</option>
            <option value="high">⚠️ High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🔵 Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted (Unacknowledged)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Categories</option>
            <option value="accident">Accident</option>
            <option value="fire">Fire & Explosion</option>
            <option value="medical">Medical Emergency</option>
            <option value="crime">Crime & Safety</option>
            <option value="flood_weather">Flood & Weather</option>
            <option value="utility">Utility Failure</option>
            <option value="hazardous_material">Hazardous Material</option>
            <option value="infrastructure">Infrastructure</option>
          </select>
        </div>

        {/* Checkbox Filter Chips */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition flex items-center space-x-1.5 ${isLifeThreatOnly ? 'bg-red-950/80 border-red-500 text-red-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <input type="checkbox" checked={isLifeThreatOnly} onChange={(e) => setIsLifeThreatOnly(e.target.checked)} className="hidden" />
            <Siren className="w-3.5 h-3.5 text-red-400" />
            <span>Immediate Life Threat</span>
          </label>

          <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition flex items-center space-x-1.5 ${isTrappedOnly ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <input type="checkbox" checked={isTrappedOnly} onChange={(e) => setIsTrappedOnly(e.target.checked)} className="hidden" />
            <UserX className="w-3.5 h-3.5 text-amber-400" />
            <span>Trapped Person</span>
          </label>

          <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition flex items-center space-x-1.5 ${isInjuredOnly ? 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <input type="checkbox" checked={isInjuredOnly} onChange={(e) => setIsInjuredOnly(e.target.checked)} className="hidden" />
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Injuries Only</span>
          </label>

          <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition flex items-center space-x-1.5 ${hasPhotos ? 'bg-blue-950/80 border-blue-500 text-blue-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <input type="checkbox" checked={hasPhotos} onChange={(e) => setHasPhotos(e.target.checked)} className="hidden" />
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span>Has Photographs</span>
          </label>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <p className="text-xs font-semibold">Querying emergency queue...</p>
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3 text-slate-400">
          <Siren className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Incidents Found</h3>
          <p className="text-xs max-w-sm mx-auto">No open complaints matched your active filter configuration.</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl">
          <IncidentMap height="600px" incidents={incidents} zoom={11} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} viewMode="authority" />
          ))}
        </div>
      )}
    </div>
  );
};
