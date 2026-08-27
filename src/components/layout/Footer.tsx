import React from 'react';
import { Link } from 'react-router-dom';
import { Siren, Shield, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-red-600 rounded-lg text-white">
                <Siren className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-base">Emergency Response Desk</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Automated public emergency complaint reporting and deterministic server-side triage platform. Designed for fast public reporting, zero-delay emergency scoring, and authority dispatch coordination.
            </p>
            <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-lg text-[11px] text-red-300">
              ⚠️ <strong>Emergency Notice</strong>: This platform does not replace official emergency dispatch (911/112). Always call your local emergency service first if you or someone else is in immediate physical danger.
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/report" className="hover:text-red-400 transition">Report an Emergency</Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-white transition">Track My Reports</Link>
              </li>
              <li>
                <Link to="/authority" className="hover:text-white transition">Authority Operations Queue</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition">Sign In / Register</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Legal & Security</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">Terms of Use</Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Encrypted Auth • Signed Media URLs • Deterministic Priority Enforcement
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} Emergency Response Desk. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Built for Public Safety and Emergency Responders</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
