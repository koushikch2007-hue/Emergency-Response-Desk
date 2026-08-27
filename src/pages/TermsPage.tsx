import React from 'react';
import { FileText, AlertTriangle, ShieldAlert } from 'lucide-react';
import { EmergencyBanner } from '../components/common/EmergencyBanner';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <EmergencyBanner />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Terms of Service</h1>
            <p className="text-xs text-slate-400">Rules & Operational Conditions for Platform Use</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-4 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>1. Prohibition on False & Abusive Reports</span>
            </h3>
            <p>
              Users are strictly prohibited from submitting false, misleading, malicious, abusive, or non-emergency reports. Submitting fraudulent reports wastes emergency responder resources and may subject the user to account termination and legal action.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>2. No Guarantee of Emergency Response Time</span>
            </h3>
            <p>
              The Emergency Response Desk platform processes emergency complaints using automated triage rules and authority dispatch queues. However, submission through this application does not constitute a guaranteed dispatch time or response obligation. Always call 911 / 112 directly if in immediate danger.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>3. User Accuracy & Media Responsibility</span>
            </h3>
            <p>
              Reporters are responsible for providing accurate description details, location coordinates, and truthful safety flag responses. Uploading unlawful, explicit, copyrighted, or non-relevant imagery is strictly forbidden.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
