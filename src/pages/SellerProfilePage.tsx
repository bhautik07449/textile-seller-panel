import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Save, CheckCircle2, AlertCircle } from 'lucide-react';
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
    publicContactEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res: any = await api.get('/seller/profile');
        if (res.data) {
          setProfile({
            companyName: res.data.companyName || '',
            contactPerson: res.data.contactPerson || '',
            description: res.data.description || '',
            publicEmail: res.data.publicEmail || '',
            publicPhone: res.data.publicPhone || '',
            whatsappPhone: res.data.whatsappPhone || '',
            addressLine: res.data.addressLine || '',
            city: res.data.city || '',
            state: res.data.state || '',
            postalCode: res.data.postalCode || '',
            websiteUrl: res.data.websiteUrl || '',
            mapUrl: res.data.mapUrl || '',
            publicContactEnabled: res.data.publicContactEnabled !== false,
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
