import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Check,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  History,
  Sparkles,
  PackagePlus,
  Coins,
  Layers,
  Zap,
} from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import api from '../api/client';
import CommonButton from '../components/widgets/common_button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import AgGridCustomTable from '../components/widgets/AgGridCustomTable';

interface ActiveSubscription {
  packageId: string;
  packageNameSnapshot: string;
  status: string;
  listingQuotaSnapshot?: number;
}

interface Quota {
  total: number;
  used: number;
  remaining: number;
  canCreateListing?: boolean;
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
  status: string;
}

export default function SellerSubscriptionPage() {
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [packages, setPackages] = useState<PackageTier[]>([]);
  const [history, setHistory] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
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
      if (subPayload) {
        setActiveSub(subPayload.subscription || null);
        setQuota(subPayload.quota || null);
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

  const handlePurchaseListingPack = async (pkg: PackageTier) => {
    try {
      setPurchasingId(pkg.id);
      setFeedback(null);
      const res: any = await api.post('/seller/subscriptions', {
        packageId: pkg.id,
        activationMethod: 'TEST',
      });
      const responseData = res?.data || res;
      setFeedback({
        type: 'success',
        message:
          responseData?.message ||
          `Successfully purchased ${pkg.listingQuota} listing credits with ${pkg.name}! Credits added to your quota.`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to purchase listing credits. Please try again.',
      });
    } finally {
      setPurchasingId(null);
    }
  };

  const historyColumns = useMemo<ColDef<SubscriptionRecord>[]>(
    () => [
      {
        headerName: 'Purchase Date',
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
        headerName: 'Listing Pack / Package',
        field: 'packageNameSnapshot',
        flex: 1.5,
        minWidth: 160,
        cellRenderer: (params: any) => (
          <span className="font-semibold text-slate-900 text-xs">{params.value}</span>
        ),
      },
      {
        headerName: 'Quota Added',
        field: 'listingQuotaSnapshot',
        width: 160,
        cellRenderer: (params: any) => (
          <span className="text-blue-600 font-bold text-xs">+{params.value} listings</span>
        ),
      },
      {
        headerName: 'Price Paid',
        field: 'packagePriceSnapshot',
        width: 140,
        cellRenderer: (params: any) => (
          <span className="font-bold text-slate-900 text-xs">
            ₹{Number(params.value).toLocaleString()}
          </span>
        ),
      },
      {
        headerName: 'Validity',
        width: 170,
        cellRenderer: () => (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Check className="w-3 h-3" /> No Expiry (Quota Based)
          </span>
        ),
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 120,
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

  const isQuotaEmpty = !quota || quota.remaining <= 0;

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-800 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
          <Coins className="w-3.5 h-3.5" />
          <span>Pay-Per-Listing Quota (नो मंथली एक्सपायरी)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Listing Quota & Credit Packs
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Listing credits do not expire monthly. Once your listing limit is reached, simply purchase more listing credits to continue publishing surplus lots.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border shadow-2xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Quota Exhausted Warning Alert */}
      {isQuotaEmpty && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                Your Listing Limit is Exhausted (0 Lots Remaining)
              </h4>
              <p className="text-amber-800 mt-0.5 font-medium">
                Aapki listing limit poori ho gayi hai. Naye fabric lots list karne ke liye niche diye gaye kisi bhi Listing Pack ko purchase karein.
              </p>
            </div>
          </div>
          <a
            href="#pricing-packs"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 text-center transition shadow-xs active:scale-95"
          >
            Purchase Listing Credits
          </a>
        </div>
      )}

      {/* Active Listing Balance Wallet Card */}
      <Card className="p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Account Status
            </span>
            <Badge variant={!isQuotaEmpty ? 'success' : 'warning'}>
              {!isQuotaEmpty ? 'Active Quota' : 'Quota Exhausted'}
            </Badge>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              No Monthly Expiry
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">
            {quota ? `${quota.remaining} Listing Credits Left` : '0 Listing Credits Left'}
          </h2>

          <p className="text-xs text-slate-500 font-medium max-w-lg leading-relaxed">
            Har listing publish karne par 1 credit consume hota hai. Unused credits expire nahi hote aur aapke balance me rehte hain.
          </p>
        </div>

        {/* Quota Numbers Counter */}
        {quota && (
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 flex items-center gap-6 sm:gap-8 text-xs shrink-0 shadow-2xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block tracking-wider">
                Total Purchased
              </span>
              <span className="font-extrabold text-slate-900 text-xl block mt-0.5">
                {quota.total} <span className="text-xs font-medium text-slate-500">lots</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block tracking-wider">
                Lots Used
              </span>
              <span className="font-extrabold text-slate-600 text-xl block mt-0.5">
                {quota.used} <span className="text-xs font-medium text-slate-400">lots</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <span className="text-blue-600 font-bold uppercase text-[10px] block tracking-wider">
                Available Left
              </span>
              <span className="font-extrabold text-blue-600 text-2xl block mt-0.5">
                {quota.remaining} <span className="text-xs font-bold text-blue-500">lots</span>
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Available Listing Packs (Purchase More Listings anytime) */}
      <div id="pricing-packs" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Purchase Listing Packs (लिस्टिंग कोटा खरीदें)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Choose how many surplus lots you want to list. Credits are added instantly to your balance.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 w-fit">
            ✓ Instant Top-up Activation
          </span>
        </div>

        {packages.filter((p) => p.isActive).length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-3xl">
            No listing packages configured. Please contact platform administration.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages
              .filter((p) => p.isActive)
              .map((pkg) => {
                const isProcessing = purchasingId === pkg.id;

                return (
                  <Card
                    key={pkg.id}
                    className="p-6 sm:p-7 flex flex-col justify-between border-slate-200 hover:border-blue-400 hover:shadow-md transition-all rounded-3xl group bg-white shadow-2xs"
                  >
                    <div>
                      {/* Pack Header */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 font-extrabold text-xs">
                          {pkg.listingQuota} Listings Pack
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          One-Time Top-up
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-xl mt-3 tracking-tight">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {pkg.description || `Allows listing ${pkg.listingQuota} deadstock lots on the marketplace.`}
                      </p>

                      {/* Price Tag */}
                      <div className="mt-5 pb-5 border-b border-slate-100">
                        <span className="text-3xl font-extrabold text-slate-900">
                          ₹{Number(pkg.priceAmount).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold ml-1.5">
                          for {pkg.listingQuota} lots (₹{Math.round(Number(pkg.priceAmount) / pkg.listingQuota)}/lot)
                        </span>
                      </div>

                      {/* Benefits */}
                      <ul className="mt-5 space-y-2.5 text-xs text-slate-600 font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span className="text-slate-800">
                            <strong>+{pkg.listingQuota} Listings</strong> added to your quota
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>
                            <strong>No monthly expiration</strong> • Use anytime
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Direct buyer WhatsApp & phone inquiries</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Free listing updates & price edits</span>
                        </li>
                      </ul>
                    </div>

                    {/* Purchase CTA */}
                    <div className="mt-7 pt-4">
                      <CommonButton
                        onClick={() => handlePurchaseListingPack(pkg)}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs group-hover:shadow-md active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Purchase {pkg.listingQuota} Listings Pack</span>
                        {!isProcessing && <ArrowRight className="w-3.5 h-3.5" />}
                      </CommonButton>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Purchase / Billing History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          Listing Credits Purchase History
        </h2>

        <AgGridCustomTable<SubscriptionRecord>
          rowData={history}
          columnDefs={historyColumns}
          isLoading={loading}
          rowHeight={52}
          height="340px"
          defaultPageSize={10}
          pageSizeOptions={[10, 20, 50]}
          searchPlaceholder="Quick search listing pack records..."
          emptyMessage="No previous listing purchases found"
        />
      </div>
    </div>
  );
}
