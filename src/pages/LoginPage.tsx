import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Lock, Mail, ArrowRight, AlertCircle, Building2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import CommonTextField from '../components/widgets/common_textField';
import CommonButton from '../components/widgets/common_button';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token && user.role === 'SELLER') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your email/phone and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res: any = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password,
      });

      const responseData = res?.data || res;

      if (responseData?.tokens?.accessToken) {
        if (responseData.user?.role !== 'SELLER') {
          setError('Access restricted: Only registered sellers can access this portal.');
          return;
        }
        login(responseData.user, responseData.tokens.accessToken, responseData.tokens.refreshToken);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Login failed: Unexpected response from server.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-200/90">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3.5 shadow-sm font-bold">
            <Package className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Seller Portal Login</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your surplus fabric listings and incoming buyer inquiries
          </p>
        </div>

        {error && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs flex items-start gap-3 shadow-2xs ${
              error.toLowerCase().includes('pending') || error.toLowerCase().includes('approval')
                ? 'bg-amber-50 border-amber-200 text-amber-900 font-medium'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {error.toLowerCase().includes('pending') || error.toLowerCase().includes('approval') ? (
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CommonTextField
            label="Email or Phone Number"
            placeholder="e.g. surat.tex@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            prefixIcon={<Mail className="w-4 h-4" />}
            required
          />

          <CommonTextField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            prefixIcon={<Lock className="w-4 h-4" />}
            isPassword
            required
          />

          <CommonButton
            type="submit"
            isLoading={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
          >
            Sign In to Dashboard
            {!loading && <ArrowRight className="w-4 h-4" />}
          </CommonButton>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have a seller account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Register Your Mill
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
