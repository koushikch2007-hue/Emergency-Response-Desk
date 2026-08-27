import React from 'react';
import { Link } from 'react-router-dom';
import {
  Siren,
  PlusCircle,
  Search,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  HeartPulse,
  Biohazard,
  Building2,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { CATEGORY_DETAILS } from '../lib/utils';
import { EmergencyBanner } from '../components/common/EmergencyBanner';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16">
      <EmergencyBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-slate-900/40 to-transparent pointer-events-none rounded-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 bg-red-950/80 border border-red-500/40 text-red-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            <Siren className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Public Emergency Complaint Reporting & Automated Triage System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Rapid Public Emergency Reporting & Real-Time Triage
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Report urgent community hazards, fires, accidents, and life safety threats in under two minutes. Evaluated instantly by deterministic rule scoring and enriched with server-side AI for authority response coordination.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/report"
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base px-8 py-4 rounded-xl shadow-xl shadow-red-950/50 hover:shadow-red-900/80 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 border border-red-400/30"
            >
              <PlusCircle className="w-6 h-6" />
              <span>Report an Emergency Now</span>
            </Link>

            <Link
              to="/reports"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base px-8 py-4 rounded-xl shadow-lg border border-slate-700 hover:border-slate-600 transition flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5 text-slate-400" />
              <span>Track My Reports</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works / 3-Step Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-800/80">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-400">Streamlined Workflow</h2>
          <p className="text-2xl font-black text-white mt-1">How Emergency Complaint Triage Works</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 relative shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-lg text-white">Submit Incident Details</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Select category, answer quick safety questions (injured/trapped/life threat), pinpoint location with browser geolocation or map, and optionally attach photos.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 relative shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-lg text-white">Deterministic Priority Scoring</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Server-side rules engine calculates urgency score immediately. Mandatory safety minimums guarantee immediate life threats or trapped victims remain Critical.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 relative shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-lg text-white">Authority Triage & Updates</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Emergency responders review operational queue, assign responder departments, post official updates, and resolve incidents with complete audit trail history.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Incident Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400">Incident Categories</h2>
            <p className="text-2xl font-black text-white mt-1">Supported Emergency Reporting Types</p>
          </div>
          <Link
            to="/report"
            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
          >
            <span>Start Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CATEGORY_DETAILS).map(([key, cat]) => (
            <div
              key={key}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition space-y-2"
            >
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-slate-800 rounded-lg text-red-400">
                  {key === 'fire' ? (
                    <Flame className="w-5 h-5" />
                  ) : key === 'medical' ? (
                    <HeartPulse className="w-5 h-5" />
                  ) : key === 'hazardous_material' ? (
                    <Biohazard className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-100">{cat.label}</h4>
              </div>
              <p className="text-xs text-slate-400">{cat.description}</p>
              <p className="text-[11px] text-amber-300/90 font-medium bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
                💡 {cat.safetyGuidance}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Authority Operational Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-blue-950/80 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>For Responders & Dispatchers</span>
            </div>
            <h3 className="text-2xl font-black text-white">Authority Emergency Operations Portal</h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Access real-time prioritized queue, Leaflet map coordinates, AI hazard analysis, department assignments, signed media URL inspection, and full immutable audit history.
            </p>
          </div>

          <Link
            to="/authority"
            className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-700 transition flex items-center space-x-2"
          >
            <span>Open Authority Queue</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </Link>
        </div>
      </section>
    </div>
  );
};
