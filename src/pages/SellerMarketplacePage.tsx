import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Phone,
  MessageSquare,
  ShoppingCart,
  Filter,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  X,
  IndianRupee,
  Sparkles,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';
import api from '../api/client';
import SelectDropdown from '../components/widgets/SelectDropdown';
import CommonButton from '../components/widgets/common_button';
import { toast } from '../components/ui/toast';

export default function SellerMarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Purchase Inquiry Modal state
  const [activeLot, setActiveLot] = useState<any | null>(null);
  const [purchaseQty, setPurchaseQty] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [listingsRes, catsRes, locsRes]: any = await Promise.all([
          api.get(`/listings?limit=100&sort=${sortBy}${selectedCategory ? `&category=${selectedCategory}` : ''}${selectedCity ? `&city=${selectedCity}` : ''}${selectedCondition ? `&condition=${selectedCondition}` : ''}${keyword ? `&q=${encodeURIComponent(keyword)}` : ''}`),
          api.get('/categories'),
          api.get('/locations').catch(() => null),
        ]);

        const items = listingsRes?.data?.data || listingsRes?.data || listingsRes || [];
        setListings(Array.isArray(items) ? items : []);
        const cats = catsRes?.data?.data || catsRes?.data || catsRes || [];
        setCategories(Array.isArray(cats) ? cats : []);
        const locs = locsRes?.data?.data || locsRes?.data || locsRes || [];
        setLocations(Array.isArray(locs) ? locs : []);
      } catch (err) {
        console.error('Failed to load marketplace stock:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, selectedCity, selectedCondition, sortBy]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res: any = await api.get(
        `/listings?limit=100&sort=${sortBy}${selectedCategory ? `&category=${selectedCategory}` : ''}${selectedCity ? `&city=${selectedCity}` : ''}${selectedCondition ? `&condition=${selectedCondition}` : ''}${keyword ? `&q=${encodeURIComponent(keyword)}` : ''}`
      );
      const items = res?.data?.data || res?.data || res || [];
      setListings(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPurchase = (lot: any) => {
    setActiveLot(lot);
    setPurchaseQty(lot.minimumOrderQuantity || String(lot.quantityAmount || '1000'));
    setInquiryNotes(`Interested in purchasing ${lot.title}. Please share sample / billing details.`);
    setInquirySuccess(false);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLot) return;
    try {
      setSendingInquiry(true);
      // Construct direct whatsapp message to seller
      const seller = activeLot.sellerUser?.sellerProfile;
      const phone = seller?.whatsappPhone || seller?.publicPhone || '';
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      const messageText = `Hello ${seller?.companyName || 'Seller'}, I am a verified textile merchant on TexStock. I want to PURCHASE ${purchaseQty} ${activeLot.quantityUnit} from your stock lot "${activeLot.title}". Note: ${inquiryNotes}`;

      if (cleanPhone) {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
      }

      setInquirySuccess(true);
      toast.success('Inquiry initiated! Opening direct channel with mill.');
      setTimeout(() => {
        setActiveLot(null);
      }, 1500);
    } catch (err) {
      toast.error('Failed to submit purchase inquiry.');
    } finally {
      setSendingInquiry(false);
    }
  };

  const conditionLabels: Record<string, string> = {
    NEW_SURPLUS: 'New Surplus',
    DEAD_STOCK: 'Dead Stock Clearance',
    REJECTED: 'Export Cancelled',
    LEFTOVER: 'Factory Leftover',
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-7xl mx-auto pb-12">
      {/* Top Banner with Dual Navigation Switch */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Wholesale Textile Sourcing & Deals</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Purchase Surplus Fabric Stock (स्टॉक खरीदें)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse wholesale deadstock, export excess, and surplus lots directly from verified textile mills at clearance rates.
          </p>
        </div>

        {/* View Switcher: Add/Manage vs Buy */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shrink-0 self-start md:self-auto">
          <Link
            to="/listings"
            className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>My Stock (Sell)</span>
          </Link>
          <button
            type="button"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-xs flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Stock (Buy)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search fabric (e.g. Cotton, Denim, Rayon, Polyester, Shirting)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-44">
              <SelectDropdown
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                placeholder="All Categories"
                options={[
                  { label: 'All Categories', value: '' },
                  ...categories.map((c) => ({ label: c.name, value: c.slug || c.id })),
                ]}
                size="sm"
              />
            </div>

            <div className="w-36">
              <SelectDropdown
                value={selectedCity}
                onChange={(val) => setSelectedCity(val)}
                placeholder="All Hubs"
                options={[
                  { label: 'All Hubs', value: '' },
                  ...locations.map((loc) => ({ label: `${loc.city} (${loc.count})`, value: loc.city })),
                ]}
                size="sm"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-slate-400 font-bold shrink-0 text-[11px] uppercase tracking-wider">
            Quick Filter:
          </span>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedCity('');
              setSelectedCondition('');
            }}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
              !selectedCategory && !selectedCity && !selectedCondition
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stock
          </button>
          {locations.slice(0, 4).map((loc) => (
            <button
              key={loc.city}
              onClick={() => setSelectedCity(selectedCity === loc.city ? '' : loc.city)}
              className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
                selectedCity === loc.city
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {loc.city} ({loc.count})
            </button>
          ))}
          <button
            onClick={() => setSelectedCondition('NEW_SURPLUS')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
              selectedCondition === 'NEW_SURPLUS'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            New Surplus Overruns
          </button>
          <button
            onClick={() => setSelectedCondition('DEAD_STOCK')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
              selectedCondition === 'DEAD_STOCK'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Clearance Deadstock
          </button>
        </div>
      </div>

      {/* Stock Listing Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-slate-200 h-80 rounded-3xl"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No surplus lots matched your query</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, clearing filters, or check back soon as mills list new lots daily.
          </p>
          <button
            onClick={() => {
              setKeyword('');
              setSelectedCategory('');
              setSelectedCity('');
              setSelectedCondition('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((lot) => {
            const seller = lot.sellerUser?.sellerProfile;
            const phone = seller?.whatsappPhone || seller?.publicPhone || '';
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const photo =
              lot.images && lot.images.length > 0
                ? lot.images[0].imageUrl
                : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80';

            return (
              <div
                key={lot.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Photo with badges */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={photo}
                      alt={lot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 backdrop-blur-md shadow-2xs">
                        {conditionLabels[lot.conditionCode] || 'Surplus'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <MapPin className="w-3 h-3 text-blue-400" />
                      <span>{lot.city}, {lot.state}</span>
                    </div>
                  </div>

                  {/* Lot Details */}
                  <div className="p-5">
                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                      {lot.category?.name || 'Textile Stock'}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                      {lot.title}
                    </h3>

                    {/* Quantity & Price Card */}
                    <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Available Lot
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                          {Number(lot.quantityAmount).toLocaleString()}{' '}
                          <span className="text-xs font-medium text-slate-500">{lot.quantityUnit}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Price Offer
                        </span>
                        <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">
                          {lot.priceAmount ? (
                            <>₹{Number(lot.priceAmount).toLocaleString()} <span className="text-xs font-normal text-slate-500">{lot.priceUnit}</span></>
                          ) : (
                            'On Request'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Mill Identity */}
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{seller?.companyName || 'Verified Textile Mill'}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Footers */}
                <div className="p-4 pt-0 border-t border-slate-100 flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleOpenPurchase(lot)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Purchase / Inquire</span>
                  </button>

                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello, I want to purchase your stock lot "${lot.title}" (${lot.quantityAmount} ${lot.quantityUnit}) on TexStock.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition shadow-2xs active:scale-95"
                      title="Direct WhatsApp Deal"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}

                  {seller?.publicPhone && (
                    <a
                      href={`tel:${seller.publicPhone}`}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition shadow-2xs active:scale-95"
                      title="Call Mill"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase / Inquiry Interactive Modal */}
      {activeLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Stock Purchase Deal
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5 line-clamp-1">
                  {activeLot.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seller Mill Info */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Supplier Mill</span>
                <span className="font-extrabold text-slate-900">
                  {activeLot.sellerUser?.sellerProfile?.companyName || 'Verified Mill'}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  {activeLot.city}, {activeLot.state}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Offered Rate</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {activeLot.priceAmount ? `₹${activeLot.priceAmount}` : 'On Request'}
                </span>
                <span className="text-slate-500 text-[11px] block">{activeLot.priceUnit}</span>
              </div>
            </div>

            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Desired Purchase Quantity ({activeLot.quantityUnit})
                </label>
                <input
                  type="number"
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(e.target.value)}
                  placeholder="e.g. 2000"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {activeLot.priceAmount && purchaseQty && (
                  <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                    Estimated Deal Amount: ₹
                    {(Number(activeLot.priceAmount) * Number(purchaseQty)).toLocaleString()}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deal Notes / Sampling Request
                </label>
                <textarea
                  rows={3}
                  value={inquiryNotes}
                  onChange={(e) => setInquiryNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLot(null)}
                  className="flex-1 py-3 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Deal to Mill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
