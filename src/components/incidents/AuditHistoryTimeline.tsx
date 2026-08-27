import React from 'react';
import { Clock, ShieldCheck, User, Bot, AlertCircle } from 'lucide-react';
import { IncidentHistoryItem } from '../../types';
import { formatDate } from '../../lib/utils';
import { StatusBadge } from '../common/StatusBadge';

interface AuditHistoryTimelineProps {
  history: IncidentHistoryItem[];
}

export const AuditHistoryTimeline: React.FC<AuditHistoryTimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="text-slate-400 text-xs italic">No history records available.</div>;
  }

  const renderActorIcon = (type: string) => {
    switch (type) {
      case 'authority':
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 'ai':
        return <Bot className="w-4 h-4 text-purple-400" />;
      default:
        return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {history.map((item) => (
        <div key={item.id} className="relative flex items-start space-x-3">
          <div className="absolute -left-6 top-0.5 p-1 bg-slate-900 border border-slate-700 rounded-full z-10">
            {renderActorIcon(item.actor_type)}
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex-1 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status={item.new_status} size="sm" />
                <span className="text-xs font-bold text-slate-300 capitalize">
                  via {item.actor_type}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{formatDate(item.created_at)}</span>
            </div>
            {item.notes && <p className="text-xs text-slate-300 font-medium leading-relaxed">{item.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
