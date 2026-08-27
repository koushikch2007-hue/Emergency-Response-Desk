import React from 'react';
import { PhoneCall, AlertTriangle } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white shadow-lg border-b border-red-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-2 bg-white/10 rounded-full shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-200">
              Immediate Danger Notice
            </p>
            <p className="text-sm font-semibold">
              If someone is in immediate life-threatening danger, call your local emergency dispatch (<span className="underline decoration-amber-400 font-extrabold text-amber-200">911 / 112</span>) immediately.
            </p>
          </div>
        </div>

        <a
          href="tel:911"
          className="shrink-0 bg-white text-red-700 hover:bg-red-50 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2 border border-red-200"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>Call 911 Now</span>
        </a>
      </div>
    </div>
  );
};
