import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, MessageSquare, Phone, TrendingUp, Award, Layers,
  CheckCircle2, Clock, PackageCheck, AlertCircle, Sparkles,
  ArrowUpRight, BarChart3, HelpCircle, PackagePlus
} from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import api from '../api/client';
import AgGridCustomTable from '../components/widgets/AgGridCustomTable';

export default function SellerAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/analytics/seller/overview');
      const payload = res?.data || res;
      setData(payload);
    } catch (err) {
      console.error('Failed to load seller analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const kpis = data?.kpis || {};
  const subscription = data?.subscription || {};
  const profile = data?.profile || {};
  const listings = data?.listingBreakdown || [];

  const score = Number(kpis.usefulnessScore || 0);
  const scoreColor =
    score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-blue-600' : 'bg-amber-500';

  // AG Grid columns for listing-level performance
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Stock Lot & Material',
        field: 'title',
        flex: 2.2,
        minWidth: 280,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          const thumb =
            item.image ||
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80';
          return (
            <div className="flex items-center gap-3 w-full min-w-0 overflow-hidden py-1">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="font-bold text-slate-900 block truncate leading-tight text-xs md:text-sm" title={item.title}>
                  {item.title}
                </span>
                <span className="text-[11px] font-medium text-slate-500 block truncate">
                  {item.category} • {item.fabricType}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 140,
        cellRenderer: (params: any) => {
          const status = params.value;
          if (!status) return null;
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border truncate inline-block ${
                status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : status === 'PENDING_APPROVAL'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : status === 'SOLD'
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {status.replace('_', ' ')}
            </span>
          );
        },
      },
      {
        headerName: 'Quantity & Price',
        field: 'quantityAmount',
        flex: 1.2,
        minWidth: 150,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          return (
            <div className="leading-tight w-full min-w-0 overflow-hidden">
              <span className="font-bold text-slate-900 block text-xs truncate">
                {Number(item.quantityAmount).toLocaleString()} {item.quantityUnit}
              </span>
              <span className="text-blue-600 text-xs font-bold block truncate">
                {item.priceAmount ? `₹${item.priceAmount} ${item.priceUnit}` : 'On Request'}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Buyer Views',
        field: 'views',
        width: 120,
        sort: 'desc',
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{params.value || 0}</span>
          </div>
        ),
      },
      {
        headerName: 'Direct Inquiries',
        field: 'inquiries',
        width: 150,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          return (
            <div className="leading-tight">
              <span className="font-extrabold text-blue-700 text-xs block">
                {item.inquiries || 0} inquiries
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                  <MessageSquare className="w-3 h-3" /> {item.whatsappClicks || 0}
                </span>
                <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                  <Phone className="w-3 h-3" /> {item.phoneCalls || 0}
                </span>
              </div>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Banner Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
              Seller Performance Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Listing Performance & Inquiries Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Track buyer engagement, WhatsApp chat leads, phone call inquiries, and listing clearance velocity for {profile.companyName || 'your account'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/listings/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 select-none active:scale-95"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Add New Stock Lot</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Stock Views
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {kpis.totalViews || 0}
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Across {kpis.totalListings || 0} stock lots
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Buyer Inquiries Received
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600">
              {kpis.totalInquiries || 0}
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {kpis.whatsappClicks || 0} WhatsApp • {kpis.phoneCalls || 0} Calls
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Quota Utilization */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Quota Consumption
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {kpis.quotaUtilization || 0}%
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {subscription.usedQuota || 0} of {subscription.quotaLimit || '∞'} lots used
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Seller Usefulness Score */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              My Usefulness Score
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {score}
              <span className="text-sm font-bold text-slate-400">/100</span>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
              <div className={`h-full rounded-full ${scoreColor}`} style={{ width: `${score}%` }} />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Lot-by-Lot Engagement Table (AG Grid) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Stock Lot Engagement & Inquiries Breakdown
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Individual view counts, WhatsApp conversation initiations, and direct telephone call leads per fabric listing.
            </p>
          </div>
        </div>

        <AgGridCustomTable
          rowData={listings}
          columnDefs={columnDefs}
          isLoading={loading}
          rowHeight={64}
          height="460px"
          defaultPageSize={10}
          pageSizeOptions={[10, 20, 50]}
          searchPlaceholder="Quick search your fabric titles, categories, condition..."
          emptyMessage="No stock lot metrics available yet"
        />
      </div>

      {/* Growth & Inquiry Optimization Tips */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>How to Boost Buyer Inquiries & Quicker Stock Liquidity</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
            <span className="font-bold text-slate-900 block">📸 Add High-Resolution Fabric Photos</span>
            <p className="text-slate-500 leading-relaxed">
              Listings featuring roll selvage labels, weave texture closeups, and defect inspections generate 3.2x more WhatsApp chats.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
            <span className="font-bold text-slate-900 block">💰 Transparent Per-Meter Pricing</span>
            <p className="text-slate-500 leading-relaxed">
              Clear rates eliminate hesitation. Buyers are 45% more likely to dial the seller directly when a realistic price is stated.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
            <span className="font-bold text-slate-900 block">⚡ Mark Sold Lots Promptly</span>
            <p className="text-slate-500 leading-relaxed">
              Marking sold lots updates your clearance rate score, boosting your mill ranking in the top textile supplier directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
