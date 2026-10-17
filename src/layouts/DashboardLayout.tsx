import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  ListFilter,
  CreditCard,
  UserCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Building2,
  Sparkles,
  AlertCircle,
  Plus,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

interface QuotaInfo {
  total: number;
  used: number;
  remaining: number;
  canCreate: boolean;
  canCreateListing?: boolean;
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const buyerUrl = import.meta.env.VITE_BUYER_PORTAL_URL || 'http://localhost:5175';

  useEffect(() => {
    async function loadQuota() {
      try {
        const res: any = await api.get('/seller/listing-quota');
        const data = res?.data || res;
        if (data) {
          setQuotaInfo({
            total: Number(data.total) || 0,
            used: Number(data.used) || 0,
            remaining: Number(data.remaining) || 0,
            canCreate: data.canCreateListing ?? data.canCreate ?? ((data.remaining || 0) > 0),
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadQuota();
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Performance & Inquiries', path: '/analytics', icon: BarChart3 },
    { label: 'My Listings', path: '/listings', icon: ListFilter },
    { label: 'Create Listing', path: '/listings/new', icon: PackagePlus, highlight: true },
    { label: 'Subscription & Quota', path: '/subscription', icon: CreditCard },
    { label: 'Company Profile', path: '/profile', icon: UserCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Seller Dashboard', desc: 'Overview of active stock lots, quota consumption, and buyer inquiries.' };
      case '/listings':
        return { title: 'My Fabric Stock Listings', desc: 'Manage your surplus lots, pricing, inspection status, and availability.' };
      case '/listings/new':
        return { title: 'Create Stock Listing', desc: 'Publish a new dead textile lot to the marketplace catalog.' };
      case '/subscription':
        return { title: 'Subscription & Quota', desc: 'Manage your active subscription plan, billing details, and listing credits.' };
      case '/profile':
        return { title: 'Company Profile', desc: 'Configure company identity, GSTIN, mill address, and direct buyer contact channels.' };
      default:
        return { title: 'Seller Portal', desc: 'Direct B2B dead textile clearance platform.' };
    }
  };

  const currentPage = getPageTitle(location.pathname);

  const renderNavContent = () => (
    <>
      {/* Header Branding */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200/80 shrink-0 bg-white">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3.5 shadow-sm shrink-0 text-white font-bold">
          <Building2 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">TexStock</h1>
          <p className="text-xs text-slate-500 font-medium">Seller Portal</p>
        </div>
        {mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto p-2 text-slate-400 hover:text-slate-700 lg:hidden rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <p className="px-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 select-none">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all select-none ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : item.highlight
                  ? 'text-blue-600 bg-blue-50/70 hover:bg-blue-100 hover:text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 stroke-[2.2] ${
                  isActive ? 'text-white' : item.highlight ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quota Mini Widget in Sidebar */}
      {quotaInfo && (
        <div className="mx-3.5 mb-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5">
            <span className="font-bold text-slate-800">Listing Credits</span>
            <span className="text-blue-600 font-extrabold">{quotaInfo.remaining} left</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${quotaInfo.total > 0 ? (quotaInfo.used / quotaInfo.total) * 100 : 0}%`,
              }}
            ></div>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1.5 block">
            {quotaInfo.used} of {quotaInfo.total} credits used
          </span>
        </div>
      )}

      {/* User Footer */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/70">
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs group">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-blue-600">
                {user?.sellerProfile?.companyName ? user.sellerProfile.companyName[0].toUpperCase() : 'S'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.sellerProfile?.companyName || 'Seller Account'}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 truncate">
                {user?.email || user?.phone}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0 border border-rose-200/80 select-none shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200/90 flex-col shrink-0 z-30 shadow-sm">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Header Bar */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 md:px-8 shrink-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 lg:hidden focus:outline-none rounded-xl hover:bg-slate-100"
              title="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate tracking-tight">{currentPage.title}</h2>
              <p className="hidden sm:block text-xs font-medium text-slate-500 mt-0.5 truncate">{currentPage.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:space-x-3 shrink-0">
            {quotaInfo && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold shadow-2xs">
                <span>{quotaInfo.remaining} Listing Credits Left</span>
              </div>
            )}

            {location.pathname !== '/listings/new' && (
              <button
                onClick={() => navigate('/listings/new')}
                className="px-3.5 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5 shrink-0 select-none active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span className="hidden md:inline font-bold">New Listing</span>
                <span className="md:hidden font-bold">Post</span>
              </button>
            )}

            <a
              href={buyerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border border-slate-200/80 shadow-2xs"
            >
              <span className="hidden sm:inline">Buyer Portal</span>
              <span className="sm:hidden">Buyer</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </header>

        {/* View body */}
        <div className="flex-1 overflow-y-auto w-full max-w-full">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
