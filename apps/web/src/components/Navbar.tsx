import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Search,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  History,
  Settings,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QuickScanModal } from './QuickScanModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickScanOpen, setQuickScanOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Supported Checks', path: '/checks' },
    { name: 'Downloads', path: '/downloads' },
    { name: 'FAQ', path: '/faq' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-violet flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                TrueTrace <span className="text-brand-primary">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono -mt-1 tracking-wider uppercase">
                Digital Identity Guard
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-primary font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setQuickScanOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-primary/15 text-brand-primary hover:bg-brand-primary/25 border border-brand-primary/30 transition-all"
            >
              <Search size={14} />
              Quick Scan
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-navy-900 border border-navy-700 hover:border-navy-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-violet/20 text-brand-violet flex items-center justify-center font-bold text-xs">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                    {user.full_name}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-navy-800">
                      <p className="text-xs font-semibold text-slate-200 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
                    >
                      <LayoutDashboard size={14} className="text-brand-primary" />
                      Dashboard
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
                    >
                      <History size={14} className="text-emerald-400" />
                      Scan History
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
                    >
                      <Settings size={14} className="text-slate-400" />
                      Account Settings
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-navy-800 transition-colors"
                      >
                        <ShieldAlert size={14} />
                        Admin Console
                      </Link>
                    )}

                    <div className="border-t border-navy-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-navy-800 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary hover:bg-blue-600 text-white shadow-md shadow-brand-primary/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setQuickScanOpen(true)}
              className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-navy-800 bg-navy-900/95 px-4 pt-3 pb-6 space-y-3">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                      : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-navy-800 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
                  >
                    Scan History
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-navy-800"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-medium border border-navy-700 text-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-semibold bg-brand-primary text-white"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Quick Scan Modal */}
      <QuickScanModal isOpen={quickScanOpen} onClose={() => setQuickScanOpen(false)} />
    </>
  );
};
