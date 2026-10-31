import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, KeyRound, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../api/client';
import CommonTextField from '../components/widgets/common_textField';
import CommonButton from '../components/widgets/common_button';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your registered email address or phone number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res: any = await api.post('/auth/forgot-password', {
        identifier: identifier.trim(),
        role: 'SELLER',
      });

      const responseData = res?.data || res;
      setSuccessMsg(responseData?.message || 'Verification code generated for your seller account.');
      if (responseData?.resetCode) {
        setDevCode(responseData.resetCode);
        setCode(responseData.resetCode); // auto-fill for frictionless testing
      }
      setStep(2);
    } catch (err: any) {
      setError(err?.message || 'Unable to find an active seller account with these details.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res: any = await api.post('/auth/reset-password', {
        identifier: identifier.trim(),
        code: code.trim(),
        newPassword,
      });

      const responseData = res?.data || res;
      setSuccessMsg(responseData?.message || 'Your password has been reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Password reset failed. Please ensure the code is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-200/90">
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3.5 shadow-md font-bold">
            <KeyRound className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === 1 ? 'Reset Seller Password' : 'Enter New Password'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {step === 1
              ? 'Enter your registered seller email or mobile number to receive a verification OTP'
              : 'Enter the 6-digit code and choose a new secure password'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {devCode && step === 2 && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Dev Preview OTP:</span>
            </div>
            <code className="bg-amber-100/90 px-2.5 py-1 rounded-lg font-mono font-bold text-amber-800 tracking-wider">
              {devCode}
            </code>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <CommonTextField
              label="Seller Email or Phone Number"
              placeholder="e.g. shivbaba@gmail.com / 9512464749"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              prefixIcon={<Mail className="w-4 h-4" />}
              required
            />

            <CommonButton
              type="submit"
              isLoading={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
            >
              Send Reset Code
              {!loading && <ArrowRight className="w-4 h-4" />}
            </CommonButton>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <CommonTextField
              label="6-Digit Reset Code"
              placeholder="123456"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value)}
              prefixIcon={<KeyRound className="w-4 h-4" />}
              required
            />

            <CommonTextField
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              prefixIcon={<Lock className="w-4 h-4" />}
              isPassword
              required
            />

            <CommonTextField
              label="Confirm New Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              prefixIcon={<Lock className="w-4 h-4" />}
              isPassword
              required
            />

            <CommonButton
              type="submit"
              isLoading={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
            >
              Update Password
              {!loading && <ShieldCheck className="w-4 h-4" />}
            </CommonButton>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode('');
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-800 font-semibold py-1 flex items-center justify-center gap-1 mt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change account / Re-send OTP</span>
            </button>
          </form>
        )}

        <div className="mt-7 pt-5 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Seller Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
