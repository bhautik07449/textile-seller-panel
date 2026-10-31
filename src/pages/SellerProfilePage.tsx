import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Save, CheckCircle2, AlertCircle, LocateFixed, Loader2, Check } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import CommonTextField from '../components/widgets/common_textField';
import CommonButton from '../components/widgets/common_button';

export default function SellerProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    companyName: '',
    contactPerson: '',
    description: '',
    publicEmail: '',
    publicPhone: '',
    whatsappPhone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    websiteUrl: '',
    mapUrl: '',
    latitude: null as number | null,
    longitude: null as number | null,
    publicContactEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Live geolocation is not supported in this browser.');
      return;
    }

    setDetectingLocation(true);
    setError('');
    setLocationSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!res.ok) throw new Error('Reverse geocode failed');
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.county ||
            addr.state_district ||
            '';
          const detectedState = addr.state || '';
          const postal = addr.postcode || '';
          const addressLine = [addr.suburb || addr.neighbourhood, addr.road].filter(Boolean).join(', ');

          setProfile((prev) => ({
            ...prev,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
            postalCode: postal || prev.postalCode,
            addressLine: addressLine || prev.addressLine,
            latitude,
            longitude,
          }));

          if (detectedCity) {
            setLocationSuccessMsg(`Location fetched: ${detectedCity}${detectedState ? `, ${detectedState}` : ''}`);
          } else {
            setLocationSuccessMsg('GPS coordinates captured. Please enter your city name.');
          }
        } catch (err: any) {
          console.warn('Geolocation lookup issue:', err);
          setError('Location coordinates detected, but address lookup failed. Please type city & state manually.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        setError(`Location access permission error (${err.message}).`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res: any = await api.get('/seller/profile');
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setProfile({
            companyName: data.companyName || '',
            contactPerson: data.contactPerson || '',
            description: data.description || '',
            publicEmail: data.publicEmail || '',
            publicPhone: data.publicPhone || '',
            whatsappPhone: data.whatsappPhone || '',
            addressLine: data.addressLine || '',
            city: data.city || '',
            state: data.state || '',
            postalCode: data.postalCode || '',
            websiteUrl: data.websiteUrl || '',
            mapUrl: data.mapUrl || '',
            latitude: data.latitude ? parseFloat(String(data.latitude)) : null,
            longitude: data.longitude ? parseFloat(String(data.longitude)) : null,
            publicContactEnabled: data.publicContactEnabled !== false,
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setProfile({ ...profile, [target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess(false);
      await api.patch('/seller/profile', profile);
      setSuccess(true);
      await refreshUser();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Company Profile & Contact Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          This information is displayed publicly to prospective bulk fabric buyers across India
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile changes saved and updated across all public listings.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6"
      >
        <CommonTextField
          label="Company / Mill Name *"
          name="companyName"
          value={profile.companyName}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CommonTextField
            label="Contact Person Name *"
            name="contactPerson"
            value={profile.contactPerson}
            onChange={handleChange}
            required
          />

          <CommonTextField
            label="Public Email"
            type="email"
            name="publicEmail"
            value={profile.publicEmail}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CommonTextField
            label="Public Phone (Calls) *"
            type="tel"
            name="publicPhone"
            value={profile.publicPhone}
            onChange={handleChange}
            required
          />

          <CommonTextField
            label="WhatsApp Phone Number"
            type="tel"
            name="whatsappPhone"
            value={profile.whatsappPhone}
            onChange={handleChange}
            placeholder="+91..."
          />
        </div>

        <CommonTextField
          label="Company Description"
          name="description"
          type="textarea"
          rows={3}
          value={profile.description}
          onChange={handleChange}
          placeholder="Tell buyers about your fabric specialities, weaving capacity, export stock history..."
        />

        {/* Location Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Mill / Warehouse Location
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                This location is automatically assigned to all your surplus fabric listings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-60 shrink-0"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fetching Location...
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" />
                  Auto-Detect via GPS
                </>
              )}
            </button>
          </div>

          {locationSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{locationSuccessMsg}</span>
            </div>
          )}

          <CommonTextField
            label="Warehouse / Mill Address Line"
            name="addressLine"
            value={profile.addressLine}
            onChange={handleChange}
            placeholder="e.g. Plot 42, Millenium Textile Market, Ring Road"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CommonTextField
              label="City *"
              name="city"
              value={profile.city}
              onChange={handleChange}
              required
            />

            <CommonTextField
              label="State *"
              name="state"
              value={profile.state}
              onChange={handleChange}
              required
            />

            <CommonTextField
              label="Postal Code"
              name="postalCode"
              value={profile.postalCode}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CommonTextField
            label="Google Maps Directions Link"
            type="url"
            name="mapUrl"
            value={profile.mapUrl}
            onChange={handleChange}
            placeholder="https://maps.google.com/?q=..."
          />

          <CommonTextField
            label="Company Website URL"
            type="url"
            name="websiteUrl"
            value={profile.websiteUrl}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              name="publicContactEnabled"
              checked={profile.publicContactEnabled}
              onChange={handleChange}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span>Enable Public Buyer Contact (Show Phone & WhatsApp on listing pages)</span>
          </label>

          <CommonButton
            type="submit"
            isLoading={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Profile
          </CommonButton>
        </div>
      </form>
    </div>
  );
}
