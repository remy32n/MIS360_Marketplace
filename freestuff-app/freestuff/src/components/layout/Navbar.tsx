import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Gift, Bell, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { engagementAPI } from '../../services/api';
import { timeAgo } from '../../utils/formatters';

export function Navbar() {
  const { user, org, isAuthenticated, isAdmin, isOrg, isStudent, logout } = useAuth();
  const location = useLocation();
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
    } catch {
      // silently ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await engagementAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await engagementAPI.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const getInitials = () => {
    if (org?.orgName) return org.orgName.substring(0, 2).toUpperCase();
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`;
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navBtn = (to: string, label: string) => (
    <Button variant={isActive(to) ? 'secondary' : 'ghost'} size="sm" asChild>
      <Link to={to}>{label}</Link>
    </Button>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to={isAuthenticated ? (isAdmin ? '/admin/approvals' : isOrg ? '/org/listings' : '/browse') : '/'}
            className="flex items-center gap-2"
            data-testid="link-logo"
          >
            <span className="text-xl font-bold font-serif text-primary">Free Stuff <span role="img" aria-label="gift">🎁</span></span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" data-testid="link-login">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup" data-testid="link-signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <>
                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1 mr-2">
                  {isStudent && (
                    <>
                      {navBtn('/browse', 'Browse')}
                      {navBtn('/saved', 'Saved')}
                    </>
                  )}
                  {isOrg && (
                    <>
                      {navBtn('/browse', 'Browse')}
                      {navBtn('/org/listings', 'My Listings')}
                      <Button size="sm" variant={isActive('/org/listings/new') ? 'secondary' : 'default'} asChild>
                        <Link to="/org/listings/new">Post Giveaway</Link>
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      {navBtn('/admin/approvals', 'Pending Review')}
                      {navBtn('/admin/activity', 'Activity')}
                      {navBtn('/admin/orgs', 'Orgs')}
                      {navBtn('/browse', 'Browse')}
                    </>
                  )}
                </div>

                {/* Notification Bell */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9" data-testid="button-notifications">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-7 text-xs">
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`flex flex-col gap-1 px-4 py-3 text-sm border-b last:border-0 cursor-pointer hover:bg-muted/30 transition-colors ${notif.readAt ? 'opacity-60' : 'bg-primary/5'}`}
                            onClick={() => !notif.readAt && handleMarkRead(notif.id)}
                          >
                            <div className="flex justify-between gap-2">
                              <p className="text-foreground leading-snug">{notif.message}</p>
                              {!notif.readAt && <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />}
                            </div>
                            <span className="text-xs text-muted-foreground">{timeAgo(notif.sentAt || notif.createdAt)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Avatar Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" data-testid="button-user-menu">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {org?.orgName || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        {isAdmin && <p className="text-xs leading-none text-primary font-medium">System Admin</p>}
                        {isOrg && org && (
                          <p className={`text-xs leading-none font-medium ${org.verificationStatus === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {org.verificationStatus === 'VERIFIED' ? 'Verified Org' : 'Pending Verification'}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Mobile-only nav items */}
                    {isStudent && (
                      <>
                        <DropdownMenuItem asChild className="md:hidden">
                          <Link to="/browse">Browse</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="md:hidden">
                          <Link to="/saved">Saved Items</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isOrg && (
                      <>
                        <DropdownMenuItem asChild className="md:hidden">
                          <Link to="/browse">Browse</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="md:hidden">
                          <Link to="/org/listings">My Listings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="md:hidden">
                          <Link to="/org/listings/new">Post Giveaway</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild className="md:hidden">
                          <Link to="/admin/approvals">Pending Review</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="md:hidden">
                          <Link to="/admin/orgs">Manage Orgs</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="md:hidden">
                          <Link to="/browse">Browse</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
