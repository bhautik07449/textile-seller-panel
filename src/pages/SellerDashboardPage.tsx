import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  PackageCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  PlusCircle,
  ArrowUpRight,
  FileEdit,
  Building2,
  Plus,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res: any = await api.get('/seller/dashboard');
        const payload = res?.data || res;
        if (payload) setData(payload);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium text-sm animate-pulse">
        Loading seller inventory, credits, and moderation status...
      </div>
    );
  }

  const sub = data?.subscription?.subscription;
  const quota = data?.subscription?.quota;
  const listings = data?.listings || {};
  const feedback = data?.recentFeedback || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Welcome Banner Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.sellerProfile?.companyName || 'Seller'}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium leading-relaxed">
            Real-time overview of your textile surplus inventory, active subscription quotas, and moderation status.
          </p>
        </div>
        <Link
          to="/listings/new"
          className="w-full sm:w-auto justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs hover:shadow-sm flex items-center gap-2 shrink-0 transition-all text-sm select-none active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>Create Stock Listing</span>
        </Link>
      </div>

      {/* Subscription & Listing Quota Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Active Plan Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Subscription
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                sub?.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {sub?.status || 'No Active Plan'}
              </span>
            </div>

            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
              {sub?.packageNameSnapshot || 'No Active Package'}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {sub?.currentPeriodEnd
                ? `Expires on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                : 'Subscribe to a package to start listing stock'}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/subscription"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Manage / Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Listing Quota Tracker */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Listing Credits
              </span>
              <span className="text-xs font-bold text-blue-600">{quota?.remaining || 0} Credits Left</span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">{quota?.used || 0}</span>
              <span className="text-xs font-medium text-slate-500">
                of {quota?.total || 0} credits used this cycle
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${quota?.total > 0 ? ((quota.used || 0) / quota.total) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-medium text-slate-400">
            * 1 credit per new stock lot published. Edits are completely free.
          </div>
        </div>

        {/* Total Stock Volume */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Listings Created
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PackageCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{listings.TOTAL || 0}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {listings.APPROVED || 0} approved and actively visible to bulk buyers
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/listings"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Listings <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Moderation Alert Banner (If Any Rejected Listings) */}
      {feedback.some((item: any) => item.status === 'REJECTED') && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600 stroke-[2.2]" />
            <h3 className="font-bold text-sm">Action Needed: Listing Moderation Feedback</h3>
          </div>
          <p className="text-xs font-medium text-rose-700">
            One or more of your submitted stock listings were rejected by our moderation team. Review the
            reason and update your listing to resubmit for review.
          </p>

          <div className="space-y-2 mt-2">
            {feedback
              .filter((f: any) => f.status === 'REJECTED')
              .map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-xl border border-rose-200 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    <span className="text-rose-600 mt-0.5 block font-semibold">Reason: "{item.rejectionReason}"</span>
                  </div>
                  <Link
                    to={`/listings/${item.id}/edit`}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center gap-1 shadow-2xs"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Edit & Resubmit
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Inventory Status Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider select-none">
          Inventory Breakdown by Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 shadow-2xs flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] font-bold text-emerald-700 uppercase block">Approved & Live</span>
              <span className="text-2xl font-bold text-emerald-800 block mt-1">
                {listings.APPROVED || 0}
              </span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[2.2]" />
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 shadow-2xs flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] font-bold text-amber-700 uppercase block">Under Review</span>
              <span className="text-2xl font-bold text-amber-800 block mt-1">
                {listings.PENDING_APPROVAL || 0}
              </span>
            </div>
            <Clock className="w-6 h-6 text-amber-600 stroke-[2.2]" />
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/70 shadow-2xs flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] font-bold text-blue-700 uppercase block">Sold Out</span>
              <span className="text-2xl font-bold text-blue-800 block mt-1">{listings.SOLD || 0}</span>
            </div>
            <Archive className="w-6 h-6 text-blue-600 stroke-[2.2]" />
          </div>

          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/70 shadow-2xs flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] font-bold text-rose-700 uppercase block">Rejected Lots</span>
              <span className="text-2xl font-bold text-rose-800 block mt-1">{listings.REJECTED || 0}</span>
            </div>
            <XCircle className="w-6 h-6 text-rose-600 stroke-[2.2]" />
          </div>
        </div>
      </div>
    </div>
  );
}
