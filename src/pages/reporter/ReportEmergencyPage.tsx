import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Siren,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Navigation,
  FileText,
  User,
  HeartPulse,
  UserX,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IncidentCategory, SeverityLevel, PriorityLevel, Incident } from '../../types';
import { CATEGORY_DETAILS } from '../../lib/utils';
import { createIncidentReport } from '../../lib/api';
import { EmergencyBanner } from '../../components/common/EmergencyBanner';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { PhotoUpload } from '../../components/incidents/PhotoUpload';
import { IncidentMap } from '../../components/common/IncidentMap';

export const ReportEmergencyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedIncident, setConfirmedIncident] = useState<Incident | null>(null);

  // Form State
  const [category, setCategory] = useState<IncidentCategory>('accident');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userSeverity, setUserSeverity] = useState<SeverityLevel>('medium');

  // Safety Flags
  const [isInjured, setIsInjured] = useState(false);
  const [isTrapped, setIsTrapped] = useState(false);
  const [isLifeThreatening, setIsLifeThreatening] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [involvesVulnerable, setInvolvesVulnerable] = useState(false);
  const [peopleAffected, setPeopleAffected] = useState<number>(1);

  // Location State
  const [locationDesc, setLocationDesc] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Media & Contact State
  const [photos, setPhotos] = useState<File[]>([]);
  const [reporterName, setReporterName] = useState(user?.full_name || '');
  const [reporterPhone, setReporterPhone] = useState(user?.phone || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');

  // Browser Geolocation
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates([pos.coords.latitude, pos.coords.longitude]);
        setGeoLoading(false);
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
        setGeoLoading(false);
      }
    );
  };

  const handleNextStep = () => {
    setError(null);

    if (step === 1) {
      if (!title.trim() || title.trim().length < 5) {
        setError('Please provide a descriptive title (at least 5 characters).');
        return;
      }
      if (!description.trim() || description.trim().length < 20) {
        setError('Please provide a detailed description (at least 20 characters).');
        return;
      }
    } else if (step === 3) {
      if (!locationDesc.trim() && !address.trim() && !coordinates) {
        setError('Please provide at least one location identifier (Description, Address, or Map Pin).');
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handleSubmitReport = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        category,
        user_severity: userSeverity,
        is_injured: isInjured,
        is_trapped: isTrapped,
        is_life_threatening: isLifeThreatening,
        is_active: isActive,
        involves_vulnerable_people: involvesVulnerable,
        people_affected: peopleAffected,
        location_description: locationDesc || undefined,
        address: address || undefined,
        latitude: coordinates ? coordinates[0] : undefined,
        longitude: coordinates ? coordinates[1] : undefined,
        reporter_name: reporterName || undefined,
        reporter_phone: reporterPhone || undefined,
        reporter_email: reporterEmail || undefined,
      };

      const result = await createIncidentReport(payload, user);
      setConfirmedIncident(result);
      setStep(5); // Confirmation Screen
    } catch (err: any) {
      setError(err.message || 'Failed to submit emergency report.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategoryMeta = CATEGORY_DETAILS[category];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <EmergencyBanner />

      {/* Confirmation View */}
      {step === 5 && confirmedIncident ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-950 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              Reference Code: {confirmedIncident.reference_code}
            </span>
            <h2 className="text-3xl font-black text-white">Emergency Report Registered</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your report has been successfully dispatched to the authority operational queue for deterministic triage review.
            </p>
          </div>

          {/* Priority & Status Result */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 max-w-md mx-auto space-y-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Assigned Priority Level:</span>
              <PriorityBadge priority={confirmedIncident.final_priority} size="lg" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Current Status:</span>
              <span className="capitalize font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30">
                {confirmedIncident.status}
              </span>
            </div>

            {confirmedIncident.ai_summary && (
              <div className="pt-3 border-t border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                  AI Factual Summary
                </span>
                <p className="text-xs text-slate-300">{confirmedIncident.ai_summary}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-[11px] text-amber-300/90 bg-amber-950/30 p-3 rounded-xl border border-amber-500/20">
              💡 <strong>Safety Guidance</strong>: {currentCategoryMeta.safetyGuidance}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to={`/reports/${confirmedIncident.id}`}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition"
            >
              Track Report Status
            </Link>
            <Link
              to="/reports"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-6 py-3 rounded-xl border border-slate-700 transition"
            >
              View All My Reports
            </Link>
          </div>
        </div>
      ) : (
        /* Wizard Steps Container */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Step {step} of 4</span>
              <span>
                {step === 1 && 'Incident Details'}
                {step === 2 && 'Safety Questions'}
                {step === 3 && 'Location & Media'}
                {step === 4 && 'Final Review & Submit'}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">Select Incident Category</h2>
                <p className="text-xs text-slate-400">Choose the category that best describes the emergency</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(CATEGORY_DETAILS).map(([key, cat]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key as IncidentCategory)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                      category === key
                        ? 'bg-red-950/50 border-red-500 text-white shadow-lg shadow-red-950/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Incident Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Active Vehicle Collision on Hwy 101 near Exit 14"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Detailed Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what happened, what you see, any immediate hazards, or structural damage..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Safety Questions */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">Structured Safety Questions</h2>
                <p className="text-xs text-slate-400">Answer these quick questions to calculate deterministic urgency scoring</p>
              </div>

              {/* Self-reported Severity */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200">Self-Reported Severity *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as SeverityLevel[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setUserSeverity(sev)}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                        userSeverity === sev
                          ? sev === 'critical'
                            ? 'bg-red-600 text-white border-red-500'
                            : sev === 'high'
                            ? 'bg-orange-600 text-white border-orange-500'
                            : sev === 'medium'
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${isLifeThreatening ? 'bg-red-950/40 border-red-500 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs block">Immediate Threat to Life?</span>
                    <span className="text-[10px] text-slate-400">Is anyone in life-threatening danger right now?</span>
                  </div>
                  <input type="checkbox" checked={isLifeThreatening} onChange={(e) => setIsLifeThreatening(e.target.checked)} className="w-5 h-5 accent-red-600 rounded" />
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${isTrapped ? 'bg-amber-950/40 border-amber-500 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs block">Someone Trapped?</span>
                    <span className="text-[10px] text-slate-400">Is anyone pinned, trapped, or unable to escape?</span>
                  </div>
                  <input type="checkbox" checked={isTrapped} onChange={(e) => setIsTrapped(e.target.checked)} className="w-5 h-5 accent-amber-600 rounded" />
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${isInjured ? 'bg-rose-950/40 border-rose-500 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs block">Injuries Reported?</span>
                    <span className="text-[10px] text-slate-400">Are there active medical injuries?</span>
                  </div>
                  <input type="checkbox" checked={isInjured} onChange={(e) => setIsInjured(e.target.checked)} className="w-5 h-5 accent-rose-600 rounded" />
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${involvesVulnerable ? 'bg-purple-950/40 border-purple-500 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs block">Vulnerable People Involved?</span>
                    <span className="text-[10px] text-slate-400">Children, elderly, or disabled persons involved?</span>
                  </div>
                  <input type="checkbox" checked={involvesVulnerable} onChange={(e) => setInvolvesVulnerable(e.target.checked)} className="w-5 h-5 accent-purple-600 rounded" />
                </label>
              </div>

              {/* People Affected Count */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Approximate Number of People Affected</label>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Location & Photos */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">Incident Location & Media</h2>
                <p className="text-xs text-slate-400">Provide location details or pin exact coordinates on the Leaflet map</p>
              </div>

              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleUseGeolocation}
                disabled={geoLoading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 px-4 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-2"
              >
                {geoLoading ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Navigation className="w-4 h-4 text-red-400" />}
                <span>{coordinates ? `Coordinates Set: ${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}` : 'Use My Browser Geolocation'}</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Location Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Exit 14 northbound overpass"
                    value={locationDesc}
                    onChange={(e) => setLocationDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 450 Oak Ridge Blvd"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Interactive Leaflet Map Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">Click Map to Pin Incident Location</label>
                <IncidentMap
                  height="260px"
                  interactivePicker={true}
                  selectedLocation={coordinates}
                  onLocationSelect={(lat, lng) => setCoordinates([lat, lng])}
                  center={coordinates || [37.7749, -122.4194]}
                />
              </div>

              {/* Photo Upload */}
              <PhotoUpload files={photos} onChange={setPhotos} maxFiles={5} />
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">Review Emergency Report</h2>
                <p className="text-xs text-slate-400">Please review your information before final submission</p>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-bold text-slate-400 block">Category:</span>
                    <span className="text-white font-bold">{currentCategoryMeta.label}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Self-Reported Severity:</span>
                    <span className="uppercase font-extrabold text-amber-400">{userSeverity}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-400 block">Title:</span>
                  <span className="text-white font-bold text-sm">{title}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-400 block">Description:</span>
                  <p className="text-slate-300 leading-relaxed mt-1">{description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                  <div className={`p-2 rounded border ${isLifeThreatening ? 'bg-red-950/60 border-red-500/50 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    Life Threat: <strong>{isLifeThreatening ? 'YES' : 'NO'}</strong>
                  </div>
                  <div className={`p-2 rounded border ${isTrapped ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    Trapped: <strong>{isTrapped ? 'YES' : 'NO'}</strong>
                  </div>
                  <div className={`p-2 rounded border ${isInjured ? 'bg-rose-950/60 border-rose-500/50 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    Injuries: <strong>{isInjured ? 'YES' : 'NO'}</strong>
                  </div>
                  <div className="p-2 rounded border bg-slate-900 border-slate-800 text-slate-300">
                    Affected: <strong>{peopleAffected}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-400 block">Location:</span>
                  <span className="text-slate-200">
                    {locationDesc || address || (coordinates ? `Lat: ${coordinates[0]}, Lng: ${coordinates[1]}` : 'N/A')}
                  </span>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitReport}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base py-4 rounded-xl shadow-xl transition flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Evaluating Priority & Submitting...</span>
                  </>
                ) : (
                  <>
                    <Siren className="w-5 h-5" />
                    <span>Confirm & Submit Emergency Report</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          {step < 5 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg transition"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
