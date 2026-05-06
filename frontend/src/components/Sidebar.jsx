import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, PlusCircle, Table2, BookOpen,
  LogOut, Package, KeyRound, ArrowDownCircle, Menu, X, History
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-stock', icon: PlusCircle, label: 'Stock In', color: 'text-emerald-300' },
  { to: '/stock-out', icon: ArrowDownCircle, label: 'Stock Out', color: 'text-red-300' },
  { to: '/stock-table', icon: Table2, label: 'Stock Table' },
  { to: '/catalogue', icon: BookOpen, label: 'Catalogue' },
  { to: '/movements', icon: History, label: 'Movement History' },
  { to: '/change-password', icon: KeyRound, label: 'Change Password' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Inventory Pro</h1>
            <p className="text-blue-200 text-xs">{user?.businessName || 'Stock Management'}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-medium text-sm truncate">{user?.name}</p>
            <p className="text-blue-200 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? 'bg-white text-brand-700 shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`
            }>
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-brand-600' : (color || 'text-blue-200')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-white w-full transition-all duration-150">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button className="lg:hidden fixed top-4 left-4 z-50 bg-brand-900 text-white p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-brand-900 to-brand-800 z-40 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-brand-900 to-brand-800 min-h-screen fixed top-0 left-0">
        <SidebarContent />
      </aside>
    </>
  );
}
