import React from 'react';
import { Link } from 'react-router-dom';
import { Siren, Home } from 'lucide-react';
import { EmergencyBanner } from '../components/common/EmergencyBanner';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
      <EmergencyBanner />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="p-4 bg-red-600/20 text-red-400 rounded-full w-fit mx-auto border border-red-500/30">
          <Siren className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-white">404 - Page Not Found</h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          The requested Emergency Response Desk route does not exist or has been relocated.
        </p>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
