import React from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../lib/utils';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-red-400" />
          <h3 className="font-bold text-sm">In-App Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">
            No notifications right now.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 transition flex items-start justify-between space-x-3 ${
                item.is_read ? 'bg-slate-900/60 opacity-75' : 'bg-slate-800/40 border-l-4 border-red-500'
              }`}
            >
              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-300 line-clamp-2">{item.message}</p>
                <p className="text-[10px] text-slate-500 font-mono">{formatDate(item.created_at)}</p>
              </div>
              {!item.is_read && (
                <button
                  onClick={() => markAsRead(item.id)}
                  className="text-slate-400 hover:text-red-400 p-1 shrink-0"
                  title="Mark read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
