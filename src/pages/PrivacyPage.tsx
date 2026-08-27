import React from 'react';
import { ShieldCheck, Lock, Eye, Server, FileText } from 'lucide-react';
import { EmergencyBanner } from '../components/common/EmergencyBanner';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <EmergencyBanner />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Emergency Response Desk Data Safeguards & Handling</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-4 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Eye className="w-4 h-4 text-red-400" />
              <span>1. Information Collection & Purpose</span>
            </h3>
            <p>
              We collect information provided when you submit an emergency complaint, including incident category, title, description, self-reported severity, safety flags (injured/trapped status), geolocation coordinates, optional reporter contact information (name, phone, email), and incident photographs.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>2. Access Restrictions & Reporter Contact Protection</span>
            </h3>
            <p>
              Reporter contact details (name, phone, email) are strictly restricted and are <strong>never displayed</strong> on public incident feeds, public response updates, or to other public reporters. Contact information is accessible only to verified dispatchers and authority operations personnel for direct incident verification.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>3. Incident Media & Storage Security</span>
            </h3>
            <p>
              Uploaded photographs are stored in a private storage bucket (`incident-media`). Media files are accessed exclusively via short-lived, encrypted signed URLs generated for authenticated responders.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>4. AI-Assisted Analysis & Deterministic Minimums</span>
            </h3>
            <p>
              Server-side Gemini AI processes report text to extract secondary hazards, factual summaries, and suggested responder departments. AI analysis is constrained strictly by deterministic safety rules and cannot lower the priority established by emergency minimums.
            </p>
          </section>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <strong>System Limitation Disclaimer</strong>: Emergency Response Desk is an auxiliary complaint reporting platform and does not replace official municipal 911/112 emergency services.
          </div>
        </div>
      </div>
    </div>
  );
};
