import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  MessageSquare,
  Send,
  Loader2,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Incident, IncidentComment, IncidentHistoryItem } from '../../types';
import { fetchIncidentDetail, addIncidentComment } from '../../lib/api';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AuditHistoryTimeline } from '../../components/incidents/AuditHistoryTimeline';
import { formatDate } from '../../lib/utils';

export const ReportDetailPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const { user } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<IncidentHistoryItem[]>([]);
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!incidentId) return;
      try {
        const data = await fetchIncidentDetail(incidentId, user);
        setIncident(data.incident);
        setHistory(data.history);
        setComments(data.comments);
      } catch (err: any) {
        setError(err.message || 'Failed to load report detail.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [incidentId, user]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !incidentId) return;
    setPostingComment(true);
    try {
      const added = await addIncidentComment(incidentId, newComment, 'public', user);
      setComments((prev) => [...prev, added]);
      setNewComment('');
    } catch (err: any) {
      alert(err.message || 'Failed to add follow-up comment.');
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
        <p className="text-xs font-semibold">Loading report tracking details...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-6 bg-red-950/40 border border-red-500/40 rounded-3xl max-w-md mx-auto text-red-300 text-xs">
          {error || 'Incident report not found or access denied.'}
        </div>
        <Link to="/reports" className="inline-block bg-slate-800 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl">
          ← Return to My Reports
        </Link>
      </div>
    );
  }

  const isClosedOrRejected = ['closed', 'rejected'].includes(incident.status);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Back Link */}
      <Link to="/reports" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Reports</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <PriorityBadge priority={incident.final_priority} size="md" />
            <StatusBadge status={incident.status} size="md" />
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
              {incident.reference_code}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Submitted: {formatDate(incident.created_at)}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-white leading-tight">{incident.title}</h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
        </div>

        {/* Location & Department Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-400 block">Incident Location</span>
              <span className="text-slate-200">{incident.location_description || incident.address || 'Coordinates marked'}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-400 block">Assigned Responder Department</span>
              <span className="text-slate-200">{incident.assigned_department || 'Pending Department Assignment'}</span>
            </div>
          </div>
        </div>

        {/* Uploaded Photos Gallery */}
        {incident.media && incident.media.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="font-bold text-xs text-slate-300">Uploaded Photos ({incident.media.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {incident.media.map((img) => (
                <div key={img.id} className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow">
                  <img src={img.signed_url} alt="Incident media preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Transition Audit Timeline */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Operational Status History</span>
          </h3>
          <AuditHistoryTimeline history={history} />
        </div>

        {/* Public Response Updates & Follow-up Section */}
        <div className="pt-6 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Public Authority Updates & Follow-Ups</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Public View Only</span>
          </div>

          {/* Comment List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No public response updates yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {c.author_role === 'authority' ? '📢 Official Authority Update' : c.author_name || 'Reporter Follow-up'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{c.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Follow-up Comment Form */}
          {!isClosedOrRejected ? (
            <form onSubmit={handleAddFollowUp} className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-300 block">
                Add Relevant Follow-Up Information
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Provide updated situation details..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={postingComment || !newComment.trim()}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-1.5 text-xs"
                >
                  {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Send</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-600" />
              <span>This incident has been {incident.status} and is closed to further public updates.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
