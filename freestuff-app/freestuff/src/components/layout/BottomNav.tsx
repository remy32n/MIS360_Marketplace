import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Bookmark, User, ClipboardList, Activity, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function BottomNav() {
  const { isStudent, isOrg, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const tabClass = (path: string) =>
    `flex flex-col items-center justify-center gap-0.5 p-2 transition-opacity ${
      isActive(path) ? 'opacity-100' : 'opacity-40 hover:opacity-70'
    }`;

  if (isAdmin) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-14 px-2 max-w-2xl mx-auto">
          <Link to="/admin/approvals" className={tabClass('/admin/approvals')}>
            <ClipboardList className={`w-6 h-6 ${isActive('/admin/approvals') ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-semibold">Review</span>
          </Link>
          <Link to="/admin/activity" className={tabClass('/admin/activity')}>
            <Activity className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Activity</span>
          </Link>
          <Link to="/admin/orgs" className={tabClass('/admin/orgs')}>
            <Building2 className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Orgs</span>
          </Link>
          <Link to="/browse" className={tabClass('/browse')}>
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Browse</span>
          </Link>
          <button onClick={logout} className="flex flex-col items-center justify-center gap-0.5 p-2 opacity-40 hover:opacity-70 transition-opacity">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Logout</span>
          </button>
        </div>
      </footer>
    );
  }

  if (isOrg) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-14 px-2 max-w-2xl mx-auto">
          <Link to="/browse" className={tabClass('/browse')}>
            <Home className={`w-6 h-6 ${isActive('/browse') ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link to="/org/listings" className={tabClass('/org/listings')}>
            <ClipboardList className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Listings</span>
          </Link>
          <Link to="/org/listings/new" className={tabClass('/org/listings/new')}>
            <PlusSquare className={`w-6 h-6 ${isActive('/org/listings/new') ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-semibold">Post</span>
          </Link>
          <button onClick={logout} className="flex flex-col items-center justify-center gap-0.5 p-2 opacity-40 hover:opacity-70 transition-opacity">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Profile</span>
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14 px-2 max-w-2xl mx-auto">
        <Link to="/browse" className={tabClass('/browse')}>
          <Home className={`w-6 h-6 ${isActive('/browse') ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link to="/browse?focus=search" className="flex flex-col items-center justify-center gap-0.5 p-2 opacity-40 hover:opacity-70 transition-opacity">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Search</span>
        </Link>
        <Link to="/saved" className={tabClass('/saved')}>
          <Bookmark className={`w-6 h-6 ${isActive('/saved') ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-semibold">Saved</span>
        </Link>
        <button onClick={logout} className="flex flex-col items-center justify-center gap-0.5 p-2 opacity-40 hover:opacity-70 transition-opacity">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </div>
    </footer>
  );
}
