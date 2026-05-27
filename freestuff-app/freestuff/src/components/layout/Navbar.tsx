import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { engagementAPI } from '../../services/api';
import { timeAgo } from '../../utils/formatters';

export function Navbar() {
  const { isAuthenticated, isAdmin, isOrg } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await engagementAPI.getNotifications();
      const notifs: any[] = res.data.notifications || res.data;
      setNotifications(notifs.slice(0, 5));
      setUnreadCount(res.data.unreadCount ?? notifs.filter((n: any) => !n.readAt).length);
    } catch { }
  };

  const handleMarkAllRead = async () => {
    try {
      await engagementAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch { }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await engagementAPI.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { }
  };

  const logoHref = isAuthenticated
    ? isAdmin ? '/admin/approvals' : isOrg ? '/org/listings' : '/browse'
    : '/login';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        <Link to={logoHref} className="flex items-center gap-1.5">
          <span className="text-xl font-bold tracking-tight text-[#0a0a0a]">
            Free Stuff <span role="img" aria-label="gift">🎁</span>
          </span>
        </Link>

        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-1.5 hover:opacity-70 transition-opacity" aria-label="Notifications">
                <Bell className="w-6 h-6 text-[#0a0a0a]" strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3040] text-[10px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400">No notifications yet</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex flex-col gap-1 px-4 py-3 text-sm border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${notif.readAt ? 'opacity-60' : 'bg-blue-50/40'}`}
                      onClick={() => !notif.readAt && handleMarkRead(notif.id)}
                    >
                      <div className="flex justify-between gap-2">
                        <p className="text-[#0a0a0a] leading-snug">{notif.message}</p>
                        {!notif.readAt && <span className="h-2 w-2 rounded-full bg-[#0095f6] mt-1 shrink-0" />}
                      </div>
                      <span className="text-xs text-gray-400">{timeAgo(notif.sentAt || notif.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!isAuthenticated && (
          <div className="flex gap-2">
            <Link to="/login" className="text-sm font-semibold text-[#0a0a0a] hover:opacity-70">Log In</Link>
            <Link to="/signup" className="text-sm font-semibold text-[#0095f6] hover:opacity-70">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
