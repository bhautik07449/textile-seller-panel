import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Upload,
  X,
  Plus,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  PackagePlus,
  Layers,
  MapPin,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';
import api from '../api/client';
import CommonTextField from '../components/widgets/common_textField';
import CommonButton from '../components/widgets/common_button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import SelectDropdown from '../components/widgets/SelectDropdown';

interface CategoryOption {
  id: string;
  name: string;
}

interface FabricTypeOption {
  id: string;
  name: string;
}

interface QuotaData {
  total: number;
  used: number;
  remaining: number;
}

export default function CreateListingPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [fabricTypes, setFabricTypes] = useState<FabricTypeOption[]>([]);
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    fabricTypeId: '',
    description: '',
    quantityAmount: '',
    quantityUnit: 'metres',
    priceAmount: '',
    priceUnit: 'per metre',
    minimumOrderQuantity: '',
    minimumOrderUnit: 'metres',
    conditionCode: 'NEW_SURPLUS',
    colour: '',
    composition: '',
    widthValue: '',
    widthUnit: 'inches',
    gsmValue: '',
    stockReference: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [catsRes, fabricsRes, quotaRes]: any = await Promise.all([
          api.get('/categories'),
          api.get('/fabric-types'),
          api.get('/seller/listing-quota'),
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (fabricsRes.data) setFabricTypes(fabricsRes.data);
        if (quotaRes.data) setQuota(quotaRes.data);

        // If edit mode, load existing listing details
        if (isEditMode && id) {
          const listingRes: any = await api.get(`/seller/listings/${id}`);
          if (listingRes.data) {
            const l = listingRes.data;
            setForm({
              title: l.title || '',
              categoryId: l.categoryId || '',
              fabricTypeId: l.fabricTypeId || '',
              description: l.description || '',
              quantityAmount: String(l.quantityAmount || ''),
              quantityUnit: l.quantityUnit || 'metres',
              priceAmount: String(l.priceAmount || ''),
              priceUnit: l.priceUnit || 'per metre',
              minimumOrderQuantity: String(l.minimumOrderQuantity || ''),
              minimumOrderUnit: l.minimumOrderUnit || 'metres',
              conditionCode: l.conditionCode || 'NEW_SURPLUS',
              colour: l.colour || '',
              composition: l.composition || '',
              widthValue: String(l.widthValue || ''),
              widthUnit: l.widthUnit || 'inches',
              gsmValue: String(l.gsmValue || ''),
              stockReference: l.stockReference || '',
              city: l.city || '',
              state: l.state || '',
            });
            if (l.images) {
              setImages(l.images.map((img: any) => img.imageUrl));
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize form.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 6) {
      setError('Maximum 6 photos allowed per listing.');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);

      const res: any = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        const fullUrl = res.data.url.startsWith('http')
          ? res.data.url
          : `${api.defaults.baseURL?.replace('/api/v1', '')}${res.data.url}`;
        setImages([...images, fullUrl]);
      }
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Allowed formats: JPG, PNG, WEBP up to 5MB.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.categoryId ||
      !form.description ||
      !form.quantityAmount ||
      !form.city ||
      !form.state
    ) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (!isEditMode && (!quota || quota.remaining <= 0)) {
      setError(
        'Listing quota exhausted. Please upgrade your subscription package to create new listings.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        ...form,
        quantityAmount: Number(form.quantityAmount),
        priceAmount: form.priceAmount ? Number(form.priceAmount) : undefined,
        minimumOrderQuantity: form.minimumOrderQuantity ? Number(form.minimumOrderQuantity) : undefined,
        widthValue: form.widthValue ? Number(form.widthValue) : undefined,
        gsmValue: form.gsmValue ? Number(form.gsmValue) : undefined,
        fabricTypeId: form.fabricTypeId || undefined,
        images: images.map((url, idx) => ({ imageUrl: url, sortOrder: idx })),
      };

      if (isEditMode && id) {
        await api.patch(`/seller/listings/${id}`, payload);
      } else {
        await api.post('/seller/listings', payload);
      }

      navigate('/listings');
    } catch (err: any) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/listings"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Listings
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Stock Listing' : 'Publish Surplus Stock Lot'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditMode
              ? 'Update specifications. Material changes will enter re-moderation without consuming another credit.'
              : 'Add your deadstock, rejected batch, or clearance fabric for bulk buyer discovery.'}
          </p>
        </div>

        {/* Quota Badge (Creation mode) */}
        {!isEditMode && quota && (
          <div className="bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl text-right">
            <span className="text-[10px] font-bold text-blue-600 uppercase block">Remaining Quota</span>
            <span className="text-sm font-extrabold text-blue-900">
              {quota.remaining} Credits Available
            </span>
          </div>
        )}
      </div>

      {/* Warning if Quota Exhausted on Creation */}
      {!isEditMode && quota && quota.remaining <= 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              You have consumed all listing credits for this billing cycle. Upgrade your package to
              publish more stock.
            </span>
          </div>
          <Link to="/subscription" className="font-bold underline text-amber-900 hover:text-amber-950">
            Upgrade Plan
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8"
      >
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-blue-600" />
            1. Basic Stock Information
          </h2>

          <CommonTextField
            label="Listing Title *"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Surplus 100% Combed Cotton Poplin Shirting 5000 Metres"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <SelectDropdown
                label="Category *"
                value={form.categoryId}
                onChange={(val) => setForm((prev) => ({ ...prev, categoryId: val }))}
                placeholder="Select Category"
                searchPlaceholder="Search categories..."
                options={categories.map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
              />
            </div>

            <div>
              <SelectDropdown
                label="Fabric Material Type"
                value={form.fabricTypeId}
                onChange={(val) => setForm((prev) => ({ ...prev, fabricTypeId: val }))}
                placeholder="Select Material (Optional)"
                searchPlaceholder="Search materials..."
                options={[
                  { label: 'None (Optional)', value: '' },
                  ...fabricTypes.map((f) => ({
                    label: f.name,
                    value: f.id,
                  })),
                ]}
              />
            </div>
          </div>

          <CommonTextField
            label="Detailed Description *"
            name="description"
            type="textarea"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe weave pattern, finish, packaging (poly rolls, cut pieces), export cancellation rationale, defect notes..."
            required
          />
        </div>

        {/* Section 2: Quantity & Pricing */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-blue-600" />
            2. Quantity & Pricing Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity *</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  step="any"
                  name="quantityAmount"
                  value={form.quantityAmount}
                  onChange={handleChange}
                  placeholder="5000"
                  required
                  className="w-2/3 px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <div className="w-1/3">
                  <SelectDropdown
                    value={form.quantityUnit}
                    onChange={(val) => setForm((prev) => ({ ...prev, quantityUnit: val }))}
                    options={[
                      { label: 'metres', value: 'metres' },
                      { label: 'kg', value: 'kg' },
                      { label: 'rolls', value: 'rolls' },
                      { label: 'pieces', value: 'pieces' },
                      { label: 'yards', value: 'yards' },
                    ]}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price Offer (INR)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  step="any"
                  name="priceAmount"
                  value={form.priceAmount}
                  onChange={handleChange}
                  placeholder="e.g. 85 (Leave blank for 'Price on Request')"
                  className="w-2/3 px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <div className="w-1/3">
                  <SelectDropdown
                    value={form.priceUnit}
                    onChange={(val) => setForm((prev) => ({ ...prev, priceUnit: val }))}
                    options={[
                      { label: 'per metre', value: 'per metre' },
                      { label: 'per kg', value: 'per kg' },
                      { label: 'per roll', value: 'per roll' },
                      { label: 'per piece', value: 'per piece' },
                    ]}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Order Quantity (MOQ)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  step="any"
                  name="minimumOrderQuantity"
                  value={form.minimumOrderQuantity}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="w-2/3 px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <div className="w-1/3">
                  <SelectDropdown
                    value={form.minimumOrderUnit}
                    onChange={(val) => setForm((prev) => ({ ...prev, minimumOrderUnit: val }))}
                    options={[
                      { label: 'metres', value: 'metres' },
                      { label: 'kg', value: 'kg' },
                      { label: 'rolls', value: 'rolls' },
                      { label: 'pieces', value: 'pieces' },
                    ]}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <SelectDropdown
                label="Stock Condition *"
                value={form.conditionCode}
                onChange={(val) => setForm((prev) => ({ ...prev, conditionCode: val }))}
                options={[
                  { label: 'New Surplus (Factory Overrun)', value: 'NEW_SURPLUS' },
                  { label: 'Dead Stock (Warehouse Leftover)', value: 'DEAD_STOCK' },
                  { label: 'Rejected Export Batch', value: 'REJECTED' },
                  { label: 'Factory Leftover Cuts', value: 'LEFTOVER' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Textile Specific Attributes */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            3. Textile Specifications (Optional)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CommonTextField
              label="Composition"
              name="composition"
              value={form.composition}
              onChange={handleChange}
              placeholder="e.g. 100% Combed Cotton"
            />

            <CommonTextField
              label="Colour / Shade"
              name="colour"
              value={form.colour}
              onChange={handleChange}
              placeholder="e.g. Indigo / Navy"
            />

            <CommonTextField
              label="GSM / Weight"
              name="gsmValue"
              type="number"
              value={form.gsmValue}
              onChange={handleChange}
              placeholder="e.g. 120"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fabric Width</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  name="widthValue"
                  value={form.widthValue}
                  onChange={handleChange}
                  placeholder="58"
                  className="w-2/3 px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <div className="w-1/3">
                  <SelectDropdown
                    value={form.widthUnit}
                    onChange={(val) => setForm((prev) => ({ ...prev, widthUnit: val }))}
                    options={[
                      { label: 'inches', value: 'inches' },
                      { label: 'cm', value: 'cm' },
                    ]}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <CommonTextField
              label="Batch / Stock Ref"
              name="stockReference"
              value={form.stockReference}
              onChange={handleChange}
              placeholder="e.g. LOT-2026-SURAT-01"
            />
          </div>
        </div>

        {/* Section 4: Stock Location */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            4. Warehouse Dispatch Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CommonTextField
              label="City *"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Surat"
              required
            />

            <CommonTextField
              label="State *"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="e.g. Gujarat"
              required
            />
          </div>
        </div>

        {/* Section 5: Stock Photos */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            5. Stock Photos (Max 6 photos)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50"
              >
                <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length < 6 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer transition text-center p-3">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 block">
                  {uploadingImage ? 'Uploading...' : 'Add Stock Photo'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">JPG, PNG, WEBP &lt; 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            to="/listings"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>

          <CommonButton
            type="submit"
            isLoading={submitting}
            disabled={submitting || (!isEditMode && quota?.remaining !== undefined && quota.remaining <= 0)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >
            {isEditMode ? 'Update Listing' : 'Submit for Moderation'}
          </CommonButton>
        </div>
      </form>
    </div>
  );
}
