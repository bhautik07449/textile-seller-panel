import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Upload,
  X,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Loader2,
  MapPin,
  Building2,
  Video,
  Film,
  Sparkles,
  ExternalLink,
  FileText,
  ChevronDown,
  Check,
  Plus,
  Search,
} from 'lucide-react';
import api from '../api/client';
import CommonTextField from '../components/widgets/common_textField';
import CommonButton from '../components/widgets/common_button';
import { SelectDropdown, DropdownOption } from '../components/widgets/SelectDropdown';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/toast';

interface QuotaData {
  total: number;
  used: number;
  remaining: number;
}

interface AdminFabricType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

const POPULAR_QUALITIES = [
  '60x60 Cambric',
  '40x40 Poplin',
  'Rayon 14kg',
  'Cotton Slub',
  'Poly Crepe',
  'Satin',
  'Organza',
  'Chanderi',
];

export default function CreateListingPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Simplified form state: Title, Fabric Quality & Description
  const [title, setTitle] = useState('');
  const [fabricQuality, setFabricQuality] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customQuality, setCustomQuality] = useState('');
  const [adminFabricTypes, setAdminFabricTypes] = useState<AdminFabricType[]>([]);
  const [existingQualities, setExistingQualities] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // Media
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Seller profile location
  const [city, setCity] = useState(user?.sellerProfile?.city || '');
  const [state, setState] = useState(user?.sellerProfile?.state || '');
  const [companyName, setCompanyName] = useState(user?.sellerProfile?.companyName || '');

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [quotaRes, profileRes, qualitiesRes, typesRes]: any = await Promise.all([
          api.get('/seller/listing-quota').catch(() => null),
          api.get('/seller/profile').catch(() => null),
          api.get('/fabric-qualities').catch(() => null),
          api.get('/fabric-types').catch(() => null),
        ]);

        if (quotaRes?.data) {
          setQuota(quotaRes.data);
        }

        const tList = typesRes?.data?.data || typesRes?.data || typesRes;
        if (Array.isArray(tList)) {
          setAdminFabricTypes(tList.filter((item: any) => item && item.name));
        }

        const qList = qualitiesRes?.data?.data || qualitiesRes?.data || qualitiesRes;
        if (Array.isArray(qList)) {
          const list = qList
            .map((item: any) => (typeof item === 'string' ? item : item.quality))
            .filter((q: string) => Boolean(q && q.trim()));
          setExistingQualities(list);
        }

        const prof = profileRes?.data?.data || profileRes?.data || profileRes;
        if (prof) {
          if (prof.city) setCity(prof.city);
          if (prof.state) setState(prof.state);
          if (prof.companyName) setCompanyName(prof.companyName);
        }

        // If edit mode, load existing listing details
        if (isEditMode && id) {
          const listingRes: any = await api.get(`/seller/listings/${id}`);
          const l = listingRes?.data?.data || listingRes?.data || listingRes;
          if (l) {
            setTitle(l.title || '');
            const existingQ = l.fabricQuality || l.fabricType?.name || '';
            if (existingQ) {
              setFabricQuality(existingQ);
              setCustomQuality(existingQ);
              const inAdmin = Array.isArray(tList) && tList.some(
                (item: any) => item?.name?.toLowerCase() === existingQ.toLowerCase()
              );
              if (!inAdmin && l.fabricQuality) {
                setIsCustomMode(true);
              }
            }
            setDescription(l.description || '');
            if (l.city) setCity(l.city);
            if (l.state) setState(l.state);
            if (l.images && Array.isArray(l.images)) {
              setImages(l.images.map((img: any) => (typeof img === 'string' ? img : img.imageUrl)));
            }
            if (l.videoUrl) {
              setVideoUrl(l.videoUrl);
            }
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize form.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditMode]);

  // Dropdown options: "+ Add New" option first, then all Admin Fabric Types, then existing listing qualities
  const dropdownOptions: DropdownOption[] = useMemo(() => {
    const opts: DropdownOption[] = [
      {
        label: 'Add New Fabric Quality (Type Custom)...',
        value: '__ADD_NEW__',
        badge: 'New',
      },
    ];

    adminFabricTypes.forEach((t) => {
      opts.push({
        label: t.name,
        value: t.name,
      });
    });

    existingQualities.forEach((q) => {
      if (!opts.some((o) => o.value.toLowerCase() === q.toLowerCase())) {
        opts.push({
          label: q,
          value: q,
        });
      }
    });

    POPULAR_QUALITIES.forEach((q) => {
      if (!opts.some((o) => o.value.toLowerCase() === q.toLowerCase())) {
        opts.push({
          label: q,
          value: q,
        });
      }
    });

    return opts;
  }, [adminFabricTypes, existingQualities]);

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

      const url = res?.data?.url || res?.url;
      if (url) {
        const fullUrl = url.startsWith('http')
          ? url
          : `${api.defaults.baseURL?.replace('/api/v1', '')}${url}`;
        setImages((prev) => [...prev, fullUrl]);
      }
    } catch (err: any) {
      setError(err?.message || 'Image upload failed. Allowed formats: JPG, PNG, WEBP up to 5MB.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_VIDEO_BYTES) {
      setError(
        `Video size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed video size is 25MB.`
      );
      e.target.value = '';
      return;
    }

    try {
      setUploadingVideo(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);

      const res: any = await api.post('/uploads/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res?.data?.url || res?.url;
      if (url) {
        const fullUrl = url.startsWith('http')
          ? url
          : `${api.defaults.baseURL?.replace('/api/v1', '')}${url}`;
        setVideoUrl(fullUrl);
      }
    } catch (err: any) {
      setError(err?.message || 'Video upload failed. Allowed formats: MP4, WEBM, MOV up to 25MB.');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a listing title (e.g. Cotton Printed Surplus Fabric Lot 5000 Metres).');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description with stock specifications or details.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const trimmedQuality = (isCustomMode ? customQuality : fabricQuality).trim();
      const matchedAdminType = adminFabricTypes.find(
        (t) => t.name.trim().toLowerCase() === trimmedQuality.toLowerCase()
      );

      const payload: any = {
        title: title.trim(),
        fabricTypeId: matchedAdminType ? matchedAdminType.id : undefined,
        fabricQuality: trimmedQuality || undefined,
        description: description.trim(),
        city: city.trim() || 'India',
        state: state.trim() || 'India',
        images: images.map((url, idx) => ({ imageUrl: url, sortOrder: idx })),
        videoUrl: videoUrl || undefined,
      };

      if (isEditMode && id) {
        await api.patch(`/seller/listings/${id}`, payload);
        toast.success('Listing updated successfully!');
      } else {
        await api.post('/seller/listings', payload);
        toast.success('Listing created successfully! Awaiting admin review.');
      }

      navigate('/listings');
    } catch (err: any) {
      setError(err?.message || 'Failed to save listing. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-4 sm:pb-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/listings"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Surplus Fabric Listing' : 'Add New Listing'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Title, fabric quality, description, and photos/video — location auto-synced from profile
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Free Listing</span>
        </div>
      </div>

      {/* Auto-bound Location Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-blue-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-slate-900">
                Listing Location: {city ? `${city}${state ? `, ${state}` : ''}` : 'Location not set in profile'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                Profile Synced
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Directly linked to <strong className="text-slate-700">{companyName || 'your verified mill'}</strong>. Buyers will see this verified mill location.
            </p>
          </div>
        </div>

        <Link
          to="/profile"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0 self-end sm:self-auto hover:underline"
        >
          Change in Profile
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Simplified Add Listing Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Description Card */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-blue-600" />
            Stock Information
          </h2>

          <CommonTextField
            label="Listing Title *"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 5000 Mtrs Cotton Poplin Printed Surplus Fabric Lot"
            required
          />

          {/* Fabric Quality / Type - Clean Dropdown with Add New Mode */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <span>Fabric Quality</span>
                <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                {isCustomMode && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    Custom New
                  </span>
                )}
              </label>

              {isCustomMode ? (
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose from Dropdown</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(true);
                    setCustomQuality(fabricQuality);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New</span>
                </button>
              )}
            </div>

            {isCustomMode ? (
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={customQuality}
                    onChange={(e) => {
                      setCustomQuality(e.target.value);
                      setFabricQuality(e.target.value);
                    }}
                    placeholder="Type your new fabric quality (e.g. 60x60 Cambric, Rayon Slub, Satin)..."
                    autoFocus
                    className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 pr-9 py-2 text-sm text-slate-800 font-medium placeholder:text-slate-400 shadow-2xs transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  {customQuality && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomQuality('');
                        setFabricQuality('');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                      title="Clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Type any new fabric quality name not in the dropdown list</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="text-slate-500 hover:text-slate-700 underline font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <SelectDropdown
                  value={fabricQuality}
                  onChange={(val) => {
                    if (val === '__ADD_NEW__') {
                      setIsCustomMode(true);
                      setCustomQuality('');
                      setFabricQuality('');
                    } else {
                      setFabricQuality(val);
                    }
                  }}
                  options={dropdownOptions}
                  placeholder="Select Fabric Quality from list..."
                  searchPlaceholder="Search admin fabrics..."
                  searchable={true}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Select from admin-added fabrics, or click <strong>"+ Add New"</strong> to type custom
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your surplus fabric (e.g. weave, roll details, width, GSM, condition, reason for surplus sale)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition leading-relaxed"
              required
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Include key fabric details for prospective buyers</span>
              <span>{description.length} characters</span>
            </div>
          </div>
        </div>

        {/* Photos (Images) Section */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="min-w-0 pr-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Fabric Photos</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload clear photos of fabric rolls, selvedge, print, or weave (up to 6 photos)
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
              {images.length} / 6
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, idx) => (
              <div
                key={url + idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs"
              >
                <img
                  src={url}
                  alt={`Fabric thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-bold shadow-2xs backdrop-blur-xs">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition backdrop-blur-xs"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length < 6 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer transition p-3 text-center group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-2 transition">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">
                      Add Photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Video Upload Section */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" />
              Fabric Video (Optional)
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Short video showing fabric drape, texture, roll lot, or warehouse inspection (up to 25MB)
            </p>
          </div>

          {videoUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md mx-auto border border-slate-200 shadow-xs">
                <video src={videoUrl} controls className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-white transition backdrop-blur-xs"
                  title="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                >
                  Remove / Change Video
                </button>
              </div>
            </div>
          ) : (
            <label className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer transition p-6 text-center group">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoUpload}
                disabled={uploadingVideo}
                className="hidden"
              />
              {uploadingVideo ? (
                <div className="flex flex-col items-center gap-2 py-3">
                  <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                  <span className="text-xs font-semibold text-slate-600">Uploading video...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 transition">
                    <Film className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                    Upload Fabric Video
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    MP4, WEBM, MOV up to 25MB
                  </span>
                </>
              )}
            </label>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <Link
            to="/listings"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition text-center"
          >
            Cancel
          </Link>

          <CommonButton
            type="submit"
            isLoading={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isEditMode ? 'Update Listing' : 'Publish Listing'}
          </CommonButton>
        </div>
      </form>
    </div>
  );
}
