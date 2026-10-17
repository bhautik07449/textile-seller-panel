import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  Eye,
  AlertCircle,
  RefreshCw,
  Layers,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  Trash2,
} from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import api from '../api/client';
import CommonButton from '../components/widgets/common_button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import CommonDialog from '../components/widgets/common_dialog';
import AgGridCustomTable from '../components/widgets/AgGridCustomTable';
import { toast } from '../components/ui/toast';

interface ListingItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  conditionCode: string;
  quantityAmount: number | string;
  quantityUnit: string;
  priceAmount?: number | string;
  priceUnit?: string;
  city: string;
  state: string;
  rejectionReason?: string;
  category?: {
    name: string;
  };
  images?: Array<{
    imageUrl: string;
  }>;
}

export default function SellerListingsPage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const buyerUrl = import.meta.env.VITE_BUYER_PORTAL_URL || 'http://localhost:5175';

  const fetchListings = async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}&limit=500` : '?limit=500';
      const res: any = await api.get(`/seller/listings${query}`);
      const items = res?.data?.data || res?.data || res || [];
      setListings(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      setActionLoading(listingId);
      await api.patch(`/seller/listings/${listingId}/status`, { status: newStatus });
      await fetchListings();
    } catch (err: any) {
      // Handled by api interceptor toast
    } finally {
      setActionLoading(null);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<ListingItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/seller/listings/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchListings();
    } catch (err: any) {
      // Handled by api interceptor toast
    } finally {
      setDeleting(false);
    }
  };

  const statusBadges: Record<
    string,
    { label: string; badgeVariant: 'success' | 'warning' | 'destructive' | 'secondary'; icon: any }
  > = {
    APPROVED: { label: 'Approved & Live', badgeVariant: 'success', icon: CheckCircle2 },
    PENDING_APPROVAL: { label: 'Under Review', badgeVariant: 'warning', icon: Clock },
    REJECTED: { label: 'Rejected', badgeVariant: 'destructive', icon: XCircle },
    SOLD: { label: 'Marked Sold', badgeVariant: 'secondary', icon: Archive },
    INACTIVE: { label: 'Inactive / Hidden', badgeVariant: 'secondary', icon: AlertCircle },
  };

  const columnDefs = useMemo<ColDef<ListingItem>[]>(
    () => [
      {
        headerName: 'Stock Lot & Photo',
        field: 'title',
        flex: 2.2,
        minWidth: 320,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          const thumb =
            item.images?.[0]?.imageUrl ||
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80';
          return (
            <div className="flex items-center gap-3 w-full min-w-0 overflow-hidden py-1">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="font-bold text-slate-900 block truncate leading-tight text-xs md:text-sm" title={item.title}>
                  {item.title}
                </span>
                <span className="text-xs font-medium text-slate-500 block truncate">
                  {item.category?.name || 'Textile'} • {item.conditionCode?.replace('_', ' ')}
                </span>
                {item.status === 'REJECTED' && item.rejectionReason && (
                  <span className="text-[10px] text-rose-600 block truncate font-medium">
                    Reason: {item.rejectionReason}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Quantity',
        field: 'quantityAmount',
        width: 140,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          return (
            <span className="font-bold text-slate-900 text-xs">
              {Number(item.quantityAmount).toLocaleString()} {item.quantityUnit}
            </span>
          );
        },
      },
      {
        headerName: 'Price',
        field: 'priceAmount',
        width: 140,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          return item.priceAmount ? (
            <span className="text-blue-600 font-bold text-xs">
              ₹{Number(item.priceAmount).toLocaleString()} {item.priceUnit}
            </span>
          ) : (
            <span className="text-slate-400 text-xs italic">On Request</span>
          );
        },
      },
      {
        headerName: 'Location',
        valueGetter: (params: any) => (params.data ? `${params.data.city}, ${params.data.state}` : ''),
        width: 150,
        cellRenderer: (params: any) => (
          <span className="text-slate-700 text-xs font-medium">{params.value}</span>
        ),
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 160,
        cellRenderer: (params: any) => {
          const status = params.value;
          const badge = statusBadges[status] || statusBadges.INACTIVE;
          const Icon = badge.icon;
          return (
            <Badge variant={badge.badgeVariant} className="flex items-center gap-1 w-fit text-[11px] font-bold">
              <Icon className="w-3 h-3" />
              {badge.label}
            </Badge>
          );
        },
      },
      {
        headerName: 'Actions',
        colId: 'actions',
        width: 270,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;

          return (
            <div className="flex items-center gap-1.5 py-1">
              {item.status === 'APPROVED' && (
                <a
                  href={`${buyerUrl}/listings/${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs transition shadow-2xs"
                  title="View live on marketplace"
                >
                  <Eye className="w-3.5 h-3.5" />
                </a>
              )}

              <Link to={`/listings/${item.id}/edit`}>
                <button className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition shadow-2xs flex items-center gap-1">
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </Link>

              {item.status === 'APPROVED' && (
                <button
                  onClick={() => handleStatusChange(item.id, 'SOLD')}
                  disabled={actionLoading === item.id}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition shadow-2xs"
                >
                  Sold
                </button>
              )}

              {item.status === 'APPROVED' && (
                <button
                  onClick={() => handleStatusChange(item.id, 'INACTIVE')}
                  disabled={actionLoading === item.id}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 text-xs transition shadow-2xs"
                >
                  Hide
                </button>
              )}

              {item.status === 'INACTIVE' && (
                <button
                  onClick={() => handleStatusChange(item.id, 'APPROVED')}
                  disabled={actionLoading === item.id}
                  className="px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition shadow-xs"
                >
                  Activate
                </button>
              )}

              <button
                onClick={() => setDeleteTarget(item)}
                disabled={actionLoading === item.id}
                className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs flex items-center gap-1"
                title="Delete listing"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          );
        },
      },
    ],
    [actionLoading, buyerUrl],
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Stock Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your fabric lots, track moderation approvals, and mark sold items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table Grid View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'cards' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Link to="/listings/new">
            <CommonButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add New Stock Lot
            </CommonButton>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'APPROVED', 'PENDING_APPROVAL', 'REJECTED', 'SOLD', 'INACTIVE'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-2 rounded-xl transition ${
              statusFilter === tab
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Render View Mode */}
      {viewMode === 'table' ? (
        <AgGridCustomTable<ListingItem>
          rowData={listings}
          columnDefs={columnDefs}
          isLoading={loading}
          rowHeight={64}
          height="560px"
          defaultPageSize={10}
          pageSizeOptions={[10, 20, 50]}
          searchPlaceholder="Quick filter listings by title, quantity, price..."
          emptyMessage="No stock listings found in this category"
        />
      ) : loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No stock listings found in this category</h3>
          <p className="text-xs text-slate-400">Click below to create your next listing.</p>
          <Link to="/listings/new">
            <CommonButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs mt-2">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Create Listing
            </CommonButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((item) => {
            const badge = statusBadges[item.status] || statusBadges.INACTIVE;
            const Icon = badge.icon;
            const thumb =
              item.images?.[0]?.imageUrl ||
              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80';

            return (
              <Card
                key={item.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                    <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={badge.badgeVariant} className="flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {item.category?.name} • {item.conditionCode.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>
                        Volume:{' '}
                        <strong className="text-slate-800">
                          {Number(item.quantityAmount).toLocaleString()} {item.quantityUnit}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Price:{' '}
                        <strong className="text-blue-600">
                          {item.priceAmount ? `₹${item.priceAmount} ${item.priceUnit}` : 'On Request'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Location:{' '}
                        <strong className="text-slate-800">
                          {item.city}, {item.state}
                        </strong>
                      </span>
                    </div>

                    {/* Rejection notice */}
                    {item.status === 'REJECTED' && item.rejectionReason && (
                      <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                        <strong>Rejection Reason:</strong> "{item.rejectionReason}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end">
                  {item.status === 'APPROVED' && (
                    <a
                      href={`${buyerUrl}/listings/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                      title="Preview on Public Marketplace"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      View Live
                    </a>
                  )}

                  <Link to={`/listings/${item.id}/edit`}>
                    <CommonButton
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-8 rounded-xl font-bold shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </CommonButton>
                  </Link>

                  {item.status === 'APPROVED' && (
                    <CommonButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'SOLD')}
                      isLoading={actionLoading === item.id}
                      className="h-8 text-xs font-bold rounded-xl shadow-2xs"
                    >
                      Mark Sold
                    </CommonButton>
                  )}

                  {item.status === 'APPROVED' && (
                    <CommonButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'INACTIVE')}
                      isLoading={actionLoading === item.id}
                      className="h-8 text-xs text-slate-500 rounded-xl shadow-2xs"
                    >
                      Hide
                    </CommonButton>
                  )}

                  {item.status === 'INACTIVE' && (
                    <CommonButton
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'APPROVED')}
                      isLoading={actionLoading === item.id}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                    >
                      Reactivate
                    </CommonButton>
                  )}

                  <CommonButton
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(item)}
                    disabled={actionLoading === item.id}
                    className="h-8 bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 text-xs font-bold rounded-xl shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </CommonButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Listing Confirmation Dialog */}
      <CommonDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Stock Listing"
        variant="destructive"
        description="Are you sure you want to delete this listing lot from your inventory?"
        confirmText="Delete Listing"
        onConfirm={handleDeleteConfirm}
        isLoading={deleting}
      >
        <div className="space-y-3.5 py-1">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Listing Lot</span>
              <span className="text-sm font-bold text-slate-900 truncate block mt-0.5" title={deleteTarget?.title}>
                {deleteTarget?.title}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                {deleteTarget?.category?.name || 'Surplus'} • {Number(deleteTarget?.quantityAmount || 0).toLocaleString()} {deleteTarget?.quantityUnit || 'm'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-700 text-[11px] font-bold shrink-0">
              Lot #{deleteTarget?.id?.slice(0, 8)}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            This listing lot will be immediately removed from marketplace search and buyer views. This action cannot be undone.
          </p>
        </div>
      </CommonDialog>
    </div>
  );
}
