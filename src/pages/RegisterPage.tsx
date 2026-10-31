import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, Phone, Building2, User, MapPin, ArrowRight, AlertCircle, Clock, CheckCircle2, LocateFixed, Loader2, Sparkles, Check } from 'lucide-react';
import api from '../api/client';
import CommonTextField from '../components/widgets/common_textField';
import CommonButton from '../components/widgets/common_button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    city: '',
    state: '',
    addressLine: '',
    postalCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [locations, setLocations] = useState<{ city: string; state: string; count?: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState<{ companyName: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res: any = await api.get('/locations');
        const locs = res?.data?.data || res?.data || res || [];
        if (Array.isArray(locs) && locs.length > 0) {
          setLocations(locs);
        }
      } catch (err) {
        // silent fail
      }
    }
    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          if (!res.ok) throw new Error('Failed to reverse geocode');
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

          setFormData((prev) => ({
            ...prev,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
            postalCode: postal || prev.postalCode,
            addressLine: addressLine || prev.addressLine,
            latitude,
            longitude,
          }));

          if (detectedCity || detectedState) {
            setLocationSuccessMsg(`Location auto-detected: ${[detectedCity, detectedState].filter(Boolean).join(', ')}`);
          } else {
            setLocationSuccessMsg('GPS coordinates captured. Please enter your city and state name below.');
          }
        } catch (err: any) {
          console.warn('Geolocation lookup issue:', err);
          setError('Location coordinates detected, but city name lookup failed. Please enter your city and state manually.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        setError(`Location access permission error (${err.message}). Please enter your city and state manually.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectHub = (hub: { city: string; state: string }) => {
    setFormData((prev) => ({
      ...prev,
      city: hub.city,
      state: hub.state,
    }));
    setLocationSuccessMsg(`Location set: ${hub.city}, ${hub.state}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.city || !formData.state) {
      setError('Please fill in all required company details.');
      return;
    }
    if (!formData.email && !formData.phone) {
      setError('Either an email or phone number is required.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/auth/register', formData);
      setSubmittedData({
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 py-12 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-200/90 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
              Registration Under Review
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Awaiting Approval</h1>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              Thank you for registering <strong className="text-slate-800">{submittedData.companyName}</strong> on Dead Textile Marketplace.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Verification Status:</span>
              <span className="font-bold text-amber-600">Pending Admin Approval</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Registered Contact:</span>
              <span className="font-semibold text-slate-800">{submittedData.email || submittedData.phone}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            To ensure genuine textile surplus listings and legitimate trade, platform administrators inspect and approve all mill registrations before first login.
          </p>

          <Link
            to="/login"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2"
          >
            Go to Seller Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 py-12 font-sans text-slate-800">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-200/90">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3.5 shadow-sm font-bold">
            <Building2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register Seller Account</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            List surplus fabrics, dead stock rolls, and connect directly with bulk buyers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CommonTextField
            label="Company / Mill Name *"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Paramount Textile Mills Pvt Ltd"
            prefixIcon={<Building2 className="w-4 h-4" />}
            required
          />

          <CommonTextField
            label="Contact Person Name *"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="e.g. Rajesh Shah"
            prefixIcon={<User className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CommonTextField
              label="Official Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sales@company.com"
              prefixIcon={<Mail className="w-4 h-4" />}
              required
            />

            <CommonTextField
              label="Phone / WhatsApp *"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+919825123456"
              prefixIcon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          {/* Mill Location Section with Live GPS Auto-Detection */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Mill / Warehouse Location *
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Directly sets location for all your surplus fabric listings
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
                    Fetching GPS...
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3.5 h-3.5" />
                    Auto-Detect Location
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

            {/* Quick Hub Selection Chips from registered hubs */}
            {locations.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Or quick-pick textile hub:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {locations.slice(0, 8).map((hub) => {
                    const isSelected = formData.city.toLowerCase() === hub.city.toLowerCase();
                    return (
                      <button
                        key={hub.city}
                        type="button"
                        onClick={() => handleSelectHub(hub)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                        }`}
                      >
                        {hub.city}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* City & State inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <CommonTextField
                label="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. City"
                prefixIcon={<MapPin className="w-4 h-4" />}
                required
              />

              <CommonTextField
                label="State *"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. State"
                required
              />
            </div>
          </div>

          <CommonTextField
            label="Password (min 8 chars) *"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            prefixIcon={<Lock className="w-4 h-4" />}
            isPassword
            required
          />

          <CommonButton
            type="submit"
            isLoading={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-4"
          >
            Complete Registration
            {!loading && <ArrowRight className="w-4 h-4" />}
          </CommonButton>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
