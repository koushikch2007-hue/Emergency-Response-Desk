import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  User,
  MapPin,
  ExternalLink,
  Bot,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  ShieldAlert,
  FileCheck2,
  Maximize2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Incident, IncidentComment, IncidentHistoryItem, PriorityLevel, IncidentStatus } from '../../types';
import { fetchIncidentDetail, updateIncidentStatus, overrideIncidentPriority, addIncidentComment, fetchTeam } from '../../lib/api';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AuditHistoryTimeline } from '../../components/incidents/AuditHistoryTimeline';
import { IncidentMap } from '../../components/common/IncidentMap';
import { formatDate } from '../../lib/utils';

export const IncidentManagementPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const { user } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<IncidentHistoryItem[]>([]);
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status Action Modals / Inputs
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'history' | 'notes'>('overview');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Priority Override State
  const [overridePriorityVal, setOverridePriorityVal] = useState<PriorityLevel>('critical');
  const [overrideReason, setOverrideReason] = useState('');

  // Comment Form
  const [commentContent, setCommentContent] = useState('');
  const [commentVisibility, setCommentVisibility] = useState<'public' | 'internal'>('public');

  // Lightbox Preview State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadData = async () => {
    if (!incidentId) return;
    try {
      const data = await fetchIncidentDetail(incidentId, user);
      const teamData = await fetchTeam(user);
      setIncident(data.incident);
      setHistory(data.history);
      setComments(data.comments);
      setTeamMembers(teamData.team);
      setDepartments(teamData.departments);
      if (data.incident.assigned_department) setSelectedDept(data.incident.assigned_department);
      if (data.incident.assigned_to) setSelectedAssignee(data.incident.assigned_to);
      setOverridePriorityVal(data.incident.final_priority);
    } catch (err: any) {
      setError(err.message || 'Failed to load incident management details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [incidentId, user]);

  const handleStatusTransition = async (newStatus: IncidentStatus) => {
    if (!incidentId) return;
    setError(null);
    setActionLoading(true);

    try {
      const payload: any = {
        new_status: newStatus,
        assigned_to: selectedAssignee || undefined,
        assigned_department: selectedDept || undefined,
        notes: statusNotes || undefined,
      };

      if (newStatus === 'resolved') payload.resolution_summary = resolutionSummary;
      if (newStatus === 'rejected') payload.rejection_reason = rejectionReason;

      const updated = await updateIncidentStatus(incidentId, payload, user);
      setIncident(updated);
      setResolutionSummary('');
      setRejectionReason('');
      setStatusNotes('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Status transition failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId || !overrideReason.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await overrideIncidentPriority(incidentId, overridePriorityVal, overrideReason, user);
      setIncident(updated);
      setOverrideReason('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Priority override failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId || !commentContent.trim()) return;
    setActionLoading(true);
    try {
      const added = await addIncidentComment(incidentId, commentContent, commentVisibility, user);
      setComments((prev) => [...prev, added]);
      setCommentContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
        <p className="text-xs font-semibold">Loading incident triage command center...</p>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="p-6 bg-red-950/40 border border-red-500/40 rounded-3xl max-w-md mx-auto text-red-300 text-xs">
          {error}
        </div>
        <Link to="/authority/incidents" className="inline-block bg-slate-800 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl">
          ← Return to Queue
        </Link>
      </div>
    );
  }

  if (!incident) return null;

  const gmapsUrl =
    typeof incident.latitude === 'number' && typeof incident.longitude === 'number'
      ? `https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(incident.location_description || incident.address || '')}`;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Top Navigation */}
      <Link to="/authority/incidents" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Prioritized Incident Queue</span>
      </Link>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Command Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <PriorityBadge priority={incident.final_priority} size="lg" />
              <StatusBadge status={incident.status} size="md" />
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
                {incident.reference_code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{incident.title}</h1>
          </div>

          {/* Quick Acknowledge Button */}
          {incident.status === 'submitted' && (
            <button
              onClick={() => handleStatusTransition('acknowledged')}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg transition flex items-center space-x-2 border border-blue-400/30"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
              <span>Acknowledge Incident</span>
            </button>
          )}
        </div>

        {/* Operational Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Main Details, AI, History, Photos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incident Description</h3>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
            </div>

            {/* Photos Lightbox Gallery */}
            {incident.media && incident.media.length > 0 && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span>Private Media Inspection ({incident.media.length} Photographs)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {incident.media.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImage(img.signed_url || null)}
                      className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-800 cursor-pointer group shadow"
                    >
                      <img src={img.signed_url} alt="Incident media" className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deterministic Priority Score Breakdown */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Deterministic Safety Score Breakdown</span>
                </h3>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-500/30">
                  Score: {incident.priority_score} pts
                </span>
              </div>

              <div className="space-y-2">
                {incident.priority_reasons && incident.priority_reasons.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300 font-medium">{rule.description}</span>
                    <span className="font-mono font-bold text-red-400">+{rule.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gemini AI Analysis Card */}
            {incident.ai_summary && (
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 p-6 rounded-2xl border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>Gemini AI Triage Insights</span>
                  </h3>
                  {incident.ai_urgency && (
                    <span className="text-[11px] font-bold text-purple-200 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-500/40">
                      AI Urgency: {incident.ai_urgency.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 block mb-1">Factual Summary:</span>
                    <p className="text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      {incident.ai_summary}
                    </p>
                  </div>

                  {incident.ai_hazards && incident.ai_hazards.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Extracted Secondary Hazards:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {incident.ai_hazards.map((h, i) => (
                          <span key={i} className="bg-red-950/60 text-red-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-red-500/30">
                            ⚠️ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {incident.ai_departments && incident.ai_departments.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Suggested Responder Departments:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {incident.ai_departments.map((dept, i) => (
                          <span key={i} className="bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-500/30">
                            🏢 {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location & Leaflet GIS Map */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>GIS Location Details</span>
                </h3>
                <a
                  href={gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1 underline"
                >
                  <span>Open in External Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-slate-300">
                📍 <strong>Location</strong>: {incident.location_description || incident.address || 'Coordinates marked on map'}
              </p>

              {typeof incident.latitude === 'number' && typeof incident.longitude === 'number' && (
                <IncidentMap
                  height="300px"
                  incidents={[incident]}
                  center={[incident.latitude, incident.longitude]}
                  zoom={14}
                />
              )}
            </div>

            {/* Status History & Notes Tabs */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  Status History
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 py-2 rounded-lg transition ${activeTab === 'notes' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  Activity Notes ({comments.length})
                </button>
              </div>

              {activeTab === 'overview' ? (
                <AuditHistoryTimeline history={history} />
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Comments Feed */}
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-xl border space-y-1 ${
                          c.visibility === 'internal'
                            ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            {c.author_name} ({c.author_role})
                            {c.visibility === 'internal' && <span className="ml-2 text-[10px] text-amber-400 uppercase font-black">[INTERNAL NOTE]</span>}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{formatDate(c.created_at)}</span>
                        </div>
                        <p>{c.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddComment} className="space-y-3 pt-2">
                    <textarea
                      rows={2}
                      placeholder="Add operational note or public update..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-slate-400">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input type="radio" name="visibility" checked={commentVisibility === 'public'} onChange={() => setCommentVisibility('public')} className="accent-red-600" />
                          <span>Public Update</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer text-amber-400">
                          <input type="radio" name="visibility" checked={commentVisibility === 'internal'} onChange={() => setCommentVisibility('internal')} className="accent-amber-600" />
                          <span>Internal Note Only</span>
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading || !commentContent.trim()}
                        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dispatch & Operational Actions Panel */}
          <div className="space-y-6">
            {/* Status Transition Control Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Operational Dispatch & Status Control
              </h3>

              <div className="space-y-3 text-xs">
                {/* Assignee & Department */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Assigned Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select Responder Dept</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Assign Responding Officer</label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select Officer</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.department || 'Unassigned'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Action Buttons */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleStatusTransition('in_progress')}
                    disabled={actionLoading || incident.status === 'in_progress'}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow transition text-xs"
                  >
                    Mark In Progress
                  </button>

                  {/* Resolution Input */}
                  <div className="pt-2 space-y-2">
                    <input
                      type="text"
                      placeholder="Resolution summary (Required to resolve)..."
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => handleStatusTransition('resolved')}
                      disabled={actionLoading || !resolutionSummary.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow transition text-xs"
                    >
                      Resolve Incident
                    </button>
                  </div>

                  {/* Rejection Input */}
                  <div className="pt-2 space-y-2">
                    <input
                      type="text"
                      placeholder="Rejection reason (Spam / Invalid)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => handleStatusTransition('rejected')}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="w-full bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold py-2 rounded-xl transition text-xs"
                    >
                      Reject Incident (Spam)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Override Control Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Override Urgency Level
              </h3>

              <form onSubmit={handlePriorityOverride} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Target Priority Level</label>
                  <select
                    value={overridePriorityVal}
                    onChange={(e) => setOverridePriorityVal(e.target.value as PriorityLevel)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="critical">CRITICAL</option>
                    <option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option>
                    <option value="low">LOW</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Justification Reason *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide explicit operational justification for priority change..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !overrideReason.trim()}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold py-2.5 rounded-xl border border-slate-700 transition"
                >
                  Update Priority Level
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedImage} alt="Expanded view" className="max-h-[85vh] w-auto mx-auto rounded-2xl shadow-2xl border border-slate-700" />
          </div>
        </div>
      )}
    </div>
  );
};
