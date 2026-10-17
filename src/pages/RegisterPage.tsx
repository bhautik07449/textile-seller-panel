import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, Phone, Building2, User, MapPin, ArrowRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState<{ companyName: string; email: string; phone: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            placeholder="e.g. Surat Tex Mills Pvt Ltd"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CommonTextField
              label="City *"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Surat"
              prefixIcon={<MapPin className="w-4 h-4" />}
              required
            />

            <CommonTextField
              label="State *"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Gujarat"
              required
            />
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
