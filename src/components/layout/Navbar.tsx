import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Siren,
  Bell,
  PlusCircle,
  ListFilter,
  BarChart3,
  Users,
  Shield,
  LogOut,
  LogIn,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, switchDemoUser, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = (targetRole: UserRole) => {
    switchDemoUser(targetRole);
    setShowRoleSwitcher(false);
    if (targetRole === 'authority') navigate('/authority');
    else if (targetRole === 'admin') navigate('/admin');
    else navigate('/reports');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-red-600 group-hover:bg-red-500 rounded-xl text-white shadow-lg shadow-red-900/30 transition">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
                Emergency Response Desk
              </span>
              <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                Public Safety & Triage Network
              </span>
            </div>
          </Link>

          {/* Navigation Links based on active Role */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/report"
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition ${
                isActive('/report')
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-red-400 hover:bg-red-950/50 hover:text-red-300'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Emergency</span>
            </Link>

            <Link
              to="/reports"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                isActive('/reports') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>My Reports</span>
            </Link>

            {(role === 'authority' || role === 'admin') && (
              <>
                <div className="h-4 w-px bg-slate-800 mx-1" />
                <Link
                  to="/authority"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive('/authority') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Authority Queue</span>
                </Link>

                <Link
                  to="/authority/team"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive('/authority/team') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Team</span>
                </Link>

                <Link
                  to="/authority/analytics"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive('/authority/analytics') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Analytics</span>
                </Link>
              </>
            )}

            {role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  isActive('/admin') ? 'bg-purple-900/60 text-purple-200' : 'text-purple-300 hover:bg-purple-950/40'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Admin Hub</span>
              </Link>
            )}
          </div>

          {/* Right Side Actions: Notification, Role Switcher, Auth */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
            </div>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span className="capitalize hidden sm:inline">{role} Mode</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 p-2 text-xs space-y-1">
                  <p className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Evaluator Persona
                  </p>
                  <button
                    onClick={() => handleRoleSwitch('reporter')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg font-semibold flex items-center justify-between ${
                      role === 'reporter' ? 'bg-red-600/20 text-red-300 border border-red-500/30' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>Reporter Mode (Public)</span>
                    {role === 'reporter' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('authority')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg font-semibold flex items-center justify-between ${
                      role === 'authority' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>Authority / Dispatcher</span>
                    {role === 'authority' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg font-semibold flex items-center justify-between ${
                      role === 'admin' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>System Administrator</span>
                    {role === 'admin' && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <button
                onClick={signOut}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1 shadow-md transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
