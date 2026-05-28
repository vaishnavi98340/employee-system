import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  Users, 
  LogOut,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Layout() {
  const { profile, logout } = useAuth();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/attendance", icon: Clock, label: "Attendance" },
    { to: "/leave", icon: CalendarDays, label: "Leave Requests" },
  ];

  if (profile?.role === 'ADMIN' || profile?.role === 'HOD') {
    navItems.push({ to: "/admin", icon: Users, label: "Administration" });
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">A</div>
            <span className="text-white font-bold tracking-tight text-lg">Academia <span className="font-light text-blue-400">EMS</span></span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-slate-800 text-white shadow-inner" 
                  : "hover:bg-slate-800/50 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={cn("transition-colors", isActive ? "text-blue-400" : "text-slate-500")} />
                  <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold uppercase shadow-sm shrink-0">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{profile?.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{profile?.role}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Header Placeholder */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campus Network Active</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-widest">
              Session: 2024-25
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
