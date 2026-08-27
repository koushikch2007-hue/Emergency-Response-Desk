import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Camera, HeartPulse, UserX, Siren, Building2 } from 'lucide-react';
import { Incident } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { CATEGORY_DETAILS, formatTimeAgo } from '../../lib/utils';

interface IncidentCardProps {
  incident: Incident;
  viewMode?: 'authority' | 'reporter';
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, viewMode = 'authority' }) => {
  const categoryMeta = CATEGORY_DETAILS[incident.category] || CATEGORY_DETAILS.other;
  const detailLink = viewMode === 'authority' ? `/authority/incidents/${incident.id}` : `/reports/${incident.id}`;

  return (
    <div
      className={`bg-slate-900 border rounded-xl p-5 shadow-lg transition hover:shadow-xl space-y-4 ${
        incident.final_priority === 'critical'
          ? 'border-red-500/50 bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-900'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <PriorityBadge priority={incident.final_priority} size="sm" />
          <StatusBadge status={incident.status} size="sm" />
          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {incident.reference_code}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimeAgo(incident.created_at)}</span>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <Link to={detailLink} className="group">
          <h3 className="font-bold text-base text-slate-100 group-hover:text-red-400 transition leading-snug">
            {incident.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">{incident.description}</p>
      </div>

      {/* Safety Flags Bar */}
      {(incident.is_injured || incident.is_trapped || incident.is_life_threatening) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {incident.is_life_threatening && (
            <span className="inline-flex items-center space-x-1 bg-red-950/80 border border-red-500/50 text-red-300 px-2 py-0.5 rounded text-[11px] font-bold">
              <Siren className="w-3 h-3 text-red-400" />
              <span>Immediate Life Threat</span>
            </span>
          )}
          {incident.is_trapped && (
            <span className="inline-flex items-center space-x-1 bg-amber-950/80 border border-amber-500/50 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">
              <UserX className="w-3 h-3 text-amber-400" />
              <span>Trapped Person</span>
            </span>
          )}
          {incident.is_injured && (
            <span className="inline-flex items-center space-x-1 bg-rose-950/80 border border-rose-500/50 text-rose-300 px-2 py-0.5 rounded text-[11px] font-bold">
              <HeartPulse className="w-3 h-3 text-rose-400" />
              <span>Injuries Reported</span>
            </span>
          )}
        </div>
      )}

      {/* Meta Footer Row */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[180px]">
              {incident.location_description || incident.address || 'Map Pin'}
            </span>
          </span>
          {incident.media && incident.media.length > 0 && (
            <span className="flex items-center space-x-1 text-slate-400">
              <Camera className="w-3.5 h-3.5" />
              <span>{incident.media.length}</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {incident.assigned_department && (
            <span className="text-[11px] text-blue-400 bg-blue-950/40 border border-blue-500/30 px-2 py-0.5 rounded flex items-center space-x-1">
              <Building2 className="w-3 h-3" />
              <span>{incident.assigned_department}</span>
            </span>
          )}
          <Link
            to={detailLink}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition flex items-center space-x-1"
          >
            <span>View Details</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
