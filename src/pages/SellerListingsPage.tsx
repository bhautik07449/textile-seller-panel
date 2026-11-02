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
  ShoppingCart,
  Package,
  Camera,
  Film,
  Video,
  MapPin,
  Calendar,
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
  description?: string;
  slug: string;
  status: string;
  conditionCode?: string;
  quantityAmount?: number | string;
  quantityUnit?: string;
  priceAmount?: number | string;
  priceUnit?: string;
  city: string;
  state: string;
  videoUrl?: string;
  rejectionReason?: string;
  createdAt?: string;
  publishedAt?: string;
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'
  );
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
        headerName: 'Stock Lot & Media',
        field: 'title',
        flex: 2.2,
        minWidth: 280,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          const thumb =
            item.images?.[0]?.imageUrl ||
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80';
          const imgCount = item.images?.length || 0;
          return (
            <div className="flex items-center gap-3 w-full min-w-0 overflow-hidden py-1">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                {imgCount > 1 && (
                  <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] font-bold px-1 rounded-tl">
                    +{imgCount - 1}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="font-bold text-slate-900 block truncate leading-tight text-xs md:text-sm" title={item.title}>
                  {item.title}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Camera className="w-3 h-3 text-slate-400" />
                    {imgCount} {imgCount === 1 ? 'Photo' : 'Photos'}
                  </span>
                  {item.videoUrl && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Film className="w-2.5 h-2.5" /> Video
                    </span>
                  )}
                </div>
                {item.status === 'REJECTED' && item.rejectionReason && (
                  <span className="text-[10px] text-rose-600 block truncate font-medium mt-0.5">
                    Reason: {item.rejectionReason}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Description',
        field: 'description',
        flex: 2.2,
        minWidth: 260,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          return (
            <div className="py-1 w-full min-w-0 flex items-center h-full">
              <p
                className="text-xs text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-line"
                title={item.description}
              >
                {item.description || 'No description provided'}
              </p>
            </div>
          );
        },
      },
      {
        headerName: 'Location',
        valueGetter: (params: any) => (params.data ? `${params.data.city}, ${params.data.state}` : ''),
        width: 160,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item) return null;
          return (
            <div className="flex flex-col justify-center py-1">
              <span className="text-slate-800 text-xs font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {item.city}, {item.state}
              </span>
              <span className="text-[10px] text-slate-400">Auto-Set from Profile</span>
            </div>
          );
        },
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
        headerName: 'Posted Date',
        field: 'createdAt',
        width: 125,
        cellRenderer: (params: any) => {
          const item = params.data;
          if (!item || !item.createdAt) return null;
          const date = new Date(item.createdAt);
          return (
            <span className="text-xs text-slate-600 font-medium">
              {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
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
      {/* Dual Switcher Bar: My Stock (Sell) vs Purchase Stock (Buy) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/90 w-full sm:w-fit">
        <button
          type="button"
          className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-xs flex items-center justify-center gap-1.5"
        >
          <Package className="w-4 h-4" />
          <span>My Stock Listings (Sell)</span>
        </button>
        <Link
          to="/purchase-stock"
          className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Browse & Purchase Stock (Buy)</span>
        </Link>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">My Stock Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your fabric lots, track moderation approvals, and mark sold items
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
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
              <span className="hidden sm:inline">Add New Stock Lot</span>
              <span className="sm:hidden">Add Stock</span>
            </CommonButton>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        {['ALL', 'APPROVED', 'PENDING_APPROVAL', 'REJECTED', 'SOLD', 'INACTIVE'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap select-none ${
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
          searchPlaceholder="Quick filter listings by title, description, location..."
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
            const imgCount = item.images?.length || 0;

            return (
              <Card
                key={item.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-2xs">
                    <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                    {imgCount > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        +{imgCount - 1}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={badge.badgeVariant} className="flex items-center gap-1 text-[11px] font-bold">
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </Badge>
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-slate-400" />
                        {imgCount} {imgCount === 1 ? 'Photo' : 'Photos'}
                      </span>
                      {item.videoUrl && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Film className="w-3 h-3" /> Video Attached
                        </span>
                      )}
                      {item.createdAt && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate" title={item.title}>
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1 text-slate-800 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {item.city}, {item.state}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">(Auto-Set from Profile)</span>
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
                <div className="w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex flex-col md:flex-row md:items-center gap-2 shrink-0">
                  {item.status === 'APPROVED' ? (
                    <>
                      {/* Row 1: Primary actions (View Live & Edit) */}
                      <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-auto">
                        <a
                          href={`${buyerUrl}/listings/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-95"
                          title="Preview on Public Marketplace"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Live</span>
                        </a>

                        <Link to={`/listings/${item.id}/edit`} className="w-full md:w-auto">
                          <CommonButton
                            variant="outline"
                            size="sm"
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-9 rounded-xl font-bold shadow-2xs justify-center active:scale-95"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            <span>Edit</span>
                          </CommonButton>
                        </Link>
                      </div>

                      {/* Row 2: Status & Delete actions (Mark Sold, Hide, Delete) */}
                      <div className="grid grid-cols-3 md:flex md:items-center gap-2 w-full md:w-auto">
                        <CommonButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(item.id, 'SOLD')}
                          isLoading={actionLoading === item.id}
                          className="h-9 text-xs font-bold rounded-xl shadow-2xs justify-center active:scale-95"
                        >
                          Mark Sold
                        </CommonButton>

                        <CommonButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(item.id, 'INACTIVE')}
                          isLoading={actionLoading === item.id}
                          className="h-9 text-xs text-slate-500 rounded-xl shadow-2xs justify-center active:scale-95"
                        >
                          Hide
                        </CommonButton>

                        <CommonButton
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          disabled={actionLoading === item.id}
                          className="h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 text-xs font-bold rounded-xl shadow-2xs justify-center active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span>Delete</span>
                        </CommonButton>
                      </div>
                    </>
                  ) : item.status === 'INACTIVE' ? (
                    <div className="grid grid-cols-3 md:flex md:items-center gap-2 w-full md:w-auto">
                      <Link to={`/listings/${item.id}/edit`} className="w-full md:w-auto">
                        <CommonButton
                          variant="outline"
                          size="sm"
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-9 rounded-xl font-bold shadow-2xs justify-center active:scale-95"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          <span>Edit</span>
                        </CommonButton>
                      </Link>

                      <CommonButton
                        size="sm"
                        onClick={() => handleStatusChange(item.id, 'APPROVED')}
                        isLoading={actionLoading === item.id}
                        className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs justify-center active:scale-95"
                      >
                        Reactivate
                      </CommonButton>

                      <CommonButton
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        disabled={actionLoading === item.id}
                        className="h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 text-xs font-bold rounded-xl shadow-2xs justify-center active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Delete</span>
                      </CommonButton>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-auto">
                      <Link to={`/listings/${item.id}/edit`} className="w-full md:w-auto">
                        <CommonButton
                          variant="outline"
                          size="sm"
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-9 rounded-xl font-bold shadow-2xs justify-center active:scale-95"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          <span>Edit</span>
                        </CommonButton>
                      </Link>

                      <CommonButton
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        disabled={actionLoading === item.id}
                        className="h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 text-xs font-bold rounded-xl shadow-2xs justify-center active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Delete</span>
                      </CommonButton>
                    </div>
                  )}
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
