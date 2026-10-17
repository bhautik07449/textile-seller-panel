import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Check,
  Clock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  History,
} from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import api from '../api/client';
import CommonButton from '../components/widgets/common_button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import AgGridCustomTable from '../components/widgets/AgGridCustomTable';

interface ActiveSubscription {
  packageId: string;
  packageNameSnapshot: string;
  status: string;
  currentPeriodEnd?: string;
}

interface Quota {
  total: number;
  used: number;
  remaining: number;
}

interface PackageTier {
  id: string;
  name: string;
  description?: string;
  priceAmount: number | string;
  billingInterval: string;
  listingQuota: number;
  isActive: boolean;
}

interface SubscriptionRecord {
  id: string;
  createdAt: string;
  packageNameSnapshot: string;
  listingQuotaSnapshot: number;
  packagePriceSnapshot: number | string;
  currentPeriodEnd?: string;
  status: string;
}

export default function SellerSubscriptionPage() {
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [packages, setPackages] = useState<PackageTier[]>([]);
  const [history, setHistory] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subRes, packagesRes, historyRes]: any = await Promise.all([
        api.get('/seller/subscription'),
        api.get('/packages'),
        api.get('/seller/subscriptions'),
      ]);

      const subPayload = subRes?.data || subRes;
      if (subPayload?.subscription) {
        setActiveSub(subPayload.subscription);
        setQuota(subPayload.quota);
      }
      const pkgs = packagesRes?.data?.data || packagesRes?.data || packagesRes || [];
      setPackages(Array.isArray(pkgs) ? pkgs : []);
      const hist = historyRes?.data?.data || historyRes?.data || historyRes || [];
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubscribe = async (packageId: string) => {
    try {
      setSubscribing(true);
      setFeedback(null);
      await api.post('/seller/subscriptions', {
        packageId,
        activationMethod: 'TEST',
      });
      setFeedback({
        type: 'success',
        message: 'Subscription successfully activated! Your new listing quota is ready.',
      });
      await loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Subscription request failed.',
      });
    } finally {
      setSubscribing(false);
    }
  };

  const historyColumns = useMemo<ColDef<SubscriptionRecord>[]>(
    () => [
      {
        headerName: 'Date',
        field: 'createdAt',
        flex: 1.2,
        minWidth: 130,
        cellRenderer: (params: any) => (
          <span className="font-medium text-slate-800 text-xs">
            {params.value ? new Date(params.value).toLocaleDateString() : ''}
          </span>
        ),
      },
      {
        headerName: 'Package',
        field: 'packageNameSnapshot',
        flex: 1.5,
        minWidth: 160,
        cellRenderer: (params: any) => (
          <span className="font-semibold text-slate-900 text-xs">{params.value}</span>
        ),
      },
      {
        headerName: 'Quota Snapshot',
        field: 'listingQuotaSnapshot',
        width: 160,
        cellRenderer: (params: any) => (
          <span className="text-blue-600 font-bold text-xs">{params.value} listings</span>
        ),
      },
      {
        headerName: 'Amount',
        field: 'packagePriceSnapshot',
        width: 140,
        cellRenderer: (params: any) => (
          <span className="font-bold text-slate-900 text-xs">
            ₹{Number(params.value).toLocaleString()}
          </span>
        ),
      },
      {
        headerName: 'Period End',
        field: 'currentPeriodEnd',
        width: 140,
        cellRenderer: (params: any) => (
          <span className="text-slate-500 text-xs">
            {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
          </span>
        ),
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 130,
        cellRenderer: (params: any) => {
          const st = params.value;
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                st === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {st}
            </span>
          );
        },
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-44 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Subscription Plans & Quota
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select a listing package based on the volume of dead textile stock lots you clear each cycle
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Active Subscription Banner */}
      <Card className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Current Membership
            </span>
            <Badge variant={activeSub?.status === 'ACTIVE' ? 'success' : 'warning'}>
              {activeSub?.status || 'No Plan'}
            </Badge>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">
            {activeSub?.packageNameSnapshot || 'No Active Subscription'}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {activeSub?.currentPeriodEnd
              ? `Billing Cycle Valid Through: ${new Date(activeSub.currentPeriodEnd).toLocaleDateString()}`
              : 'Subscribe to a package below to start posting surplus listings'}
          </p>
        </div>

        {/* Quota metric */}
        {quota && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Total Quota</span>
              <span className="font-extrabold text-slate-900 text-lg block">{quota.total}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Consumed</span>
              <span className="font-extrabold text-slate-900 text-lg block">{quota.used}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium block">Remaining</span>
              <span className="font-extrabold text-blue-700 text-lg block">{quota.remaining}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Available Plans (Top 3 Admin Managed Plans) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Subscription Plans & Quota</h2>
            <p className="text-xs text-slate-500 font-medium">
              3 active membership tiers configured and managed by platform administration.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60 w-fit">
            Admin Controlled Plans
          </span>
        </div>

        {packages.filter((p) => p.isActive).length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
            No active subscription packages currently configured by platform administration.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages
              .filter((p) => p.isActive)
              .slice(0, 3)
              .map((pkg) => {
                const isCurrent = activeSub?.packageId === pkg.id && activeSub?.status === 'ACTIVE';

                return (
                  <Card
                    key={pkg.id}
                    className={`p-6 flex flex-col justify-between transition ${
                      isCurrent
                        ? 'border-blue-600 ring-2 ring-blue-500/10 shadow-md'
                        : 'border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                  >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">{pkg.name}</h3>
                      {isCurrent && (
                        <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>

                    <div className="mt-4 pb-4 border-b border-slate-100">
                      <span className="text-3xl font-extrabold text-slate-900">
                        ₹{Number(pkg.priceAmount).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium ml-1">
                        /{pkg.billingInterval.toLowerCase()}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>
                          <strong>{pkg.listingQuota} Stock Listings</strong> per cycle
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Direct phone & WhatsApp contact</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Free listing edits</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4">
                    <CommonButton
                      onClick={() => handleSubscribe(pkg.id)}
                      disabled={isCurrent || subscribing}
                      isLoading={subscribing}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 hover:bg-slate-100'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      {isCurrent ? 'Current Active Package' : 'Activate Package'}
                      {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                    </CommonButton>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Billing & Subscription History with AG Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          Subscription & Billing History
        </h2>

        <AgGridCustomTable<SubscriptionRecord>
          rowData={history}
          columnDefs={historyColumns}
          isLoading={loading}
          rowHeight={52}
          height="380px"
          defaultPageSize={10}
          pageSizeOptions={[10, 20, 50]}
          searchPlaceholder="Quick search billing records..."
          emptyMessage="No previous subscription records found"
        />
      </div>
    </div>
  );
}
